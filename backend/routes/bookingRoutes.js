
import express from "express";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
} from "../controllers/bookingController.js";

import {
  getOwnerBookings,
  getOwnerBookingById,
  updateOwnerBookingStatus,
} from "../controllers/ownerBookingController.js";

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// ----------------------------------
// CUSTOMER BOOKING ROUTES
// ----------------------------------

// Create a booking
router.post("/", createBooking);

// Get logged-in customer's bookings
router.get("/my-bookings", getMyBookings);

// Cancel a booking
router.patch("/:id/cancel", cancelBooking);

// Reschedule a booking
router.patch("/:id/reschedule", rescheduleBooking);

// ----------------------------------
// OWNER RESERVATION ROUTES
// Only authenticated owners can access these routes
// ----------------------------------

// Get all reservations for owner's workspaces
router.get(
  "/owner/my-reservations",
  authorizeRoles("owner"),
  getOwnerBookings
);

// Get a single reservation
router.get(
  "/owner/my-reservations/:id",
  authorizeRoles("owner"),
  getOwnerBookingById
);

// Confirm, reject or complete a reservation
router.patch(
  "/owner/my-reservations/:id/status",
  authorizeRoles("owner"),
  updateOwnerBookingStatus
);

// ----------------------------------
// SINGLE BOOKING ROUTE
// Keep this after specific routes
// ----------------------------------

router.get("/:id", getBookingById);

export default router;
