import Property from "../models/Property.js";
import path from "path";
import fs from "fs";

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
      description,
      price,
      type,
      status = 'Available',
      amenities = [],
      location = {},
      features = {}
    } = req.body;

    // Validate features
    if (!features.bedrooms || !features.bathrooms || !features.area) {
      return res.status(400).json({
        message: "Missing required features",
        details: "Bedrooms, bathrooms, and area are required"
      });
    }

    // Validate required fields
    if (!title?.trim() || !description?.trim() || !type || !price) {
      return res.status(400).json({ 
        message: "Missing required fields",
        details: "Title, description, type, and price are required"
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
      description: description.trim(),
      type,
      price: parsedPrice,
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

    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");
    if (bedrooms) query["features.bedrooms"] = { $gte: parseInt(bedrooms) };
    if (bathrooms) query["features.bathrooms"] = { $gte: parseInt(bathrooms) };
    if (minPrice) query.price = { $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    if (search) query.$text = { $search: search };

    const properties = await Property.find(query)
      .populate("owner", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ message: "Error fetching properties" });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("owner", "name email phoneNumber")
      .populate("likes", "name");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ message: "Error fetching property" });
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