import express from 'express';
import Property from '../models/Property.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, status, minPrice, maxPrice, city, state, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters
    if (type) query.type = type;
    if (status) query.status = status;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const properties = await Property.find(query)
      .populate('owner', 'name email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await Property.countDocuments(query);

    res.json({
      properties,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Increment views
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /properties
// @desc    Create a new property
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const newProperty = new Property({
      ...req.body,
      owner: req.user.id
    });

    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /properties/:id
// @desc    Update a property
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await property.remove();
    res.json({ message: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /properties/:id/like
// @desc    Like/Unlike a property
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if already liked
    const likeIndex = property.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      // Unlike
      property.likes.splice(likeIndex, 1);
    } else {
      // Like
      property.likes.push(req.user.id);
    }

    await property.save();
    res.json({ likes: property.likes });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;