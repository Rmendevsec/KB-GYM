const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// POST /api/auth/register
router.post("/register", authController.registerController);

// POST /api/auth/login
router.post("/login", authController.loginController);

module.exports = router;