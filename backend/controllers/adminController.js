import mongoose from "mongoose";
import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import Booking from "../models/Booking.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// -------------------------------------------------------------
// 1. DASHBOARD & STATISTICS (Phase 2)
// -------------------------------------------------------------

// @desc    Get platform-wide overview statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getAdminDashboardStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run parallel counts for fast response
    const [
      totalUsers,
      totalCustomers,
      totalOwners,
      inactiveUsers,
      newUsersLast30Days,
      totalWorkspaces,
      pendingWorkspaces,
      approvedWorkspaces,
      rejectedWorkspaces,
      inactiveWorkspaces,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      revenueResult,
      recentUsers,
      recentWorkspaces,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "owner" }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),

      Workspace.countDocuments(),
      Workspace.countDocuments({ approvalStatus: "pending" }),
      Workspace.countDocuments({ approvalStatus: "approved" }),
      Workspace.countDocuments({ approvalStatus: "rejected" }),
      Workspace.countDocuments({ isActive: false }),

      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.countDocuments({ status: "completed" }),
      Booking.countDocuments({ status: "cancelled" }),

      // Total gross revenue from completed or confirmed bookings
      Booking.aggregate([
        {
          $match: {
            status: { $in: ["confirmed", "completed"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.totalAmount" },
          },
        },
      ]),

      // Recent 5 users
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("-password"),

      // Recent 5 workspace listings submitted
      Workspace.find()
        .populate("owner", "fullName email businessName")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name type slug approvalStatus isActive pricing address createdAt owner"),

      // Recent 5 bookings
      Booking.find()
        .populate("customer", "fullName email")
        .populate("workspace", "name slug")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          owners: totalOwners,
          inactive: inactiveUsers,
          newLast30Days: newUsersLast30Days,
        },
        workspaces: {
          total: totalWorkspaces,
          pending: pendingWorkspaces,
          approved: approvedWorkspaces,
          rejected: rejectedWorkspaces,
          inactive: inactiveWorkspaces,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          totalRevenue,
        },
      },
      recentActivity: {
        users: recentUsers,
        workspaces: recentWorkspaces,
        bookings: recentBookings,
      },
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard statistics.",
    });
  }
};

// -------------------------------------------------------------
// 2. USER MANAGEMENT (Phase 3)
// -------------------------------------------------------------

// @desc    Get all users with search, role filters, and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getAdminUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (role && ["customer", "owner", "admin"].includes(role)) {
      query.role = role;
    }

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    if (search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
        { businessName: regex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .select("-password"),
    ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        total: totalUsers,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalUsers / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

// @desc    Get single user details by ID with related records
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getAdminUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    let relatedData = {};

    if (user.role === "owner") {
      const [workspaceCount, workspaces] = await Promise.all([
        Workspace.countDocuments({ owner: user._id }),
        Workspace.find({ owner: user._id }).sort({ createdAt: -1 }).limit(10),
      ]);
      relatedData = { workspaceCount, workspaces };
    } else if (user.role === "customer") {
      const [bookingCount, bookings] = await Promise.all([
        Booking.countDocuments({ customer: user._id }),
        Booking.find({ customer: user._id })
          .populate("workspace", "name slug")
          .sort({ createdAt: -1 })
          .limit(10),
      ]);
      relatedData = { bookingCount, bookings };
    }

    return res.status(200).json({
      success: true,
      user,
      relatedData,
    });
  } catch (error) {
    console.error("Get admin user by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
    });
  }
};

