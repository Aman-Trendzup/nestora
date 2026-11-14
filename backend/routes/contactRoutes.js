import express from "express";
import { submitContactMessage, getContactMessages } from "../controllers/contactController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Submit a contact message
router.post("/", submitContactMessage);

// Admin: View all incoming contact messages
router.get("/", protect, authorizeRoles("admin"), getContactMessages);

export default router;

