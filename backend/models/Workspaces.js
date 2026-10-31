
import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    // Basic workspace information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "coworking",
        "dedicated-desk",
        "private-office",
        "meeting-room",
        "conference-room",
      ],
    },

    // Location
    city: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    // Hourly pricing
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceUnit: {
      type: String,
      required: true,
      enum: ["per-person/hour", "per-workspace/hour"],
      default: "per-workspace/hour",
    },

    // Full-day pricing
    fullDayPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    fullDayPriceUnit: {
      type: String,
      required: true,
      enum: ["per-person/day", "per-workspace/day"],
      default: "per-workspace/day",
    },

    currency: {
      type: String,
      default: "INR",
    },

    // Capacity
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Images
    image: {
      type: String,
      required: true,
    },

    images: {
      type: [String],
      default: [],
    },

    // Amenities and features
    amenities: {
      type: [String],
      default: [],
    },

    features: {
      type: [String],
      default: [],
    },

    // Workspace owner
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Admin approval
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Workspace", workspaceSchema);
