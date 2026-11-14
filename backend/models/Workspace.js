import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },

  slug:{
    type:String,
    required:true,
    unique:true,
    lowercase:true,
    trim:true,
  },

  type: {
  type: String,
  enum: [
    "coworking",
    "private-office",
    "meeting-room",
    "conference-room",
  ],
  required: true,
},

  description: {
    type: String,
    trim: true,
    required:true,
  },

  capacity: {
    type: Number,
    required: true,
    min: 1,
  },

  // Number of bookable physical units (offices/meeting rooms/conference rooms)
  totalUnits: {
    type: Number,
    min: 1,
    default: 1,
  },

  // location 

  address: {
    fullAddress: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
    },
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
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "India",
    }
  },

// physical area
areaSqFt:{
type:Number,
min:0,
},

  // Category-based dynamic pricing
  pricing: {
    pricingType: {
      type: String,
      enum: ["per_person", "per_space"],
      default: "per_person",
    },
    hourly: {
      enabled: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        min: 0,
        default: null,
      },
    },
    daily: {
      enabled: {
        type: Boolean,
        default: true,
      },
      price: {
        type: Number,
        min: 0,
        default: null,
      },
    },
    currency: {
      type: String,
      default: "INR",
    },
  },

  // amenities

  amenities: {
    type: [String],
    default: [],
  },

  features: {
    type: [String],
    default: [],
  },

  images:[{
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      default: "",
    },
    originalName: {
      type: String,
      default: "",
    },
    size: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
      default: "webp",
    },
    publicId: {
      type: String,
      default: "",
    },
    alt: {
      type: String,
      default: "",
    },
  }],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  rejectionReason: {
    type: String,
    default: "",
    trim: true,
  },

  approvedAt: {
    type: Date,
    default: null,
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  // operation

  operatingHours: {
    monday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    tuesday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    wednesday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    thursday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    friday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    saturday: {
      isOpen: {
        type: Boolean,
        default: true,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
    sunday: { 
      isOpen: {
        type: Boolean,
        default: false,
      },
      openingTime: {
        type: String,
        default: "09:00",
        required: true,
      },
      closingTime: {
        type: String,
        default: "21:00",
        required: true,
      }
    },
  },

  // rating
   
  rating:{
    average:{
      type:Number,
      default:0,
      min:0,
      max:5,
    },
    count:{
      type:Number,
      default:0,
      min:0,
    },
  },

  isActive:{
    type:Boolean,
    default:true,
  },

  blockedDates: [
    {
      date: {
        type: String, // Format: YYYY-MM-DD
        required: true,
      },
      reason: {
        type: String,
        trim: true,
        default: "Maintenance / Unavailable",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
},{
  timestamps: true,
});

// Backward-compatibility hook: Normalize legacy pricing fields on document initialization
workspaceSchema.post("init", function (doc) {
  if (doc && doc.pricing) {
    if (typeof doc.pricing.hourly === "number") {
      doc.pricing.hourly = {
        enabled: doc.pricing.hourly > 0,
        price: doc.pricing.hourly,
      };
    }
    if (typeof doc.pricing.fullDay === "number") {
      doc.pricing.daily = {
        enabled: doc.pricing.fullDay > 0,
        price: doc.pricing.fullDay,
      };
    }
    if (!doc.pricing.pricingType) {
      doc.pricing.pricingType =
        doc.type === "coworking" ? "per_person" : "per_space";
    }
  }
  if (doc && !doc.totalUnits) {
    doc.totalUnits = 1;
  }
});

// Indexes for platform search and admin moderation filtering
workspaceSchema.index({ approvalStatus: 1, isActive: 1, createdAt: -1 });
workspaceSchema.index({ type: 1, "address.city": 1, approvalStatus: 1 });

const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace; 