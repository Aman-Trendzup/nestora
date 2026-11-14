import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { seedInitialCoupons } from "./controllers/couponController.js";
import { autoSeedAdmin } from "./scripts/seedAdmin.js";
import { UPLOAD_ROOT } from "./utils/imageStorage.js";

dotenv.config();

const app = express();

// ----------------------------------
// MIDDLEWARE
// ----------------------------------

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ----------------------------------
// STATIC UPLOADS SERVING
// ----------------------------------
app.use("/uploads", express.static(UPLOAD_ROOT));

// ----------------------------------
// SERVERLESS DATABASE MIDDLEWARE
// Ensures database is connected before handling requests on Vercel
// ----------------------------------
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database initialization error:", err.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// ----------------------------------
// API ROUTES
// ----------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);

// ----------------------------------
// HEALTH CHECK
// ----------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NESTORA API is running successfully!",
  });
});

// ----------------------------------
// SERVER STARTUP (Local Dev Only)
// On Vercel (production), Vercel invokes the exported `app` serverlessly.
// In local development, app.listen() starts the persistent server.
// ----------------------------------

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  const startServer = async () => {
    try {
      await connectDB();
      await seedInitialCoupons();
      await autoSeedAdmin();

      app.listen(PORT, () => {
        console.log(`NESTORA server running on port ${PORT}`);
      });
    } catch (error) {
      console.error("Failed to start NESTORA server:", error.message);
      process.exit(1);
    }
  };

  startServer();
}

export default app;