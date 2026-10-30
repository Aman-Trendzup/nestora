import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

// Middleware
app.use(
cors({
origin: process.env.CLIENT_URL || "http://localhost:5173",
credentials: true,
})
);

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", authRoutes);

// Health check API
app.get("/", (req, res) => {
res.status(200).json({
success: true,
message: "NESTORA API is running successfully!",
});
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`NESTORA server running on port ${PORT}`);
  });
};

startServer();