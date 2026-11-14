import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import connectDB from "../config/db.js";

dotenv.config();

export const autoSeedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "admin@nestora.com").trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
    const adminName = process.env.ADMIN_NAME || "Super Admin";

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      admin.role = "admin";
      admin.isActive = true;
      admin.fullName = adminName;
      admin.password = adminPassword; // Will trigger bcrypt hash via pre-save hook
      await admin.save();
      console.log(`[Admin] Admin account password & role synced: ${adminEmail}`);
    } else {
      admin = await User.create({
        fullName: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
        termsAcceptedAt: new Date(),
      });
      console.log(`[Admin] Default Super Admin auto-created: ${adminEmail}`);
    }
  } catch (error) {
    console.error("[Admin] Auto-seed error (non-fatal):", error.message);
  }
};

