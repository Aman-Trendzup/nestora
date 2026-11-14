import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    maxDiscount: {
      type: Number,
      min: 0,
      default: null, // Only applicable for percentage discounts
    },
    minBookingAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.index({ code: 1, isActive: 1 });

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;

