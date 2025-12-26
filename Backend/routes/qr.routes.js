const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const { getCurrentQR, scanQR } = require("../controllers/qr.controller");

router.get("/current", authMiddleware, getCurrentQR);
router.post("/scan", authMiddleware, scanQR);

module.exports = router;
