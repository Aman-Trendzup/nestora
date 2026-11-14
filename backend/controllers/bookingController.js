import mongoose from "mongoose";
import { randomBytes } from "crypto";

import Booking from "../models/Booking.js";
import Workspace from "../models/Workspace.js";
import BookingLock from "../models/BookingLock.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";
import { calculateBookingPrice } from "../utils/pricingCalculator.js";

// ----------------------------------
// HELPER FUNCTIONS
// ----------------------------------

const getPricingQuantity = (workspaceType, guests) => {
  const perPersonTypes = ["coworking"];

  return perPersonTypes.includes(workspaceType) ? guests : 1;
};

const getEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + duration * 60;

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
};

const isValidTime = (time) => {
  return typeof time === "string" &&
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
};

const getDayName = (date) => {
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return days[date.getUTCDay()];
};

// ----------------------------------
// CREATE BOOKING
// ----------------------------------

export const createBooking = async (req, res) => {
  let session;

  try {
    const {
      workspaceId,
      bookingDate,
      bookingType,
      startTime,
      duration,
      guests,
      specialRequests,
      couponCode,
    } = req.body;

    // Validate required fields
    if (
      !workspaceId ||
      !bookingDate ||
      !bookingType ||
      guests === undefined ||
      guests === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking details.",
      });
    }

    // Validate workspace ID
    if (!mongoose.isValidObjectId(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID.",
      });
    }

    // Validate booking type
    if (!["hourly", "full-day"].includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking type.",
      });
    }

    // Validate guests
    const guestCount = Number(guests);

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      return res.status(400).json({
        success: false,
        message: "Guest count must be at least 1.",
      });
    }

    // Validate date format
    if (
      typeof bookingDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date.",
      });
    }

    const date = new Date(`${bookingDate}T00:00:00.000Z`);

    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== bookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date.",
      });
    }

    // Prevent past-date bookings
    const today = new Date();

    const todayDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate()
      )
    );

    if (date < todayDate) {
      return res.status(400).json({
        success: false,
        message: "You cannot book a past date.",
      });
    }

    // Find approved and active workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      approvalStatus: "approved",
      isActive: true,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or unavailable.",
      });
    }

    // Check owner blocked dates
    const isDateBlocked = workspace.blockedDates?.some(
      (entry) => entry.date === bookingDate
    );
    if (isDateBlocked) {
      const blockedEntry = workspace.blockedDates.find(
        (entry) => entry.date === bookingDate
      );
      return res.status(400).json({
        success: false,
        message:
          blockedEntry?.reason ||
          "This date has been reserved or blocked by the workspace owner.",
      });
    }

    // Validate capacity
    if (guestCount > workspace.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum capacity is ${workspace.capacity} guests.`,
      });
    }

    // Validate operating hours
    const dayName = getDayName(date);

    const operatingHours = workspace.operatingHours?.[dayName];

    if (!operatingHours || !operatingHours.isOpen) {
      return res.status(400).json({
        success: false,
        message: "Workspace is closed on this date.",
      });
    }

    let endTime = operatingHours.closingTime;
    let bookingDuration = null;

    // Validate hourly booking
    if (bookingType === "hourly") {
      const hours = Number(duration);

      if (
        !Number.isInteger(hours) ||
        hours < 1 ||
        hours > 8 ||
        !isValidTime(startTime)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking time or duration.",
        });
      }

      bookingDuration = hours;

      endTime = getEndTime(startTime, hours);

      if (
        startTime < operatingHours.openingTime ||
        endTime > operatingHours.closingTime
      ) {
        return res.status(400).json({
          success: false,
          message: "Booking time is outside operating hours.",
        });
      }

      // Prevent past-time bookings for today
      if (bookingDate === todayDate.toISOString().slice(0, 10)) {
        const currentTime = `${String(today.getUTCHours()).padStart(
          2,
          "0"
        )}:${String(today.getUTCMinutes()).padStart(2, "0")}`;

        if (startTime <= currentTime) {
          return res.status(400).json({
            success: false,
            message: "You cannot book a time that has already passed.",
          });
        }
      }
    }

    // ----------------------------------
    // SERVER-SIDE PRICE CALCULATION (CENTRALIZED CATEGORY PRICING)
    // ----------------------------------

    let pricingResult;
    try {
      pricingResult = calculateBookingPrice(
        workspace,
        bookingType,
        bookingDuration || 1,
        guestCount
      );
    } catch (pricingError) {
      return res.status(400).json({
        success: false,
        message: pricingError.message,
      });
    }

    const {
      pricingType,
      unitPrice,
      unitLabel,
      quantity,
      subtotal,
      breakdownText,
    } = pricingResult;

    let appliedCoupon = null;
    let discountAmount = 0;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const foundCoupon = await Coupon.findOne({
        code: cleanCode,
        isActive: true,
      });

      if (!foundCoupon) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive coupon code.",
        });
      }

      const now = new Date();
      if (
        (foundCoupon.validFrom && now < foundCoupon.validFrom) ||
        (foundCoupon.validUntil && now > foundCoupon.validUntil)
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon code has expired.",
        });
      }

      if (
        foundCoupon.usageLimit !== null &&
        foundCoupon.usedCount >= foundCoupon.usageLimit
      ) {
        return res.status(400).json({
          success: false,
          message: "Coupon code has reached its usage limit.",
        });
      }

      if (subtotal < (foundCoupon.minBookingAmount || 0)) {
        return res.status(400).json({
          success: false,
          message: `Minimum booking value of ₹${foundCoupon.minBookingAmount} required for coupon ${cleanCode}.`,
        });
      }

      if (foundCoupon.discountType === "percentage") {
        discountAmount = (subtotal * foundCoupon.discountValue) / 100;
        if (foundCoupon.maxDiscount && discountAmount > foundCoupon.maxDiscount) {
          discountAmount = foundCoupon.maxDiscount;
        }
      } else if (foundCoupon.discountType === "flat") {
        discountAmount = Math.min(foundCoupon.discountValue, subtotal);
      }

      discountAmount = Math.round(discountAmount);
      appliedCoupon = foundCoupon;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    // ----------------------------------
    // ATOMIC BOOKING CREATION
    // ----------------------------------

    const lockId = `${workspaceId}_${bookingDate}`;

    // Create workspace-date lock if it doesn't exist
    try {
      await BookingLock.updateOne(
        { _id: lockId },
        {
          $setOnInsert: {
            workspace: workspaceId,
            bookingDate: date,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }

    session = await mongoose.startSession();

    let booking;

    try {
      await session.withTransaction(async () => {
        // Acquire lock for this workspace and date
        await BookingLock.updateOne(
          { _id: lockId },
          {
            $inc: { version: 1 },
          },
          { session }
        );

        // Revalidate workspace inside transaction
        const currentWorkspace = await Workspace.findOne({
          _id: workspaceId,
          approvalStatus: "approved",
          isActive: true,
        }).session(session);

        if (!currentWorkspace) {
          const error = new Error("WORKSPACE_UNAVAILABLE");
          error.code = "WORKSPACE_UNAVAILABLE";
          throw error;
        }

        // Check existing active bookings
        const existingBookings = await Booking.find({
          workspace: workspaceId,
          bookingDate: date,
          status: {
            $in: ["pending", "confirmed"],
          },
        }).session(session);

        const overlappingBookings = existingBookings.filter((existing) => {
          // Full-day bookings block the entire date
          if (
            bookingType === "full-day" ||
            existing.bookingType === "full-day"
          ) {
            return true;
          }

          // Check hourly overlap
          return (
            startTime < existing.endTime &&
            endTime > existing.startTime
          );
        });

        const isCoworking = currentWorkspace.type === "coworking";

        if (isCoworking) {
          const bookedSeats = overlappingBookings.reduce(
            (sum, b) => sum + (Number(b.guests) || 1),
            0
          );
          if (bookedSeats + guestCount > currentWorkspace.capacity) {
            const error = new Error("INSUFFICIENT_SEATS");
            error.code = "INSUFFICIENT_SEATS";
            throw error;
          }
        } else {
          const totalUnits = Math.max(
            1,
            Number(currentWorkspace.totalUnits) || 1
          );
          if (overlappingBookings.length >= totalUnits) {
            const error = new Error("BOOKING_CONFLICT");
            error.code = "BOOKING_CONFLICT";
            throw error;
          }
        }

        // Create booking inside transaction
        const createdBookings = await Booking.create(
          [
            {
              bookingReference: `NEST-${randomBytes(5)
                .toString("hex")
                .toUpperCase()}`,

              workspace: workspaceId,
              customer: req.user._id,

              bookingDate: date,
              bookingType,

              startTime:
                bookingType === "hourly"
                  ? startTime
                  : undefined,

              endTime,
              duration: bookingDuration,

              guests: guestCount,

              pricing: {
                pricingType,
                unitPrice,
                unitLabel,
                quantity,
                subtotal,
                discountAmount,
                totalAmount,
                currency:
                  currentWorkspace.pricing?.currency || "INR",
                breakdownText,
              },

              coupon: appliedCoupon
                ? {
                    code: appliedCoupon.code,
                    discountAmount,
                  }
                : undefined,

              specialRequests: specialRequests || "",
              status: "pending",
              paymentStatus: "unpaid",
            },
          ],
          { session }
        );

        booking = createdBookings[0];

        // Increment coupon usage count if applied
        if (appliedCoupon) {
          await Coupon.updateOne(
            { _id: appliedCoupon._id },
            { $inc: { usedCount: 1 } },
            { session }
          );
        }
      });
    } catch (error) {
      if (error.code === "BOOKING_CONFLICT") {
        return res.status(409).json({
          success: false,
          message:
            "This workspace is already booked for the selected time.",
        });
      }

      if (error.code === "WORKSPACE_UNAVAILABLE") {
        return res.status(404).json({
          success: false,
          message: "Workspace is no longer available.",
        });
      }

      throw error;
    } finally {
      await session.endSession();
      session = null;
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    if (error.code === "INSUFFICIENT_SEATS") {
      return res.status(409).json({
        success: false,
        message: "Not enough seats available for this time slot.",
      });
    }

    if (error.code === "BOOKING_CONFLICT") {
      return res.status(409).json({
        success: false,
        message: "This workspace is already booked for this time.",
      });
    }

    if (error.code === "WORKSPACE_UNAVAILABLE") {
      return res.status(400).json({
        success: false,
        message: "Workspace is unavailable.",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create booking.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ----------------------------------
// GET CUSTOMER BOOKINGS
// ----------------------------------

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      customer: req.user._id,
    })
      .populate(
        "workspace",
        "name slug type images address blockedDates operatingHours pricing capacity totalUnits"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch bookings.",
    });
  }
};

// ----------------------------------
// GET SINGLE CUSTOMER BOOKING
// ----------------------------------

export const getBookingById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    }).populate("workspace");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch booking.",
    });
  }
};

// ----------------------------------
// CANCEL CUSTOMER BOOKING
// ----------------------------------

export const cancelBooking = async (req, res) => {
  let session;

  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Find customer's booking
    const existingBooking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user._id,
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    const bookingDate = new Date(existingBooking.bookingDate);
    const dateString = bookingDate.toISOString().slice(0, 10);

    const lockId = `${existingBooking.workspace}_${dateString}`;

    // Ensure lock exists
    try {
      await BookingLock.updateOne(
        { _id: lockId },
        {
          $setOnInsert: {
            workspace: existingBooking.workspace,
            bookingDate,
          },
        },
        { upsert: true }
      );
    } catch (error) {
      if (error.code !== 11000) {
        throw error;
      }
    }

    session = await mongoose.startSession();

    let cancelledBooking;

    try {
      await session.withTransaction(async () => {
        // Acquire the same lock used during booking creation
        await BookingLock.updateOne(
          { _id: lockId },
          { $inc: { version: 1 } },
          { session }
        );

        const booking = await Booking.findOne({
          _id: req.params.id,
          customer: req.user._id,
        }).session(session);

        if (!booking) {
          const error = new Error("BOOKING_NOT_FOUND");
          error.code = "BOOKING_NOT_FOUND";
          throw error;
        }

        if (!["pending", "confirmed"].includes(booking.status)) {
          const error = new Error("BOOKING_NOT_CANCELLABLE");
          error.code = "BOOKING_NOT_CANCELLABLE";
          throw error;
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();

        await booking.save({ session });

        cancelledBooking = booking;
      });

    } catch (error) {
      if (error.code === "BOOKING_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Booking not found.",
        });
      }

      if (error.code === "BOOKING_NOT_CANCELLABLE") {
        return res.status(400).json({
          success: false,
          message: "This booking cannot be cancelled.",
        });
      }

      throw error;

    } finally {
      await session.endSession();
      session = null;
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking: cancelledBooking,
    });

  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel booking.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// ----------------------------------
// RESCHEDULE CUSTOMER BOOKING
// ----------------------------------

export const rescheduleBooking = async (req, res) => {
  let session;

  try {
    const { id } = req.params;
    const {
      newBookingDate,
      newBookingType,
      newStartTime,
      newDuration,
      reason,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    if (!newBookingDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new booking date.",
      });
    }

    // Find customer's active booking
    const existingBooking = await Booking.findOne({
      _id: id,
      customer: req.user._id,
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (!["pending", "confirmed"].includes(existingBooking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule a ${existingBooking.status} booking.`,
      });
    }

    // Validate new target date
    const targetDate = new Date(`${newBookingDate}T00:00:00.000Z`);
    if (
      Number.isNaN(targetDate.getTime()) ||
      targetDate.toISOString().slice(0, 10) !== newBookingDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid new booking date format. Use YYYY-MM-DD.",
      });
    }

    const today = new Date();
    const todayDate = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );

    if (targetDate < todayDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule to a past date.",
      });
    }

    // Find workspace
    const workspace = await Workspace.findOne({
      _id: existingBooking.workspace,
      approvalStatus: "approved",
      isActive: true,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace is no longer available.",
      });
    }

    // Check owner blocked dates
    const isDateBlocked = workspace.blockedDates?.some(
      (entry) => entry.date === newBookingDate
    );
    if (isDateBlocked) {
      const blockedEntry = workspace.blockedDates.find(
        (entry) => entry.date === newBookingDate
      );
      return res.status(400).json({
        success: false,
        message:
          blockedEntry?.reason ||
          "This date has been marked as unavailable by the owner.",
      });
    }

    const bookingTypeToUse = newBookingType || existingBooking.bookingType;
    const dayName = getDayName(targetDate);
    const operatingHours = workspace.operatingHours?.[dayName];

    if (!operatingHours || !operatingHours.isOpen) {
      return res.status(400).json({
        success: false,
        message: `Workspace is closed on ${dayName}.`,
      });
    }

    let targetStartTime = newStartTime || existingBooking.startTime;
    let targetDuration = newDuration ? Number(newDuration) : existingBooking.duration;
    let targetEndTime = operatingHours.closingTime;

    if (bookingTypeToUse === "hourly") {
      if (!targetStartTime || !isValidTime(targetStartTime)) {
        return res.status(400).json({
          success: false,
          message: "A valid start time is required for hourly bookings.",
        });
      }

      if (!targetDuration || targetDuration < 1 || targetDuration > 8) {
        return res.status(400).json({
          success: false,
          message: "Duration must be between 1 and 8 hours.",
        });
      }

      targetEndTime = getEndTime(targetStartTime, targetDuration);

      if (
        targetStartTime < operatingHours.openingTime ||
        targetEndTime > operatingHours.closingTime
      ) {
        return res.status(400).json({
          success: false,
          message: `Booking must fall within operating hours (${operatingHours.openingTime} - ${operatingHours.closingTime}).`,
        });
      }

      // If rescheduling for today, ensure start time is in the future
      if (newBookingDate === todayDate.toISOString().slice(0, 10)) {
        const currentTime = `${String(today.getUTCHours()).padStart(2, "0")}:${String(
          today.getUTCMinutes()
        ).padStart(2, "0")}`;
        if (targetStartTime <= currentTime) {
          return res.status(400).json({
            success: false,
            message: "Cannot reschedule to a start time that has already passed today.",
          });
        }
      }
    }

    // ----------------------------------
    // RECALCULATE PRICING ACCORDING TO NEW TIMING / DURATION
    // ----------------------------------
    // Fallback to existing booking pricing if workspace record had legacy or missing pricing
    if (
      !workspace.pricing ||
      (!workspace.pricing.hourly?.price && !workspace.pricing.daily?.price)
    ) {
      if (existingBooking.pricing?.unitPrice) {
        workspace.pricing = {
          pricingType:
            existingBooking.pricing.pricingType ||
            (workspace.type === "coworking" ? "per_person" : "per_space"),
          hourly: {
            enabled: true,
            price:
              existingBooking.bookingType === "hourly"
                ? existingBooking.pricing.unitPrice
                : Math.max(1, Math.round(existingBooking.pricing.unitPrice / 5)),
          },
          daily: {
            enabled: true,
            price:
              existingBooking.bookingType === "full-day"
                ? existingBooking.pricing.unitPrice
                : Math.max(1, Math.round(existingBooking.pricing.unitPrice * 5)),
          },
          currency: existingBooking.pricing.currency || "INR",
        };
      }
    }

    let calculatedPricing;
    try {
      calculatedPricing = calculateBookingPrice(
        workspace,
        bookingTypeToUse,
        bookingTypeToUse === "hourly" ? targetDuration : 1,
        existingBooking.guests || 1
      );
    } catch (pricingErr) {
      return res.status(400).json({
        success: false,
        message: pricingErr.message,
      });
    }

    let discountAmount = 0;
    if (existingBooking.coupon?.code) {
      const couponDoc = await Coupon.findOne({
        code: existingBooking.coupon.code,
      });
      if (couponDoc) {
        if (couponDoc.discountType === "percentage") {
          discountAmount =
            (calculatedPricing.subtotal * couponDoc.discountValue) / 100;
          if (
            couponDoc.maxDiscount &&
            discountAmount > couponDoc.maxDiscount
          ) {
            discountAmount = couponDoc.maxDiscount;
          }
        } else if (couponDoc.discountType === "flat") {
          discountAmount = Math.min(
            couponDoc.discountValue,
            calculatedPricing.subtotal
          );
        }
        discountAmount = Math.round(discountAmount);
      } else {
        discountAmount = Math.min(
          existingBooking.pricing?.discountAmount || 0,
          calculatedPricing.subtotal
        );
      }
    }

    const totalAmount = Math.max(
      0,
      calculatedPricing.subtotal - discountAmount
    );

    // Prepare lock on the target date
    const targetLockId = `${workspace._id}_${newBookingDate}`;

    try {
      await BookingLock.updateOne(
        { _id: targetLockId },
        {
          $setOnInsert: {
            workspace: workspace._id,
            bookingDate: targetDate,
          },
        },
        { upsert: true }
      );
    } catch (lockErr) {
      if (lockErr.code !== 11000) throw lockErr;
    }

    session = await mongoose.startSession();
    let updatedBooking;
    let oldScheduleText = "";

    try {
      await session.withTransaction(async () => {
        // Acquire target lock
        await BookingLock.updateOne(
          { _id: targetLockId },
          { $inc: { version: 1 } },
          { session }
        );

        // Check for conflicts on new date/time (excluding current booking)
        const conflictingBookings = await Booking.find({
          workspace: workspace._id,
          bookingDate: targetDate,
          status: { $in: ["pending", "confirmed"] },
          _id: { $ne: existingBooking._id },
        }).session(session);

        const overlappingBookings = conflictingBookings.filter((existing) => {
          if (
            bookingTypeToUse === "full-day" ||
            existing.bookingType === "full-day"
          ) {
            return true;
          }
          return (
            targetStartTime < existing.endTime &&
            targetEndTime > existing.startTime
          );
        });

        const isCoworking = workspace.type === "coworking";

        if (isCoworking) {
          const bookedSeats = overlappingBookings.reduce(
            (sum, b) => sum + (Number(b.guests) || 1),
            0
          );
          if (bookedSeats + existingBooking.guests > workspace.capacity) {
            const error = new Error("INSUFFICIENT_SEATS");
            error.code = "INSUFFICIENT_SEATS";
            throw error;
          }
        } else {
          const totalUnits = Math.max(1, Number(workspace.totalUnits) || 1);
          if (overlappingBookings.length >= totalUnits) {
            const error = new Error("BOOKING_CONFLICT");
            error.code = "BOOKING_CONFLICT";
            throw error;
          }
        }

        const bDoc = await Booking.findById(existingBooking._id).session(session);

        const prevDateStr = new Date(bDoc.bookingDate).toISOString().slice(0, 10);
        oldScheduleText = `${prevDateStr} (${
          bDoc.bookingType === "hourly"
            ? `${bDoc.startTime} - ${bDoc.endTime}`
            : "Full Day"
        })`;

        bDoc.rescheduleHistory.push({
          previousBookingDate: bDoc.bookingDate,
          previousStartTime: bDoc.startTime,
          previousEndTime: bDoc.endTime,
          previousDuration: bDoc.duration,
          previousTotalAmount:
            bDoc.pricing?.totalAmount || bDoc.pricing?.subtotal || 0,
          rescheduledAt: new Date(),
          reason: reason || "",
        });

        bDoc.bookingDate = targetDate;
        bDoc.bookingType = bookingTypeToUse;

        if (bookingTypeToUse === "hourly") {
          bDoc.startTime = targetStartTime;
          bDoc.endTime = targetEndTime;
          bDoc.duration = targetDuration;
        } else {
          bDoc.startTime = undefined;
          bDoc.endTime = undefined;
          bDoc.duration = undefined;
        }

        // Update pricing with newly calculated rates, duration, and totals
        bDoc.pricing = {
          pricingType: calculatedPricing.pricingType,
          unitPrice: calculatedPricing.unitPrice,
          unitLabel: calculatedPricing.unitLabel,
          quantity: calculatedPricing.quantity,
          subtotal: calculatedPricing.subtotal,
          discountAmount,
          totalAmount,
          currency: calculatedPricing.currency || "INR",
          breakdownText: calculatedPricing.breakdownText,
        };

        if (bDoc.coupon) {
          bDoc.coupon.discountAmount = discountAmount;
        }

        bDoc.rescheduledAt = new Date();
        await bDoc.save({ session });

        await bDoc.populate(
          "workspace",
          "name slug type images address blockedDates operatingHours pricing capacity totalUnits"
        );

        updatedBooking = bDoc;
      });
    } catch (transErr) {
      if (transErr.code === "INSUFFICIENT_SEATS") {
        return res.status(409).json({
          success: false,
          message: "Not enough seats available on the new date/time to reschedule.",
        });
      }
      if (transErr.code === "BOOKING_CONFLICT") {
        return res.status(409).json({
          success: false,
          message: "The requested new date and time slot is already booked.",
        });
      }
      throw transErr;
    } finally {
      await session.endSession();
      session = null;
    }

    return res.status(200).json({
      success: true,
      message: "Booking rescheduled successfully.",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reschedule booking.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};
