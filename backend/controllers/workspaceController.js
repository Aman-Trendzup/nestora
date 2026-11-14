
import Workspace from "../models/Workspace.js";
import mongoose from "mongoose";
import {
  processAndOptimizeImages,
  deleteWorkspaceImageFiles,
} from "../utils/imageStorage.js";

const parseJsonField = (field, fallback) => {
  if (field === undefined || field === null) return fallback;
  if (typeof field === "object") return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return fallback;
  }
};

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// ----------------------------------
// PRICING VALIDATOR HELPER
// ----------------------------------

export const validateAndFormatPricing = (type, pricingInput) => {
  if (!pricingInput || typeof pricingInput !== "object") {
    throw new Error("Pricing configuration is required.");
  }

  // Enforce pricing type according to category
  const validPricingType = type === "coworking" ? "per_person" : "per_space";

  let hourlyEnabled = false;
  let hourlyPrice = null;
  let dailyEnabled = false;
  let dailyPrice = null;

  // Hourly parsing
  if (pricingInput.hourly && typeof pricingInput.hourly === "object") {
    hourlyEnabled = Boolean(pricingInput.hourly.enabled);
    if (hourlyEnabled) {
      const price = Number(pricingInput.hourly.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Hourly price must be a valid positive number.");
      }
      hourlyPrice = price;
    }
  } else if (
    typeof pricingInput.hourly === "number" &&
    pricingInput.hourly > 0
  ) {
    hourlyEnabled = true;
    hourlyPrice = pricingInput.hourly;
  }

  // Daily parsing
  if (pricingInput.daily && typeof pricingInput.daily === "object") {
    dailyEnabled = Boolean(pricingInput.daily.enabled);
    if (dailyEnabled) {
      const price = Number(pricingInput.daily.price);
      if (!Number.isFinite(price) || price <= 0) {
        throw new Error("Daily price must be a valid positive number.");
      }
      dailyPrice = price;
    }
  } else if (
    typeof pricingInput.fullDay === "number" &&
    pricingInput.fullDay > 0
  ) {
    dailyEnabled = true;
    dailyPrice = pricingInput.fullDay;
  }

  // At least one duration must be enabled
  if (!hourlyEnabled && !dailyEnabled) {
    throw new Error(
      "At least one booking duration (hourly or daily) must be enabled."
    );
  }

  return {
    pricingType: validPricingType,
    hourly: {
      enabled: hourlyEnabled,
      price: hourlyPrice,
    },
    daily: {
      enabled: dailyEnabled,
      price: dailyPrice,
    },
    currency: pricingInput.currency || "INR",
  };
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private (Owner)
export const createWorkspace = async (req, res) => {
  let newlyUploadedImages = [];

  try {
    // 1. Get workspace details from the request
    let {
      name,
      type,
      description,
      capacity,
      totalUnits,
      address,
      areaSqFt,
      pricing,
      amenities,
      features,
      images,
      operatingHours,
    } = req.body;

    // Parse JSON fields if received through multipart/form-data
    address = parseJsonField(address, address);
    pricing = parseJsonField(pricing, pricing);
    amenities = parseJsonField(amenities, amenities);
    features = parseJsonField(features, features);
    operatingHours = parseJsonField(operatingHours, operatingHours);

    // 1b. Process uploaded image files using Sharp optimization
    if (req.files && req.files.length > 0) {
      newlyUploadedImages = await processAndOptimizeImages(req.files, req);
    }

    let bodyImages = parseJsonField(images, images) || [];
    if (typeof bodyImages === "string") {
      bodyImages = [bodyImages];
    }
    if (Array.isArray(bodyImages)) {
      bodyImages = bodyImages.map((img) =>
        typeof img === "string" ? { url: img, alt: "Workspace view" } : img
      );
    } else {
      bodyImages = [];
    }

    const finalImages = [...bodyImages, ...newlyUploadedImages];

    // 2. Check required fields
    if (
      !name?.trim() ||
      !type ||
      !description?.trim() ||
      !capacity ||
      Number(capacity) <= 0 ||
      !address?.fullAddress?.trim() ||
      !address?.city?.trim() ||
      !address?.area?.trim() ||
      !address?.state?.trim() ||
      !address?.postalCode?.trim() ||
      !amenities ||
      !Array.isArray(amenities) ||
      amenities.length === 0 ||
      finalImages.length === 0
    ) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message:
          "All workspace details (name, category, capacity, description, complete address, amenities, and at least one photo) are required to list a workspace.",
      });
    }

    // Enforce maximum 3 images limit
    if (finalImages.length > 3) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message: "You can upload a maximum of 3 images per workspace listing.",
      });
    }

    if (type !== "coworking" && (!totalUnits || Number(totalUnits) <= 0)) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message: "Bookable units must be at least 1 for private offices and rooms.",
      });
    }

    // 2b. Validate pricing according to category (at least one enabled, enabled prices mandatory > 0)
    let formattedPricing;
    try {
      formattedPricing = validateAndFormatPricing(type, pricing);
    } catch (pricingErr) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message: pricingErr.message,
      });
    }

    // 3. Generate a URL-friendly slug from workspace name
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;

    // 4. Make sure the slug is unique
    while (await Workspace.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let finalOperatingHours = operatingHours;
    if (operatingHours && (operatingHours.openingTime || operatingHours.closingTime)) {
      const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
      const open = operatingHours.openingTime || "09:00";
      const close = operatingHours.closingTime || "21:00";
      finalOperatingHours = {};
      days.forEach((day) => {
        finalOperatingHours[day] = {
          isOpen: day !== "sunday",
          openingTime: open,
          closingTime: close,
        };
      });
    }

    // 5. Create workspace in MongoDB
    const workspace = await Workspace.create({
      name,
      slug,
      type,
      description,
      capacity: Math.max(1, Number(capacity) || 1),
      totalUnits: Math.max(1, Number(totalUnits) || 1),
      address,
      areaSqFt: Number(areaSqFt) || 0,
      pricing: formattedPricing,
      amenities,
      features: Array.isArray(features) ? features : [],
      images: finalImages,
      operatingHours: finalOperatingHours,

      // Owner comes from authenticated user, not request body
      owner: req.user._id,

      // Newly created workspaces strictly start as pending review by Super Admin
      approvalStatus: "pending",
      rejectionReason: "",
      approvedAt: null,
      approvedBy: null,
      isActive: true,
    });

    // 6. Send success response
    return res.status(201).json({
      success: true,
      message: "Workspace submitted successfully and is currently pending Super Admin approval.",
      workspace,
    });

  } catch (error) {
    console.error("Create workspace error:", error);

    // Clean up any newly uploaded files if creation failed
    deleteWorkspaceImageFiles(newlyUploadedImages);

    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A workspace with this slug already exists.",
      });
    }

    // Handle other server errors
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create workspace.",
    });
  }
};



