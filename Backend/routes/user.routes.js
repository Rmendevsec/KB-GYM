const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

// GET /api/users/me - Get current user profile
router.get("/me", authMiddleware, userController.getProfile);

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware, roleMiddleware('admin'), userController.getAllUsers);

module.exports = router;