import express from "express";
import {
  applyCoupon,
  getAvailableCoupons,
  createCoupon,
} from "../controllers/couponController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Apply / validate coupon code
router.post("/apply", applyCoupon);

// Public / Authenticated: Get active promotional coupons
router.get("/active", getAvailableCoupons);

// Admin / Owner: Create new coupon
router.post("/", protect, authorizeRoles("admin", "owner"), createCoupon);

export default router;

