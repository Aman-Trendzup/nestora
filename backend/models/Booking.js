
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
      pricingType: {
        type: String,
        enum: ["per_person", "per_space"],
        default: "per_person",
      },
      unitPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      unitLabel: {
        type: String,
        default: "person",
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      subtotal: {
        type: Number,
        min: 0,
      },
      discountAmount: {
        type: Number,
        min: 0,
        default: 0,
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
      breakdownText: {
        type: String,
        default: "",
      },
    },

    coupon: {
      code: {
        type: String,
        trim: true,
        uppercase: true,
        default: null,
      },
      discountAmount: {
        type: Number,
        default: 0,
        min: 0,
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

    rescheduledAt: {
      type: Date,
      default: null,
    },

    rescheduleHistory: [
      {
        previousBookingDate: Date,
        previousStartTime: String,
        previousEndTime: String,
        previousDuration: Number,
        rescheduledAt: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for booking queries
bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ workspace: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ status: 1, bookingDate: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
