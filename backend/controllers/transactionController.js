import Transaction from "../models/Transaction.js";
import Property from "../models/Property.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create new transaction
export const createTransaction = async (req, res) => {
  try {
    const { propertyId, type, amount } = req.body;

    // Get property details
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: "usd",
      metadata: {
        propertyId,
        buyerId: req.user.userId
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      property: propertyId,
      buyer: req.user.userId,
      seller: property.owner,
      type,
      amount,
      paymentInfo: {
        stripePaymentId: paymentIntent.id
      }
    });

    await transaction.save();

    res.status(201).json({
      message: "Transaction initiated",
      clientSecret: paymentIntent.client_secret,
      transaction
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ message: "Error creating transaction" });
  }
};

// Complete transaction after successful payment
export const completeTransaction = async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update transaction status
    transaction.status = "completed";
    transaction.paymentInfo.paymentMethod = paymentMethod;
    transaction.paymentInfo.paymentDate = new Date();

    // Update property status
    const property = await Property.findById(transaction.property);
    if (property) {
      property.status = transaction.type === "sale" ? "sold" : "rented";
      await property.save();
    }

    await transaction.save();

    res.json({
      message: "Transaction completed successfully",
      transaction
    });
  } catch (error) {
    console.error("Complete transaction error:", error);
    res.status(500).json({ message: "Error completing transaction" });
  }
};

// Get user's transactions
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ buyer: req.user.userId }, { seller: req.user.userId }]
    })
      .populate("property")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
};

// Get transaction by ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("property")
      .populate("buyer", "name email phoneNumber")
      .populate("seller", "name email phoneNumber");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check authorization
    if (
      transaction.buyer.toString() !== req.user.userId &&
      transaction.seller.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ message: "Error fetching transaction" });
  }
};

// Cancel transaction
export const cancelTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check authorization
    if (
      transaction.buyer.toString() !== req.user.userId &&
      transaction.seller.toString() !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Only pending transactions can be cancelled
    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Transaction cannot be cancelled" });
    }

    // Cancel Stripe payment intent
    if (transaction.paymentInfo.stripePaymentId) {
      await stripe.paymentIntents.cancel(transaction.paymentInfo.stripePaymentId);
    }

    transaction.status = "cancelled";
    await transaction.save();

    res.json({
      message: "Transaction cancelled successfully",
      transaction
    });
  } catch (error) {
    console.error("Cancel transaction error:", error);
    res.status(500).json({ message: "Error cancelling transaction" });
  }
};