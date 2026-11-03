
import express from "express";

import { createWorkspace, getAllWorkspaces, getWorkspaceBySlug, updateWorkspace, deleteWorkspace, getOwnerWorkspaces, updateWorkspaceApproval, searchWorkspaces} from "../controllers/workspaceController.js";

import {
  protect,
  authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Owner creates a workspace
router.post(
  "/",
  protect,
  authorizeRoles("owner"),
  createWorkspace
);

// Public: Get all approved workspaces
router.get("/", getAllWorkspaces);

router.get("/:slug", getWorkspaceBySlug);

router.put(
  "/:id",
  protect,
  authorizeRoles("owner"),
  updateWorkspace
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("owner"),
  deleteWorkspace
);

router.get(
  "/owner/my-workspaces",
  protect,
  authorizeRoles("owner"),
  getOwnerWorkspaces
);

router.patch(
  "/:id/approval",
  protect,
  authorizeRoles("admin"),
  updateWorkspaceApproval
);

router.get("/search", searchWorkspaces);

export default router;
