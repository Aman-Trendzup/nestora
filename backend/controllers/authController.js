
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ----------------------------------
// AUTHENTICATION HELPERS
// ----------------------------------

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const setAuthCookie = (res, token) => {
  res.cookie("token", token, getCookieOptions());
};

const sendUserResponse = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  businessName: user.businessName,
  businessCity: user.businessCity,
  createdAt: user.createdAt,
});

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);


// ----------------------------------
// CUSTOMER REGISTRATION
// ----------------------------------

export const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, termsAccepted } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid full name.",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "Please accept the Terms of Service and Privacy Policy.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: "customer",
      termsAcceptedAt: new Date(),
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Your NESTORA account has been created successfully.",
      user: sendUserResponse(user),
    });

  } catch (error) {
    console.error("Customer Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


// ----------------------------------
// OWNER REGISTRATION
// ----------------------------------

export const registerOwner = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      businessName,
      businessCity,
      password,
      termsAccepted,
    } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof businessName !== "string" ||
      typeof businessCity !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !businessName.trim() ||
      !businessCity.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedBusinessName = businessName.trim();
    const normalizedBusinessCity = businessCity.trim();

    if (normalizedName.length < 2 || normalizedBusinessName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid name and business details.",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Indian mobile number.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    if (termsAccepted !== true) {
      return res.status(400).json({
        success: false,
        message: "Please accept the Terms of Service and Privacy Policy.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      businessName: normalizedBusinessName,
      businessCity: normalizedBusinessCity,
      password,
      role: "owner",
      termsAcceptedAt: new Date(),
    });

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Your NESTORA owner account has been created successfully.",
      user: sendUserResponse(user),
    });

  } catch (error) {
    console.error("Owner Registration Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


// ----------------------------------
// CUSTOMER / OWNER LOGIN
// ----------------------------------

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Welcome back to NESTORA!",
      user: sendUserResponse(user),
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};


// ----------------------------------
// GET CURRENT AUTHENTICATED USER
// ----------------------------------

export const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: sendUserResponse(req.user),
    });

  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user details.",
    });
  }
};


// ----------------------------------
// LOGOUT
// ----------------------------------

export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

// ----------------------------------
// UPDATE USER PROFILE
// ----------------------------------

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    const { fullName, phone, businessName, businessCity } = req.body;

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid full name.",
        });
      }
      user.fullName = fullName.trim();
    }

    if (phone !== undefined) {
      if (phone && !isValidPhone(phone.trim())) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit Indian mobile number.",
        });
      }
      user.phone = phone.trim();
    }

    if (user.role === "owner") {
      if (businessName !== undefined) {
        user.businessName = String(businessName || "").trim();
      }
      if (businessCity !== undefined) {
        user.businessCity = String(businessCity || "").trim();
      }
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: sendUserResponse(user),
    });
  } catch (error) {
    console.error("Update User Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile. Please try again later.",
    });
  }
};
