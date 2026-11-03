
import mongoose from "mongoose";

const bookingLockSchema = new mongoose.Schema(
  {
    // One lock per workspace per booking date
    _id: {
      type: String,
      required: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    version: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const BookingLock = mongoose.model("BookingLock", bookingLockSchema);

export default BookingLock;
