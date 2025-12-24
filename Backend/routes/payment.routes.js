const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// Only admin can confirm payments
router.post("/confirm", authMiddleware, roleMiddleware("admin"), paymentController.confirmPayment);

module.exports = router;
