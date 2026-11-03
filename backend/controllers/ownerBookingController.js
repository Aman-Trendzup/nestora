import mongoose from "mongoose";

import Booking from "../models/Booking.js";
import Workspace from "../models/Workspace.js";
import BookingLock from "../models/BookingLock.js";

/* ----------------------------------
   REUSABLE HELPERS
---------------------------------- */

// Only workspace owners can access these endpoints.
const isOwner = (req) => req.user?.role === "owner";

// Populate only information required by the owner dashboard.
const populateBooking = (query) => {
  return query
    .populate({
      path: "workspace",
      select: "name slug type address images pricing",
    })
    .populate({
      path: "customer",
      select: "fullName email phone",
    });
};

/* ----------------------------------
   GET ALL OWNER RESERVATIONS
---------------------------------- */

export const getOwnerBookings = async (req, res) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owners can access reservations.",
      });
    }

    const {
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));

    // Find workspaces belonging to the logged-in owner.
    const ownerWorkspaces = await Workspace.find({
      owner: req.user._id,
    }).select("_id");

    const workspaceIds = ownerWorkspaces.map(
      (workspace) => workspace._id
    );

    const filter = {
      workspace: { $in: workspaceIds },
    };

    // Optional status filter.
    if (status) {
      const allowedStatuses = [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "rejected",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking status.",
        });
      }

      filter.status = status;
    }

    const totalBookings = await Booking.countDocuments(filter);

    const bookings = await populateBooking(
      Booking.find(filter)
    )
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    return res.status(200).json({
      success: true,
      totalBookings,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalBookings / limitNumber),
      bookings,
    });
  } catch (error) {
    console.error("Get owner bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reservations.",
    });
  }
};

/* ----------------------------------
   GET SINGLE OWNER RESERVATION
---------------------------------- */

export const getOwnerBookingById = async (req, res) => {
  try {
    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owners can access reservations.",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Find the booking without populating customer data first.
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    // Verify that this booking belongs to the owner's workspace.
    const workspace = await Workspace.findOne({
      _id: booking.workspace,
      owner: req.user._id,
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this reservation.",
      });
    }

    // Fetch the booking with limited populated fields.
    const populatedBooking = await populateBooking(
      Booking.findById(id)
    );

    return res.status(200).json({
      success: true,
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("Get owner booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reservation details.",
    });
  }
};

/* ----------------------------------
   UPDATE OWNER RESERVATION STATUS
---------------------------------- */

export const updateOwnerBookingStatus = async (req, res) => {
  let session;

  try {
    if (!isOwner(req)) {
      return res.status(403).json({
        success: false,
        message: "Only workspace owners can manage reservations.",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate booking ID.
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    // Owners can only perform these status updates.
    const allowedStatuses = [
      "confirmed",
      "rejected",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use confirmed, rejected or completed.",
      });
    }

    // Initial booking lookup.
    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    // Verify workspace ownership.
    const workspace = await Workspace.findOne({
      _id: existingBooking.workspace,
      owner: req.user._id,
    });

    if (!workspace) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage this reservation.",
      });
    }

    // Generate the same lock ID used by booking creation/cancellation.
    const dateKey = existingBooking.bookingDate
      .toISOString()
      .slice(0, 10);

    const lockId = `${existingBooking.workspace}_${dateKey}`;

    // Ensure the booking lock exists.
    await BookingLock.updateOne(
      { _id: lockId },
      {
        $setOnInsert: {
          workspace: existingBooking.workspace,
          bookingDate: existingBooking.bookingDate,
        },
      },
      { upsert: true }
    );

    session = await mongoose.startSession();

    // Update booking status inside a transaction.
    await session.withTransaction(async () => {
      // Acquire the same lock used by booking creation/cancellation.
      await BookingLock.updateOne(
        { _id: lockId },
        { $inc: { version: 1 } },
        { session }
      );

      const booking = await Booking.findById(id).session(session);

      if (!booking) {
        throw new Error("BOOKING_NOT_FOUND");
      }

      // Recheck ownership inside the transaction.
      const ownedWorkspace = await Workspace.findOne({
        _id: booking.workspace,
        owner: req.user._id,
      }).session(session);

      if (!ownedWorkspace) {
        throw new Error("NOT_AUTHORIZED");
      }

      // Pending -> Confirmed or Rejected.
      if (
        ["confirmed", "rejected"].includes(status) &&
        booking.status !== "pending"
      ) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      // Confirmed -> Completed.
      if (
        status === "completed" &&
        booking.status !== "confirmed"
      ) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      booking.status = status;

      await booking.save({ session });
    });

    // Fetch updated booking with customer and workspace details.
    const updatedBooking = await populateBooking(
      Booking.findById(id)
    );

    return res.status(200).json({
      success: true,
      message: `Reservation ${status} successfully.`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update owner booking status error:", error);

    const knownErrors = {
      BOOKING_NOT_FOUND: [
        404,
        "Reservation not found.",
      ],
      NOT_AUTHORIZED: [
        403,
        "You are not authorized to manage this reservation.",
      ],
      INVALID_STATUS_TRANSITION: [
        400,
        "This reservation cannot be moved to the requested status.",
      ],
    };

    if (knownErrors[error.message]) {
      const [statusCode, message] = knownErrors[error.message];

      return res.status(statusCode).json({
        success: false,
        message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update reservation status.",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};