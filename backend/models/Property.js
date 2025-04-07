import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true
  },
  description: {
    type: String,
    required: [true, "Description is required"]
  },
  type: {
    type: String,
    required: true,
    enum: ["house", "apartment", "condo", "land", "commercial"]
  },
  status: {
    type: String,
    enum: ["Availabe", "Pending", "sold", "rented"],
    default: "for-sale"
  },
  price: {
    type: Number,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  features: {
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"]
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"]
    },
    area: {
      type: Number,
      required: [true, "Property area is required"]
    },
    parking: {
      type: Boolean,
      default: false
    },
    furnished: {
      type: Boolean,
      default: false
    }
  },
  amenities: {
    type: [String],
    default: []
  },
  images: [{
    type: String,
    required: [true, "At least one image is required"]
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

// Index for search functionality
PropertySchema.index({ 
  title: "text", 
  description: "text",
  "location.city": "text",
  "location.state": "text"
});

export default mongoose.model("Property", PropertySchema);