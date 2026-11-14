import Coupon from "../models/Coupon.js";

/* ----------------------------------
   APPLY / VALIDATE COUPON
---------------------------------- */

export const applyCoupon = async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid coupon code.",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const amount = Number(bookingAmount);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid booking amount is required to apply coupon.",
      });
    }

    const coupon = await Coupon.findOne({
      code: cleanCode,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code.",
      });
    }

    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet.",
      });
    }

    if (coupon.validUntil && now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "This coupon has reached its maximum usage limit.",
      });
    }

    if (amount < (coupon.minBookingAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum booking amount of ₹${coupon.minBookingAmount}.`,
      });
    }

    let discountAmount = 0;

    if (coupon.discountType === "percentage") {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "flat") {
      discountAmount = Math.min(coupon.discountValue, amount);
    }

    discountAmount = Math.round(discountAmount);
    const finalAmount = Math.max(0, amount - discountAmount);

    return res.status(200).json({
      success: true,
      message: `Coupon '${coupon.code}' applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        description: coupon.description,
      },
      discountAmount,
      finalAmount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Error applying coupon code.",
    });
  }
};

/* ----------------------------------
   GET AVAILABLE COUPONS
---------------------------------- */

export const getAvailableCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validUntil: { $gte: now },
      validFrom: { $lte: now },
    })
      .select("code description discountType discountValue minBookingAmount maxDiscount validUntil")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve coupons.",
    });
  }
};

/* ----------------------------------
   CREATE COUPON (Admin / Seed)
---------------------------------- */

export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minBookingAmount,
      validUntil,
      usageLimit,
    } = req.body;

    if (!code || !discountType || !discountValue || !validUntil) {
      return res.status(400).json({
        success: false,
        message: "Code, discount type, value, and validity date are required.",
      });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Coupon code '${cleanCode}' already exists.`,
      });
    }

    const newCoupon = await Coupon.create({
      code: cleanCode,
      description,
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
      validUntil: new Date(validUntil),
      usageLimit: usageLimit ? Number(usageLimit) : null,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon.",
    });
  }
};

/* ----------------------------------
   SEED STARTER COUPONS HELPER
---------------------------------- */

export const seedInitialCoupons = async () => {
  try {
    const count = await Coupon.countDocuments();
    if (count === 0) {
      const oneYearLater = new Date();
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      await Coupon.insertMany([
        {
          code: "WELCOME10",
          description: "10% off on your first workspace booking",
          discountType: "percentage",
          discountValue: 10,
          maxDiscount: 500,
          minBookingAmount: 200,
          validUntil: oneYearLater,
          isActive: true,
        },
        {
          code: "NESTORA20",
          description: "20% off up to ₹1,000 on premium bookings",
          discountType: "percentage",
          discountValue: 20,
          maxDiscount: 1000,
          minBookingAmount: 1000,
          validUntil: oneYearLater,
          isActive: true,
        },
        {
          code: "FLAT150",
          description: "Flat ₹150 off on meeting rooms & private spaces",
          discountType: "flat",
          discountValue: 150,
          minBookingAmount: 500,
          validUntil: oneYearLater,
          isActive: true,
        },
      ]);
      console.log("Default coupons seeded successfully.");
    }
  } catch (err) {
    console.error("Error seeding coupons:", err.message);
  }
};

