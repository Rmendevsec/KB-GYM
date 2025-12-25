const express = require("express");
const router = express.Router();

const qrController = require("../controllers/qr.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// DEBUG
console.log("authMiddleware:", typeof authMiddleware);
console.log("getCurrentQR:", typeof qrController.getCurrentQR);

// Routes
router.get("/current", authMiddleware, qrController.getCurrentQR);
router.post("/scan", qrController.scanQR);

module.exports = router;
