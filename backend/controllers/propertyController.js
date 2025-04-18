import Property from "../models/Property.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// Create new property listing
export const createProperty = async (req, res) => {
  try {
    console.log('Creating property with data:', { body: req.body, files: req.files?.length });

    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      console.error('Authentication missing:', { user: req.user });
      return res.status(401).json({ message: "Authentication required" });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Handle multer errors
    if (req.fileValidationError) {
      console.error('File validation error:', req.fileValidationError);
      return res.status(400).json({ 
        message: "File validation error",
        details: req.fileValidationError
      });
    }

    // Ensure we have files uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.error('Files missing:', { files: req.files });
      return res.status(400).json({ 
        message: "Image upload failed",
        details: "At least one image is required. Please ensure images are in JPG, JPEG, or PNG format and under 5MB."
      });
    }

    // Validate file sizes and types
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    
    for (const file of req.files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          message: "File too large",
          details: `${file.originalname} exceeds the 5MB size limit`
        });
      }
      if (!validTypes.includes(file.mimetype)) {
        return res.status(400).json({
          message: "Invalid file type",
          details: `${file.originalname} is not a valid image type. Only JPG, JPEG, and PNG are allowed`
        });
      }
    }

    // Parse form data
    const {
      title,
      price,
      description,
      type,
      status = 'Available',
      amenities = []
    } = req.body;

    // Parse location and features from JSON strings
    let location = {};
    let features = {};
    try {
      location = typeof req.body.location === 'string' ? JSON.parse(req.body.location) : req.body.location || {};
      features = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features || {};
    } catch (error) {
      console.error('Error parsing location or features:', error);
      return res.status(400).json({
        message: "Invalid location or features format",
        details: "Location and features must be valid JSON objects"
      });
    }

    // Validate features
    if (!features.bedrooms || !features.bathrooms || !features.area) {
      return res.status(400).json({
        message: "Missing required features",
        details: "Bedrooms, bathrooms, and area are required"
      });
    }

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !type || !price || isNaN(parseFloat(price))) {
      return res.status(400).json({ 
        message: "Missing or invalid required fields",
        details: "Title, description, type, and a valid numeric price are required"
      });
    }

    // Validate price format
    const numericPrice = parseFloat(price);
    if (numericPrice <= 0) {
      return res.status(400).json({
        message: "Invalid price",
        details: "Price must be greater than 0"
      });
    }

    // Validate property type
    const validPropertyTypes = ["house", "apartment", "condo", "townhouse", "land"];
    if (!validPropertyTypes.includes(type)) {
      return res.status(400).json({ 
        message: "Invalid property type",
        validTypes: validPropertyTypes
      });
    }

    // Validate price
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Validate location fields
    if (!location.address?.trim() || !location.city?.trim() || !location.state?.trim() || !location.zipCode?.trim()) {
      return res.status(400).json({ 
        message: "Missing required location fields",
        details: "Address, city, state and zipCode are required"
      });
    }

    // Parse and validate features
    const parsedFeatures = {
      bedrooms: parseInt(features.bedrooms),
      bathrooms: parseInt(features.bathrooms),
      area: parseFloat(features.area),
      parking: features.parking === true || features.parking === 'true',
      furnished: features.furnished === true || features.furnished === 'true'
    };

    if (isNaN(parsedFeatures.bedrooms) || isNaN(parsedFeatures.bathrooms) || isNaN(parsedFeatures.area)) {
      return res.status(400).json({
        message: "Invalid features format",
        details: "Bedrooms, bathrooms, and area must be valid numbers"
      });
    }

    if (parsedFeatures.bedrooms <= 0 || parsedFeatures.bathrooms <= 0 || parsedFeatures.area <= 0) {
      return res.status(400).json({
        message: "Invalid features values",
        details: "Bedrooms, bathrooms, and area must be positive numbers"
      });
    }

    // Process and save images
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    // Create new property
    const property = new Property({
      title: title.trim(),
      price: parsedPrice,
      description: description.trim(),
      type,
      status,
      location: {
        address: location.address.trim(),
        city: location.city.trim(),
        state: location.state.trim(),
        zipCode: location.zipCode.trim(),
      },
      amenities: Array.isArray(amenities) ? amenities : [],
      features: parsedFeatures,
      images: imageUrls,
      owner: req.user.userId
    });

    await property.save();
    res.status(201).json({
      message: "Property listed successfully",
      property
    });
  } catch (error) {
    console.error("Create property error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(400).json({
        message: "Database error",
        details: error.message
      });
    }

    if (error.name === 'MulterError') {
      return res.status(400).json({
        message: "File upload error",
        details: error.message,
        code: error.code
      });
    }
    
    res.status(500).json({ 
      message: "Error creating property listing",
      details: "An unexpected error occurred while processing your request. Please try again later."
    });
  }
};

