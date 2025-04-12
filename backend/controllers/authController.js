import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        details: "Name, email, and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Invalid password",
        details: "Password must be at least 6 characters long"
      });
    }

    // Validate role if provided
    if (role && !['buyer', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
        details: "Role must be either buyer, seller, or admin"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        details: "This email is already registered"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'buyer',
      phoneNumber
    });

    try {
      await user.save();
    } catch (saveError) {
      if (saveError.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation error",
          details: Object.values(saveError.errors).map(err => err.message)
        });
      }
      throw saveError;
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        message: "Server configuration error",
        details: "Authentication service is not properly configured"
      });
    }

    // Generate JWT token
    try {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (jwtError) {
      console.error("JWT signing error:", jwtError);
      return res.status(500).json({
        message: "Error generating authentication token",
        details: "Could not complete the registration process"
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      details: "An unexpected error occurred during registration"
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        message: "Missing required fields",
        details: "Email and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        details: "Please provide a valid email address"
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        message: "Server configuration error",
        details: "Authentication service is not properly configured. Please check server environment variables."
      });
    }

    // Find user with error handling
    let user;
    try {
      user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(400).json({
          message: "Authentication failed",
          details: "Invalid email or password"
        });
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      return res.status(500).json({
        message: "Database error",
        details: "Could not verify user credentials"
      });
    }

    // Verify password with error handling
    try {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Authentication failed",
          details: "Invalid email or password"
        });
      }
    } catch (bcryptError) {
      console.error("Password comparison error:", bcryptError);
      return res.status(500).json({
        message: "Authentication error",
        details: "Could not verify password"
      });
    }

    // Generate JWT token with error handling
    try {
      const token = jwt.sign(
        { 
          userId: user._id, 
          role: user.role,
          email: user.email 
        },
        process.env.JWT_SECRET,
        { 
          expiresIn: "24h",
          algorithm: 'HS256' 
        }
      );

      // Send successful response
      return res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (jwtError) {
      console.error("JWT signing error:", jwtError);
      return res.status(500).json({
        message: "Authentication error",
        details: "Could not generate access token"
      });
    }

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
      details: "An unexpected error occurred during login"
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password")
      .populate("savedProperties");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, profileImage } = req.body;
    const userId = req.user.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phoneNumber, profileImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};