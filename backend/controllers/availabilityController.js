
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import Booking from "../models/Booking.js";

// ----------------------------------
// HELPERS
// ----------------------------------

const isValidTime = (time) =>
  typeof time === "string" &&
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

const isValidDate = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString || "")) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === dateString
  );
};

const getEndTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const totalMinutes = hours * 60 + minutes + duration * 60;

  // Do not allow bookings extending beyond midnight.
  if (totalMinutes >= 24 * 60) {
    return null;
  }

  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
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
// CHECK WORKSPACE AVAILABILITY
// ----------------------------------

export const checkAvailability = async (req, res) => {
  try {
    const {
      workspaceId,
      bookingDate,
      bookingType,
      startTime,
      duration,
    } = req.query;

    // Required fields
    if (!workspaceId || !bookingDate || !bookingType) {
      return res.status(400).json({
        success: false,
        message: "Workspace, date and booking type are required.",
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

    // Validate date
    if (!isValidDate(bookingDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date. Use YYYY-MM-DD.",
      });
    }

    const date = new Date(`${bookingDate}T00:00:00.000Z`);

    // Prevent past-date bookings.
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
        message: "Past dates cannot be booked.",
      });
    }

    // Find approved and active workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      approvalStatus: "approved",
      isActive: true,
    }).select("operatingHours capacity");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace is unavailable.",
      });
    }

    // Check operating hours
    const dayName = getDayName(date);
    const hours = workspace.operatingHours?.[dayName];

    if (
      !hours ||
      !hours.isOpen ||
      !isValidTime(hours.openingTime) ||
      !isValidTime(hours.closingTime) ||
      hours.openingTime >= hours.closingTime
    ) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Workspace is closed or has invalid operating hours.",
      });
    }

    let requestedStartTime = null;
    let requestedEndTime = hours.closingTime;

    // ----------------------------------
    // HOURLY BOOKING VALIDATION
    // ----------------------------------

    if (bookingType === "hourly") {
      const bookingDuration = Number(duration);

      if (
        !isValidTime(startTime) ||
        !Number.isInteger(bookingDuration) ||
        bookingDuration < 1 ||
        bookingDuration > 8
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid start time or duration.",
        });
      }

      requestedStartTime = startTime;
      requestedEndTime = getEndTime(startTime, bookingDuration);

      if (
        !requestedEndTime ||
        requestedStartTime < hours.openingTime ||
        requestedEndTime > hours.closingTime
      ) {
        return res.status(200).json({
          success: true,
          available: false,
          message: "Selected time is outside operating hours.",
        });
      }
    }

    // ----------------------------------
    // CHECK EXISTING BOOKINGS
    // ----------------------------------

    const existingBookings = await Booking.find({
      workspace: workspaceId,
      bookingDate: date,
      status: {
        $in: ["pending", "confirmed"],
      },
    }).select("bookingType startTime endTime");

    const hasConflict = existingBookings.some((booking) => {
      // Full-day bookings block the entire workspace.
      if (
        bookingType === "full-day" ||
        booking.bookingType === "full-day"
      ) {
        return true;
      }

      // Check hourly time overlap.
      return (
        requestedStartTime < booking.endTime &&
        requestedEndTime > booking.startTime
      );
    });

    if (hasConflict) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Workspace is already booked for this time.",
      });
    }

    // ----------------------------------
    // AVAILABLE RESPONSE
    // ----------------------------------

    return res.status(200).json({
      success: true,
      available: true,
      message: "Workspace is available.",
      availability: {
        workspaceId,
        date: bookingDate,
        bookingType,
        startTime: requestedStartTime,
        endTime: requestedEndTime,
        openingTime: hours.openingTime,
        closingTime: hours.closingTime,
      },
    });
  } catch (error) {
    console.error("Availability check error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check workspace availability.",
    });
  }
};
