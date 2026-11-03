import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js"

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
// API ROUTES
// ----------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/availability", availabilityRoutes);

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
// SERVER
// ----------------------------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`NESTORA server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start NESTORA server:", error.message);
    process.exit(1);
  }
};

startServer();