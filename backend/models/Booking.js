
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["hourly", "full-day"],
      required: true,
    },

    startTime: {
      type: String,
      required: function () {
        return this.bookingType === "hourly";
      },
    },

    endTime: {
      type: String,
      required: function () {
        return this.bookingType === "hourly";
      },
    },

    duration: {
      type: Number,
      min: 1,
      max: 8,
      required: function () {
        return this.bookingType === "hourly";
      },
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    pricing: {
      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: "INR",
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
        "rejected",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    specialRequests: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for booking queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ workspace: 1, bookingDate: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
