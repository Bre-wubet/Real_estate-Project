import Property from "../models/Property.js";

// Create new property listing
export const createProperty = async (req, res) => {
  try {
    const property = new Property({
      ...req.body,
      owner: req.user.userId
    });

    await property.save();
    res.status(201).json({
      message: "Property listed successfully",
      property
    });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ message: "Error creating property listing" });
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
    if (property.owner.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    if (property.owner.toString() !== req.user.userId && req.user.role !== "admin") {
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