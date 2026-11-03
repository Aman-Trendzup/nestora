import mongoose from "mongoose";
import { randomBytes } from "crypto";

import Booking from "../models/Booking.js";
import Workspace from "../models/Workspace.js";
import BookingLock from "../models/BookingLock.js";

// ----------------------------------
// HELPER FUNCTIONS
// ----------------------------------

const getPricingQuantity = (workspaceType, guests) => {
  const perPersonTypes = ["coworking", "dedicated-desk"];

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
    // SERVER-SIDE PRICE CALCULATION
    // ----------------------------------

    const quantity = getPricingQuantity(
      workspace.type,
      guestCount
    );

    const unitPrice =
      bookingType === "hourly"
        ? workspace.pricing?.hourly
        : workspace.pricing?.fullDay;

    if (
      typeof unitPrice !== "number" ||
      !Number.isFinite(unitPrice) ||
      unitPrice <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Pricing is not configured for this booking type.",
      });
    }

    const totalAmount =
      unitPrice *
      (bookingType === "hourly" ? bookingDuration : 1) *
      quantity;

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

        const hasConflict = existingBookings.some((existing) => {
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

        if (hasConflict) {
          const error = new Error("BOOKING_CONFLICT");
          error.code = "BOOKING_CONFLICT";
          throw error;
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
                unitPrice,
                quantity,
                totalAmount,
                currency:
                  currentWorkspace.pricing?.currency || "INR",
              },

              specialRequests: specialRequests || "",
              status: "pending",
              paymentStatus: "unpaid",
            },
          ],
          { session }
        );

        booking = createdBookings[0];
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

    return res.status(500).json({
      success: false,
      message: "Unable to create booking.",
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
        "name slug type images address"
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