// Get all properties with filters
export const getProperties = async (req, res) => {
  try {
    const {
      type,
      status,
      minPrice,
      maxPrice,
      city,
      state,
      bedrooms,
      bathrooms,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        message: "Invalid page number",
        details: "Page number must be a positive integer"
      });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        message: "Invalid limit value",
        details: "Limit must be between 1 and 50"
      });
    }

    const query = {};

    // Validate and apply type filter
    if (type) {
      const validTypes = ["house", "apartment", "condo", "land", "commercial"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid property type",
          validTypes
        });
      }
      query.type = type;
    }

    // Validate and apply status filter
    if (status) {
      const validStatuses = ["Available", "Pending", "Sold", "Rented"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid property status",
          validStatuses
        });
      }
      query.status = status;
    }

    // Apply location filters with case-insensitive search
    if (city?.trim()) query["location.city"] = new RegExp(city.trim(), "i");
    if (state?.trim()) query["location.state"] = new RegExp(state.trim(), "i");

    // Validate and apply numeric filters
    if (bedrooms) {
      const bedroomsNum = parseInt(bedrooms);
      if (isNaN(bedroomsNum) || bedroomsNum < 0) {
        return res.status(400).json({
          message: "Invalid bedrooms value",
          details: "Number of bedrooms must be a non-negative integer"
        });
      }
      query["features.bedrooms"] = { $gte: bedroomsNum };
    }

    if (bathrooms) {
      const bathroomsNum = parseInt(bathrooms);
      if (isNaN(bathroomsNum) || bathroomsNum < 0) {
        return res.status(400).json({
          message: "Invalid bathrooms value",
          details: "Number of bathrooms must be a non-negative integer"
        });
      }
      query["features.bathrooms"] = { $gte: bathroomsNum };
    }

    // Validate and apply price range filters
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        const minPriceNum = parseFloat(minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          return res.status(400).json({
            message: "Invalid minimum price",
            details: "Minimum price must be a non-negative number"
          });
        }
        query.price.$gte = minPriceNum;
      }
      if (maxPrice) {
        const maxPriceNum = parseFloat(maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          return res.status(400).json({
            message: "Invalid maximum price",
            details: "Maximum price must be a non-negative number"
          });
        }
        if (minPrice && maxPriceNum < parseFloat(minPrice)) {
          return res.status(400).json({
            message: "Invalid price range",
            details: "Maximum price must be greater than minimum price"
          });
        }
        query.price.$lte = maxPriceNum;
      }
    }

    // Apply text search if provided
    if (search?.trim()) {
      try {
        query.$text = { $search: search.trim() };
      } catch (searchError) {
        console.error('Text search error:', searchError);
        return res.status(400).json({
          message: "Invalid search query",
          details: "Please check your search terms and try again"
        });
      }
    }

    // Execute database queries with proper error handling
    try {
      const [properties, total] = await Promise.all([
        Property.find(query)
          .populate("owner", "name email phoneNumber")
          .sort({ createdAt: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .lean()
          .exec(),
        Property.countDocuments(query)
      ]);

      if (!Array.isArray(properties)) {
        throw new Error('Invalid properties result format');
      }

      return res.json({
        properties,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
        limit: limitNum
      });

    } catch (dbError) {
      console.error('Database query error:', dbError);
      throw dbError;
    }

  } catch (error) {
    console.error("Get properties error:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: "Invalid parameter format",
        details: error.message
      });
    }

    if (error.name === 'MongoServerError') {
      return res.status(500).json({
        message: "Database error",
        details: "Error connecting to the database"
      });
    }

    return res.status(500).json({
      message: "Error fetching properties",
      details: "An unexpected error occurred while retrieving properties"
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid property ID",
        details: "The provided ID is not in the correct format"
      });
    }

    let property;
    try {
      property = await Property.findById(id)
        .populate("owner", "name email phoneNumber")
        .populate("likes", "name")
        .exec();
    } catch (dbError) {
      console.error("Database query error:", dbError);
      if (dbError.name === 'CastError') {
        return res.status(400).json({
          message: "Invalid property ID format",
          details: "The provided ID is not in the correct format"
        });
      }
      throw dbError; // Re-throw for general error handling
    }

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
        details: `No property exists with ID: ${id}`
      });
    }

    // Increment views
    try {
      property.views = (property.views || 0) + 1;
      await property.save();
    } catch (saveError) {
      console.error("Error updating view count:", saveError);
      // Continue with response even if view count update fails
    }

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({
      message: "Error fetching property",
      details: "An unexpected error occurred while retrieving the property",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    let locationData;
    let featuresData;

    try {
      locationData = req.body.location ? JSON.parse(req.body.location) : null;
      featuresData = req.body.features ? JSON.parse(req.body.features) : {};
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON format for location or features" });
    }

    // Validate required fields if provided
    if (req.body.title?.trim() === "" || req.body.description?.trim() === "" || 
        (req.body.price && (isNaN(parseFloat(req.body.price)) || parseFloat(req.body.price) <= 0))) {
      return res.status(400).json({ 
        message: "Invalid input data",
        details: "Title and description cannot be empty, price must be a positive number"
      });
    }

    // Validate property type if provided
    const validPropertyTypes = ["house", "apartment", "condo", "land", "commercial"];
    if (req.body.type && !validPropertyTypes.includes(req.body.type)) {
      return res.status(400).json({ 
        message: "Invalid property type",
        validTypes: validPropertyTypes
      });
    }

    // Validate location fields if provided
    if (locationData && (!locationData.address?.trim() || !locationData.city?.trim() || 
        !locationData.state?.trim() || !locationData.zipCode?.trim())) {
      return res.status(400).json({ 
        message: "Invalid location data",
        details: "All location fields (address, city, state, zipCode) are required when updating location"
      });
    }

    // Process images if provided
    let imageUrls = property.images;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Prepare update data
    const updateData = {
      ...(req.body.title && { title: req.body.title.trim() }),
      ...(req.body.description && { description: req.body.description.trim() }),
      ...(req.body.type && { type: req.body.type }),
      ...(req.body.price && { price: parseFloat(req.body.price) }),
      ...(req.body.status && { status: req.body.status }),
      ...(locationData && {
        location: {
          address: locationData.address.trim(),
          city: locationData.city.trim(),
          state: locationData.state.trim(),
          zipCode: locationData.zipCode.trim(),
          coordinates: locationData.coordinates
        }
      }),
      ...(featuresData && {
        features: {
          ...(featuresData.bedrooms !== undefined && { bedrooms: parseInt(featuresData.bedrooms) }),
          ...(featuresData.bathrooms !== undefined && { bathrooms: parseInt(featuresData.bathrooms) }),
          ...(featuresData.area !== undefined && { area: parseFloat(featuresData.area) }),
          ...(featuresData.parking !== undefined && { parking: featuresData.parking === true }),
          ...(featuresData.furnished !== undefined && { furnished: featuresData.furnished === true })
        }
      }),
      images: imageUrls
    };

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("owner", "name email phoneNumber");

    res.json({
      message: "Property updated successfully",
      property: updatedProperty
    });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Error updating property" });
  }
};

// Delete property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await property.remove();

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Error deleting property" });
  }
};

// Toggle like property
export const toggleLikeProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const likeIndex = property.likes.indexOf(req.user.userId);

    if (likeIndex === -1) {
      property.likes.push(req.user.userId);
    } else {
      property.likes.splice(likeIndex, 1);
    }

    await property.save();

    res.json({
      message: likeIndex === -1 ? "Property liked" : "Property unliked",
      likes: property.likes.length
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Error toggling like" });
  }
};