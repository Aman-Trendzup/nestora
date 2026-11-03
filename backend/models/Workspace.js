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
    "dedicated-desk",
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

  // pricing

  pricing: {
    hourly: {
      type: Number,
      min: 0,
      default: null,
    },
    fullDay: {
      type: Number,
      min: 0,
      default: null,
    },
    currency: {
      type: String,
      default: "INR",
    }
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
  }
},{
  timestamps:true,
}) 


const Workspace = mongoose.model("Workspace", workspaceSchema);

export default Workspace; 