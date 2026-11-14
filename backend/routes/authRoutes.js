
import express from "express";

import {
  registerCustomer,
  registerOwner,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Customer registration
router.post("/register", registerCustomer);

// Workspace owner registration
router.post("/register/owner", registerOwner);

// Customer and owner login
router.post("/login", loginUser);

// Get authenticated user
router.get("/me", protect, getCurrentUser);

// Update authenticated user profile
router.put("/profile", protect, updateUserProfile);

// Logout
router.post("/logout", logoutUser);

export default router;
