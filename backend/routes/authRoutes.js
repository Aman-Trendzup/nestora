
import express from "express";

import {
  registerCustomer,
  registerOwner,
  loginCustomer,
  getCurrentUser,
  logoutCustomer,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();

// Customer registration
router.post("/register", registerCustomer);

// Owner registration
router.post("/register/owner", registerOwner);

// Customer login
router.post("/login", loginCustomer);

// Get logged-in user
router.get("/me", protect, getCurrentUser);

// Customer logout
router.post("/logout", logoutCustomer);

export default router;