// @desc    Toggle or update user active status
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    // Prevent admin from deactivating their own account
    if (req.user._id.toString() === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own admin account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.isActive = typeof isActive === "boolean" ? isActive : !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been ${user.isActive ? "activated" : "deactivated"} successfully.`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

// -------------------------------------------------------------
// 3. WORKSPACE MANAGEMENT & APPROVALS (Phases 4 & 5)
// -------------------------------------------------------------

// @desc    Get all platform workspaces with filters and pagination
// @route   GET /api/admin/workspaces
// @access  Private (Admin)
export const getAdminWorkspaces = async (req, res) => {
  try {
    const {
      search = "",
      type = "",
      approvalStatus = "",
      isActive = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (type && ["coworking", "private-office", "meeting-room", "conference-room"].includes(type)) {
      query.type = type;
    }

    if (approvalStatus && ["pending", "approved", "rejected"].includes(approvalStatus)) {
      query.approvalStatus = approvalStatus;
    }

    if (isActive === "true") {
      query.isActive = true;
    } else if (isActive === "false") {
      query.isActive = false;
    }

    if (search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");
      query.$or = [
        { name: regex },
        { "address.city": regex },
        { "address.area": regex },
        { "address.fullAddress": regex },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const [totalWorkspaces, workspaces] = await Promise.all([
      Workspace.countDocuments(query),
      Workspace.find(query)
        .populate("owner", "fullName email phone businessName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
    ]);

    return res.status(200).json({
      success: true,
      workspaces,
      pagination: {
        total: totalWorkspaces,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalWorkspaces / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("Get admin workspaces error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces.",
    });
  }
};

// @desc    Approve or reject a workspace listing
// @route   PATCH /api/admin/workspaces/:id/approval
// @access  Private (Admin)
export const updateAdminWorkspaceApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID.",
      });
    }

    if (!["approved", "rejected", "pending"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved', 'rejected', or 'pending'.",
      });
    }

    const workspace = await Workspace.findById(id).populate("owner", "fullName email");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    workspace.approvalStatus = approvalStatus;
    // When approved, ensure it is active, record admin audit info, and clear any old rejection reason
    if (approvalStatus === "approved") {
      workspace.isActive = true;
      workspace.approvedAt = new Date();
      workspace.approvedBy = req.user._id;
      workspace.rejectionReason = "";
    } else if (approvalStatus === "rejected") {
      workspace.rejectionReason = (rejectionReason || "").trim() || "Does not meet listing guidelines.";
      workspace.approvedAt = null;
      workspace.approvedBy = null;
    } else if (approvalStatus === "pending") {
      workspace.approvedAt = null;
      workspace.approvedBy = null;
      workspace.rejectionReason = "";
    }

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: `Workspace listing has been ${approvalStatus} successfully.`,
      workspace,
    });
  } catch (error) {
    console.error("Update workspace approval error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update workspace approval status.",
    });
  }
};

// @desc    Toggle platform-wide workspace active status
// @route   PATCH /api/admin/workspaces/:id/status
// @access  Private (Admin)
export const updateAdminWorkspaceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID.",
      });
    }

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    workspace.isActive = typeof isActive === "boolean" ? isActive : !workspace.isActive;
    await workspace.save();

    return res.status(200).json({
      success: true,
      message: `Workspace listing has been ${workspace.isActive ? "activated" : "deactivated"} successfully.`,
      workspace,
    });
  } catch (error) {
    console.error("Update workspace status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update workspace status.",
    });
  }
};

// -------------------------------------------------------------
// 4. RESERVATION MANAGEMENT (Phase 6)
// -------------------------------------------------------------

// @desc    Get all platform reservations with filters, search, and pagination
// @route   GET /api/admin/bookings
// @access  Private (Admin)
export const getAdminBookings = async (req, res) => {
  try {
    const {
      search = "",
      status = "",
      bookingType = "",
      startDate = "",
      endDate = "",
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (status && ["pending", "confirmed", "cancelled", "completed", "rejected"].includes(status)) {
      query.status = status;
    }

    if (bookingType && ["hourly", "full-day"].includes(bookingType)) {
      query.bookingType = bookingType;
    }

    if (startDate || endDate) {
      query.bookingDate = {};
      if (startDate) {
        query.bookingDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.bookingDate.$lte = end;
      }
    }

    // If searching by bookingReference directly
    if (search.trim()) {
      const escaped = escapeRegex(search.trim());
      const regex = new RegExp(escaped, "i");

      // Match bookingReference or find matching customer/workspace IDs
      const [matchingCustomers, matchingWorkspaces] = await Promise.all([
        User.find({
          $or: [{ fullName: regex }, { email: regex }, { phone: regex }],
        }).select("_id"),
        Workspace.find({ name: regex }).select("_id"),
      ]);

      const customerIds = matchingCustomers.map((u) => u._id);
      const workspaceIds = matchingWorkspaces.map((w) => w._id);

      query.$or = [
        { bookingReference: regex },
        { customer: { $in: customerIds } },
        { workspace: { $in: workspaceIds } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNumber - 1) * pageSize;

    const [totalBookings, bookings] = await Promise.all([
      Booking.countDocuments(query),
      Booking.find(query)
        .populate("customer", "fullName email phone")
        .populate({
          path: "workspace",
          select: "name slug type address owner",
          populate: {
            path: "owner",
            select: "fullName email phone businessName",
          },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
    ]);

    return res.status(200).json({
      success: true,
      bookings,
      pagination: {
        total: totalBookings,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalBookings / pageSize) || 1,
      },
    });
  } catch (error) {
    console.error("Get admin bookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings.",
    });
  }
};

// @desc    Get single reservation details by ID
// @route   GET /api/admin/bookings/:id
// @access  Private (Admin)
export const getAdminBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await Booking.findById(id)
      .populate("customer", "fullName email phone")
      .populate({
        path: "workspace",
        select: "name slug type address pricing images owner",
        populate: {
          path: "owner",
          select: "fullName email phone businessName",
        },
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get admin booking by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking details.",
    });
  }
};

// @desc    Update reservation status by admin
// @route   PATCH /api/admin/bookings/:id/status
// @access  Private (Admin)
export const updateAdminBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (status) {
      booking.status = status;
      if (status === "cancelled" && !booking.cancelledAt) {
        booking.cancelledAt = new Date();
      }
    }

    if (paymentStatus && ["unpaid", "paid"].includes(paymentStatus)) {
      booking.paymentStatus = paymentStatus;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully.",
      booking,
    });
  } catch (error) {
    console.error("Update admin booking status error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status.",
    });
  }
};

