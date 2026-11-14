
import express from "express";

import {
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
  updateWorkspace,
  deleteWorkspace,
  deleteWorkspaceImage,
  getOwnerWorkspaces,
  updateWorkspaceApproval,
  searchWorkspaces,
  addBlockedDate,
  removeBlockedDate,
  getBlockedDates,
} from "../controllers/workspaceController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

import { uploadWorkspaceImages } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Owner creates a workspace (supports self-hosted image uploads)
router.post(
  "/",
  protect,
  authorizeRoles("owner"),
  uploadWorkspaceImages,
  createWorkspace
);

// Public: Get all approved workspaces
router.get("/", getAllWorkspaces);

// Public: Search workspaces (Must be before /:slug)
router.get("/search", searchWorkspaces);

// Owner: Get workspaces belonging to current owner (Must be before /:slug)
router.get(
  "/owner/my-workspaces",
  protect,
  authorizeRoles("owner"),
  getOwnerWorkspaces
);

// Public: Get single workspace by slug
router.get("/:slug", getWorkspaceBySlug);


// Owner: Update workspace (supports uploading new images & retaining existing ones)
router.put(
  "/:id",
  protect,
  authorizeRoles("owner"),
  uploadWorkspaceImages,
  updateWorkspace
);

// Owner: Delete individual workspace image
router.delete(
  "/:id/images/:filename",
  protect,
  authorizeRoles("owner"),
  deleteWorkspaceImage
);

// Owner: Delete workspace
router.delete(
  "/:id",
  protect,
  authorizeRoles("owner"),
  deleteWorkspace
);

// Admin: Approve/Reject workspace
router.patch(
  "/:id/approval",
  protect,
  authorizeRoles("admin"),
  updateWorkspaceApproval
);

// Owner: Blocked Dates Management
router.get("/:id/blocked-dates", protect, getBlockedDates);
router.post(
  "/:id/blocked-dates",
  protect,
  authorizeRoles("owner", "admin"),
  addBlockedDate
);
router.delete(
  "/:id/blocked-dates/:date",
  protect,
  authorizeRoles("owner", "admin"),
  removeBlockedDate
);

export default router;
