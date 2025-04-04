import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer"
  },
  profileImage: {
    type: String,
    default: ""
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  savedProperties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property"
  }]
}, {
  timestamps: true
});

export default mongoose.model("User", UserSchema);