// @desc    Get all approved workspaces
// @route   GET /api/workspaces
// @access  Public
export const getAllWorkspaces = async (req, res) => {
  try {
    // Fetch approved and active workspaces
    const workspaces = await Workspace.find({
      approvalStatus: "approved",
      isActive: true,
    });

    // Send response
    return res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });

  } catch (error) {
    console.error("Get workspaces error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces.",
    });
  }
};



// @desc    Get single workspace by slug or id
// @route   GET /api/workspaces/:slug
// @access  Public (Enforces approved & active for public consumers)
export const getWorkspaceBySlug = async (req, res) => {
  try {
    // Get slug or id from URL parameters
    const { slug } = req.params;

    // Public lookup strictly requires approvalStatus: "approved" and isActive: true
    const query = mongoose.isValidObjectId(slug)
      ? { _id: slug, approvalStatus: "approved", isActive: true }
      : { slug, approvalStatus: "approved", isActive: true };

    const workspace = await Workspace.findOne(query);

    // Check if workspace exists and is approved for public viewing
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or not available.",
      });
    }

    // Return workspace
    return res.status(200).json({
      success: true,
      workspace,
    });

  } catch (error) {
    console.error("Get workspace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace.",
    });
  }
};


// @desc    Update an existing workspace
// @route   PUT /api/workspaces/:id
// @access  Private (Owner)
export const updateWorkspace = async (req, res) => {
  let newlyUploadedImages = [];

  try {
    // 1. Get workspace ID from URL
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID.",
      });
    }

    // 2. Find workspace belonging to logged-in owner
    const workspace = await Workspace.findOne({
      _id: id,
      owner: req.user._id,
    });

    // 3. Check whether workspace exists
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found or unauthorized.",
      });
    }

    // Parse JSON fields if received through multipart/form-data
    if (req.body.address !== undefined) {
      req.body.address = parseJsonField(req.body.address, req.body.address);
    }
    if (req.body.pricing !== undefined) {
      req.body.pricing = parseJsonField(req.body.pricing, req.body.pricing);
    }
    if (req.body.amenities !== undefined) {
      req.body.amenities = parseJsonField(req.body.amenities, req.body.amenities);
    }
    if (req.body.features !== undefined) {
      req.body.features = parseJsonField(req.body.features, req.body.features);
    }
    if (req.body.operatingHours !== undefined) {
      req.body.operatingHours = parseJsonField(req.body.operatingHours, req.body.operatingHours);
    }

    // 4. Validate updated fields
    if (req.body.name !== undefined && !req.body.name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace name cannot be empty.",
      });
    }
    if (req.body.description !== undefined && !req.body.description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Workspace description cannot be empty.",
      });
    }
    if (req.body.capacity !== undefined && Number(req.body.capacity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1 person.",
      });
    }
    if (req.body.totalUnits !== undefined && Number(req.body.totalUnits) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Bookable units must be at least 1.",
      });
    }
    if (req.body.address !== undefined) {
      const addr = req.body.address;
      if (
        !addr.fullAddress?.trim() ||
        !addr.city?.trim() ||
        !addr.area?.trim() ||
        !addr.state?.trim() ||
        !addr.postalCode?.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "All address fields must be filled.",
        });
      }
    }
    if (
      req.body.amenities !== undefined &&
      (!Array.isArray(req.body.amenities) || req.body.amenities.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one amenity must be selected.",
      });
    }

    // 4b. Handle Image Updates: Retained Existing Images + Newly Uploaded Images
    let existingImages = workspace.images;
    const existingImagesRaw = req.body.existingImages !== undefined
      ? req.body.existingImages
      : req.body.images;

    if (existingImagesRaw !== undefined) {
      const parsed = parseJsonField(existingImagesRaw, existingImagesRaw);
      if (Array.isArray(parsed)) {
        existingImages = parsed.map((img) =>
          typeof img === "string" ? { url: img, alt: "Workspace view" } : img
        );
      }
    }

    // Process newly uploaded files with Sharp
    if (req.files && req.files.length > 0) {
      newlyUploadedImages = await processAndOptimizeImages(req.files, req);
    }

    const combinedImages = [...existingImages, ...newlyUploadedImages];

    if (combinedImages.length === 0) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message: "At least one workspace photo is required.",
      });
    }

    if (combinedImages.length > 3) {
      deleteWorkspaceImageFiles(newlyUploadedImages);
      return res.status(400).json({
        success: false,
        message: "You can have a maximum of 3 images per workspace listing.",
      });
    }

    // Identify images that were removed by the owner
    const retainedUrls = new Set(existingImages.map((img) => img.url));
    const removedImages = workspace.images.filter((img) => !retainedUrls.has(img.url));

    // 4c. Allow only editable fields
    const allowedFields = [
      "name",
      "type",
      "description",
      "capacity",
      "totalUnits",
      "address",
      "areaSqFt",
      "amenities",
      "features",
    ];

    // 5. Update only allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "capacity") {
          workspace.capacity = Math.max(1, Number(req.body.capacity) || 1);
        } else if (field === "totalUnits") {
          workspace.totalUnits = Math.max(1, Number(req.body.totalUnits) || 1);
        } else {
          workspace[field] = req.body[field];
        }
      }
    });

    workspace.images = combinedImages;

    // 5b. Handle dynamic pricing validation and formatting
    if (req.body.pricing !== undefined) {
      const activeType = req.body.type || workspace.type;
      let formattedPricing;
      try {
        formattedPricing = validateAndFormatPricing(
          activeType,
          req.body.pricing
        );
      } catch (err) {
        deleteWorkspaceImageFiles(newlyUploadedImages);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      workspace.pricing = formattedPricing;
    }

    // 6. Handle operating hours safely
    if (req.body.operatingHours !== undefined) {
      const opIn = req.body.operatingHours;
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      if (opIn && (opIn.openingTime || opIn.closingTime)) {
        const open = opIn.openingTime || "09:00";
        const close = opIn.closingTime || "21:00";
        const newOp = {};
        days.forEach((day) => {
          const prevDay = workspace.operatingHours?.[day] || {};
          newOp[day] = {
            isOpen: prevDay.isOpen !== undefined ? prevDay.isOpen : day !== "sunday",
            openingTime: open,
            closingTime: close,
          };
        });
        workspace.operatingHours = newOp;
      } else if (opIn && typeof opIn === "object") {
        workspace.operatingHours = opIn;
      }
    }

    // 7. Save updated workspace
    await workspace.save();

    // 8. Delete removed images from server filesystem only after successful database save
    deleteWorkspaceImageFiles(removedImages);

    // 9. Send response
    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      workspace,
    });

  } catch (error) {
    console.error("Update workspace error:", error);

    // Clean up newly uploaded images if database save failed
    deleteWorkspaceImageFiles(newlyUploadedImages);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update workspace.",
    });
  }
};


