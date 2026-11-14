import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            trim: true,
        },

        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            select: false,
        },

        role: {
            type: String,
            enum: ["customer", "owner", "admin"],
            default: "customer",
        },

        businessName: {
            type: String,
            trim: true,
        },

        businessCity: {
            type: String,
            trim: true,
        },
        
        isActive: {
            type: Boolean,
            default: true,
        },
        termsAcceptedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for fast administrative filtering & auth lookups
userSchema.index({ role: 1, isActive: 1, createdAt: -1 });

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (
    enteredPassword
) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;