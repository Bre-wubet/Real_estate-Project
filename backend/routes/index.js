import express from "express";
import { auth, authorize } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import * as propertyController from "../controllers/propertyController.js";
import * as transactionController from "../controllers/transactionController.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", auth, authController.getCurrentUser);
router.put("/auth/profile", auth, authController.updateProfile);

// Property routes
router.post("/properties", auth, propertyController.createProperty);
router.get("/properties", propertyController.getProperties);
router.get("/properties/:id", propertyController.getPropertyById);
router.put("/properties/:id", auth, propertyController.updateProperty);
router.delete("/properties/:id", auth, propertyController.deleteProperty);
router.post("/properties/:id/like", auth, propertyController.toggleLikeProperty);

// Transaction routes
router.post("/transactions", auth, transactionController.createTransaction);
router.put("/transactions/:id/complete", auth, transactionController.completeTransaction);
router.get("/transactions", auth, transactionController.getUserTransactions);
router.get("/transactions/:id", auth, transactionController.getTransactionById);
router.put("/transactions/:id/cancel", auth, transactionController.cancelTransaction);

// Admin routes
router.get("/admin/transactions", auth, authorize("admin"), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("property")
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

export default router;