import express from 'express';
import Transaction from '../models/Transaction.js';
import Property from '../models/Property.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /transactions
// @desc    Get user's transactions
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }]
    })
      .populate('property')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('property')
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is part of the transaction
    if (transaction.buyer.toString() !== req.user.id && 
        transaction.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /transactions
// @desc    Create a new transaction
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { propertyId, type, amount } = req.body;

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Create transaction
    const newTransaction = new Transaction({
      property: propertyId,
      buyer: req.user.id,
      seller: property.owner,
      type,
      amount,
      status: 'pending'
    });

    const transaction = await newTransaction.save();
    await transaction.populate([
      { path: 'property' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' }
    ]);

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /transactions/:id/complete
// @desc    Complete a transaction
// @access  Private
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyer.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = Date.now();
    transaction.paymentMethod = req.body.paymentMethod;

    // Update property status
    const property = await Property.findById(transaction.property);
    if (property) {
      property.status = transaction.type === 'purchase' ? 'sold' : 'rented';
      await property.save();
    }

    await transaction.save();
    await transaction.populate([
      { path: 'property' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' }
    ]);

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /transactions/:id/cancel
// @desc    Cancel a transaction
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is part of the transaction
    if (transaction.buyer.toString() !== req.user.id && 
        transaction.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update transaction status
    transaction.status = 'cancelled';
    transaction.cancelledAt = Date.now();
    transaction.cancelledBy = req.user.id;

    await transaction.save();
    await transaction.populate([
      { path: 'property' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' }
    ]);

    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;