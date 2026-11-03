
import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
  checkAvailability,
} from "../controllers/availabilityController.js";

const router = express.Router();

// All availability routes require authentication
router.use(protect);

// Check workspace availability
router.get("/", checkAvailability);

export default router;
