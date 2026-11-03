
import Workspace from "../models/Workspace.js";

const escapeRegex = (value) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private (Owner)
export const createWorkspace = async (req, res) => {
  try {
    // 1. Get workspace details from the request
    const {
      name,
      type,
      description,
      capacity,
      address,
      areaSqFt,
      pricing,
      amenities,
      features,
      images,
      operatingHours,
    } = req.body;

    // 2. Check required fields
    if (
      !name ||
      !type ||
      !description ||
      !capacity ||
      !address?.fullAddress ||
      !address?.city ||
      !address?.area ||
      !address?.state ||
      !address?.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required workspace details.",
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

    // 5. Create workspace in MongoDB
    const workspace = await Workspace.create({
      name,
      slug,
      type,
      description,
      capacity,
      address,
      areaSqFt,
      pricing,
      amenities,
      features,
      images,
      operatingHours,

      // Owner comes from authenticated user, not request body
      owner: req.user._id,

      // These values are controlled by the backend
      approvalStatus: "pending",
      isActive: true,
    });

    // 6. Send success response
    return res.status(201).json({
      success: true,
      message: "Workspace submitted successfully. Waiting for admin approval.",
      workspace,
    });

  } catch (error) {
    console.error("Create workspace error:", error);

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
      message: "Failed to create workspace.",
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



 // @desc    Get single workspace by slug
 // @route   GET /api/workspaces/:slug
 // @access  Public
export const getWorkspaceBySlug = async (req, res) => {
  try {
    // Get slug from URL parameters
    const { slug } = req.params;

    // Find approved workspace
    const workspace = await Workspace.findOne({
      slug,
      approvalStatus: "approved",
      isActive: true,
    });

    // Check if workspace exists
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found.",
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

    // 4. Allow only editable fields
    const allowedFields = [
      "name",
      "type",
      "description",
      "capacity",
      "address",
      "areaSqFt",
      "pricing",
      "amenities",
      "features",
      "images",
      "operatingHours",
    ];

    // 5. Update only allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        workspace[field] = req.body[field];
      }
    });

    // 6. Save updated workspace
    await workspace.save();

    // 7. Send response
    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully.",
      workspace,
    });

  } catch (error) {
    console.error("Update workspace error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update workspace.",
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

    // 4. Delete workspace from MongoDB
    await workspace.deleteOne();

    // 5. Send success response
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

    // 6. Update approval status
    workspace.approvalStatus = approvalStatus;

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
      type,
      minCapacity,
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

    // 3. Filter by city
    if (city?.trim()) {
      filter["address.city"] = {
        $regex: escapeRegex(city.trim()),
        $options: "i",
      };
    }

    // 4. Filter by area
    if (area?.trim()) {
      filter["address.area"] = {
        $regex: escapeRegex(area.trim()),
        $options: "i",
      };
    }

    // 5. Filter by workspace type
    if (type?.trim()) {
      filter.type = type.trim().toLowerCase();
    }

    // 6. Filter by minimum capacity
    if (minCapacity) {
      const capacity = Number(minCapacity);

      if (!Number.isFinite(capacity) || capacity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid minimum capacity.",
        });
      }

      filter.capacity = { $gte: capacity };
    }

    // 7. Filter by amenities
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

