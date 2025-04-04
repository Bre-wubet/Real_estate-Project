import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["sale", "rent"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled", "refunded"],
    default: "pending"
  },
  paymentInfo: {
    stripePaymentId: String,
    paymentMethod: String,
    paymentDate: Date
  },
  contractDetails: {
    startDate: Date,
    endDate: Date, // For rental properties
    terms: String,
    documents: [String] // URLs to uploaded documents
  },
  commission: {
    amount: Number,
    paid: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Pre-save hook to calculate commission
TransactionSchema.pre("save", function(next) {
  if (this.isNew || this.isModified("amount")) {
    this.commission.amount = this.amount * 0.03; // 3% commission
  }
  next();
});

export default mongoose.model("Transaction", TransactionSchema);