// @desc    Delete a workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (Owner)

export const deleteWorkspace = async (req, res) => {
  try {
    // 1. Get workspace ID from URL
    const { id } = req.params;

    // 2. Find workspace belonging to logged-in owner
    const workspace = await Workspace.findOne({
      _id: id,
      owner: req.user._id,
    });

    // 3. Check whether workspace exists
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    const imagesToDelete = [...workspace.images];

    // 4. Delete workspace from MongoDB
    await workspace.deleteOne();

    // 5. Delete associated images from disk
    deleteWorkspaceImageFiles(imagesToDelete);

    // 6. Send success response
    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully.",
    });

  } catch (error) {
    console.error("Delete workspace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete workspace.",
    });
  }
};

// @desc    Delete single workspace image
// @route   DELETE /api/workspaces/:id/images/:filename
// @access  Private (Owner)
export const deleteWorkspaceImage = async (req, res) => {
  try {
    const { id, filename } = req.params;

    const workspace = await Workspace.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    if (workspace.images.length <= 1) {
      return res.status(400).json({
        success: false,
        message: "Workspace must retain at least one image.",
      });
    }

    const imageIndex = workspace.images.findIndex(
      (img) =>
        img.filename === filename ||
        (img.url && img.url.includes(filename))
    );

    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Image not found on this workspace.",
      });
    }

    const removed = workspace.images.splice(imageIndex, 1);
    await workspace.save();

    deleteWorkspaceImageFiles(removed);

    return res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
      images: workspace.images,
    });
  } catch (error) {
    console.error("Delete workspace image error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete workspace image.",
    });
  }
};

