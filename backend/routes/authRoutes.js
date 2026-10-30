
import express from "express";
import {
  registerCustomer,
  loginCustomer,
} from "../controllers/authController.js";

const router = express.Router();

// Customer registration
router.post("/register", registerCustomer);

// Customer login
router.post("/login", loginCustomer);

export default router;
