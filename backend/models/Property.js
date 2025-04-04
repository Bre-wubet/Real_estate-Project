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
    enum: ["for-sale", "for-rent", "sold", "rented"],
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
    bedrooms: Number,
    bathrooms: Number,
    area: Number, // in square feet
    parking: Boolean,
    furnished: Boolean
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