// @desc    Get all workspaces created by logged-in owner
// @route   GET /api/workspaces/owner/my-workspaces
// @access  Private (Owner)

export const getOwnerWorkspaces = async (req, res) => {
  try {
    // 1. Find workspaces belonging to logged-in owner
    const workspaces = await Workspace.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    // 2. Send response
    return res.status(200).json({
      success: true,
      count: workspaces.length,
      workspaces,
    });

  } catch (error) {
    console.error("Get owner workspaces error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your workspaces.",
    });
  }
};

// @desc    Update workspace approval status
// @route   PATCH /api/workspaces/:id/approval
// @access  Private (Admin)

export const updateWorkspaceApproval = async (req, res) => {
  try {
    // 1. Get workspace ID from URL
    const { id } = req.params;

    // 2. Get approval status from request body
    const { approvalStatus } = req.body;

    // 3. Validate MongoDB ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspace ID.",
      });
    }

    // 4. Validate approval status
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        message: "Approval status must be approved or rejected.",
      });
    }

    // 5. Find workspace
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    // 6. Update approval status with audit fields
    workspace.approvalStatus = approvalStatus;
    if (approvalStatus === "approved") {
      workspace.isActive = true;
      workspace.approvedAt = new Date();
      workspace.approvedBy = req.user._id;
      workspace.rejectionReason = "";
    } else if (approvalStatus === "rejected") {
      workspace.rejectionReason = (req.body.rejectionReason || "").trim() || "Does not meet listing guidelines.";
      workspace.approvedAt = null;
      workspace.approvedBy = null;
    }

    await workspace.save();

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: `Workspace ${approvalStatus} successfully.`,
      workspace,
    });

  } catch (error) {
    console.error("Workspace approval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update workspace approval.",
    });
  }
};

// @desc    Search, filter, sort and paginate approved workspaces
// @route   GET /api/workspaces/search
// @access  Public

