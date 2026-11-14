import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminUserById,
  updateUserStatus,
  getAdminWorkspaces,
  updateAdminWorkspaceApproval,
  updateAdminWorkspaceStatus,
  getAdminBookings,
  getAdminBookingById,
  updateAdminBookingStatus,
} from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and "admin" role
router.use(protect);
router.use(authorizeRoles("admin"));

// -------------------------------------------------------------
// 1. Dashboard & Platform Statistics
// -------------------------------------------------------------
router.get("/dashboard/stats", getAdminDashboardStats);

// -------------------------------------------------------------
// 2. User Management
// -------------------------------------------------------------
router.get("/users", getAdminUsers);
router.get("/users/:id", getAdminUserById);
router.patch("/users/:id/status", updateUserStatus);

// -------------------------------------------------------------
// 3. Workspace Listing Approvals & Inventory Management
// -------------------------------------------------------------
router.get("/workspaces", getAdminWorkspaces);
router.patch("/workspaces/:id/approval", updateAdminWorkspaceApproval);
router.patch("/workspaces/:id/status", updateAdminWorkspaceStatus);

// -------------------------------------------------------------
// 4. Platform Reservation Management
// -------------------------------------------------------------
router.get("/bookings", getAdminBookings);
router.get("/bookings/:id", getAdminBookingById);
router.patch("/bookings/:id/status", updateAdminBookingStatus);

export default router;

