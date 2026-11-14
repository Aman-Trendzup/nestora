
import mongoose from "mongoose";
import Workspace from "../models/Workspace.js";
import Booking from "../models/Booking.js";

// HELPERS

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
    }).select("operatingHours capacity blockedDates type totalUnits pricing");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace is unavailable.",
      });
    }

    const requestedGuests = Math.max(1, Math.floor(Number(req.query.guests) || 1));

    // Validate guest capacity
    if (requestedGuests > workspace.capacity) {
      return res.status(200).json({
        success: true,
        available: false,
        message: `Requested ${requestedGuests} guests exceeds maximum seating capacity of ${workspace.capacity} people.`,
      });
    }

    // Validate duration availability from pricing settings
    const rawPricing = workspace.pricing || {};
    const hourlyEnabled = Boolean(
      rawPricing.hourly?.enabled ??
      (typeof rawPricing.hourly === "number" ? rawPricing.hourly > 0 : true)
    );
    const dailyEnabled = Boolean(
      rawPricing.daily?.enabled ??
      (typeof rawPricing.fullDay === "number" ? rawPricing.fullDay > 0 : true)
    );

    if (bookingType === "hourly" && !hourlyEnabled) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Hourly bookings are currently not offered for this workspace.",
      });
    }

    if (bookingType === "full-day" && !dailyEnabled) {
      return res.status(200).json({
        success: true,
        available: false,
        message: "Daily bookings are currently not offered for this workspace.",
      });
    }

    // Check if the owner has manually blocked this date
    const blockedEntry = workspace.blockedDates?.find(
      (entry) => entry.date === bookingDate
    );
    if (blockedEntry) {
      return res.status(200).json({
        success: true,
        available: false,
        reason: blockedEntry.reason || "This date has been reserved/blocked by the workspace owner.",
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
    // CHECK EXISTING BOOKINGS (CATEGORY-AWARE CONFLICT MANAGEMENT)
    // ----------------------------------

    const existingBookings = await Booking.find({
      workspace: workspaceId,
      bookingDate: date,
      status: {
        $in: ["pending", "confirmed"],
      },
    }).select("bookingType startTime endTime guests");

    const overlappingBookings = existingBookings.filter((booking) => {
      // Full-day bookings overlap the entire day
      if (
        bookingType === "full-day" ||
        booking.bookingType === "full-day"
      ) {
        return true;
      }

      // Check hourly time overlap
      return (
        requestedStartTime < booking.endTime &&
        requestedEndTime > booking.startTime
      );
    });

    const isCoworking = workspace.type === "coworking";

    if (isCoworking) {
      // Coworking: Track individual seats occupied
      const totalBookedSeats = overlappingBookings.reduce(
        (sum, b) => sum + (Number(b.guests) || 1),
        0
      );
      const remainingSeats = workspace.capacity - totalBookedSeats;

      if (remainingSeats < requestedGuests) {
        return res.status(200).json({
          success: true,
          available: false,
          remainingSeats: Math.max(0, remainingSeats),
          message:
            remainingSeats <= 0
              ? "All seats in this coworking space are booked for the selected time."
              : `Only ${remainingSeats} seat(s) remaining, but ${requestedGuests} were requested.`,
        });
      }
    } else {
      // Private Office, Meeting Room, Conference Room: Track physical units
      const totalUnits = Math.max(1, Number(workspace.totalUnits) || 1);
      const bookedUnits = overlappingBookings.length;
      const remainingUnits = totalUnits - bookedUnits;

      if (remainingUnits <= 0) {
        const unitName =
          workspace.type === "private-office"
            ? "private office"
            : workspace.type === "meeting-room"
              ? "meeting room"
              : "conference room";

        return res.status(200).json({
          success: true,
          available: false,
          remainingUnits: 0,
          message: `This ${unitName} is already reserved for the selected time.`,
        });
      }
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