export const searchWorkspaces = async (req, res) => {
  try {
    const {
      search,
      city,
      area,
      location,
      type,
      minCapacity,
      guests,
      amenities,
      sort = "recommended",
      page = 1,
      limit = 12,
    } = req.query;

    // 1. Only fetch approved and active workspaces
    const filter = {
      approvalStatus: "approved",
      isActive: true,
    };

    // 2. Search by workspace name and description
    if (search?.trim()) {
      const searchRegex = new RegExp(
        escapeRegex(search.trim()),
        "i"
      );

      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    // 3. Filter by location / city / area
    const locationQuery = (location || city)?.trim();
    if (locationQuery) {
      const locRegex = new RegExp(escapeRegex(locationQuery), "i");
      const locationConditions = [
        { "address.city": locRegex },
        { "address.area": locRegex },
        { "address.fullAddress": locRegex },
      ];

      if (filter.$or) {
        filter.$and = [
          { $or: filter.$or },
          { $or: locationConditions },
        ];
        delete filter.$or;
      } else {
        filter.$or = locationConditions;
      }
    } else if (area?.trim()) {
      filter["address.area"] = {
        $regex: escapeRegex(area.trim()),
        $options: "i",
      };
    }

    // 4. Filter by workspace type
    if (type?.trim()) {
      filter.type = type.trim().toLowerCase();
    }

    // 5. Filter by minimum capacity
    const rawCapacity = minCapacity || guests;
    if (rawCapacity) {
      const capacity = Number(rawCapacity);

      if (!Number.isFinite(capacity) || capacity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum capacity.",
        });
      }

      filter.capacity = { $gte: capacity };
    }

    // 6. Filter by amenities
    if (amenities) {
      const amenityList = amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (amenityList.length > 0) {
        filter.amenities = { $all: amenityList };
      }
    }

    // 8. Configure sorting
    let sortOptions;

    switch (sort) {
      case "price-low":
        sortOptions = {
          "pricing.hourly": 1,
          createdAt: -1,
        };
        break;

      case "price-high":
        sortOptions = {
          "pricing.hourly": -1,
          createdAt: -1,
        };
        break;

      case "recommended":
      default:
        sortOptions = {
          "rating.average": -1,
          "rating.count": -1,
          createdAt: -1,
        };
        break;
    }

    // 9. Configure pagination
    const currentPage = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const perPage = Math.min(
      50,
      Math.max(1, parseInt(limit, 10) || 12)
    );

    const skip = (currentPage - 1) * perPage;

    // 10. Fetch results and total matching count
    const [workspaces, totalWorkspaces] = await Promise.all([
      Workspace.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(perPage),

      Workspace.countDocuments(filter),
    ]);

    // 11. Send response
    return res.status(200).json({
      success: true,
      count: workspaces.length,
      totalWorkspaces,
      pagination: {
        currentPage,
        totalPages: Math.ceil(totalWorkspaces / perPage),
        limit: perPage,
        hasNextPage: currentPage * perPage < totalWorkspaces,
        hasPreviousPage: currentPage > 1,
      },
      workspaces,
    });

  } catch (error) {
    console.error("Search workspaces error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search workspaces.",
    });
  }
};

/* ----------------------------------
   OWNER: MANAGE BLOCKED DATES
---------------------------------- */

export const addBlockedDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "A valid date in YYYY-MM-DD format is required.",
      });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage availability for this workspace.",
      });
    }

    const alreadyBlocked = workspace.blockedDates?.some((b) => b.date === date);
    if (alreadyBlocked) {
      return res.status(400).json({
        success: false,
        message: `Date ${date} is already blocked.`,
      });
    }

    workspace.blockedDates.push({
      date,
      reason: reason?.trim() || "Maintenance / Reserved by Owner",
    });

    await workspace.save();

    return res.status(200).json({
      success: true,
      message: `Date ${date} has been blocked successfully.`,
      blockedDates: workspace.blockedDates,
    });
  } catch (error) {
    console.error("Add blocked date error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to block date.",
    });
  }
};

export const removeBlockedDate = async (req, res) => {
  try {
    const { id, date } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to manage availability for this workspace.",
      });
    }

    workspace.blockedDates = workspace.blockedDates.filter((b) => b.date !== date);
    await workspace.save();

    return res.status(200).json({
      success: true,
      message: `Date ${date} is now unblocked and available for bookings.`,
      blockedDates: workspace.blockedDates,
    });
  } catch (error) {
    console.error("Remove blocked date error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to unblock date.",
    });
  }
};

export const getBlockedDates = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id).select("blockedDates owner name");
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
      });
    }

    return res.status(200).json({
      success: true,
      workspaceName: workspace.name,
      blockedDates: workspace.blockedDates || [],
    });
  } catch (error) {
    console.error("Get blocked dates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blocked dates.",
    });
  }
};


