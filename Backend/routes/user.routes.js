const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { getAllUsers } = require('../controllers/admin.controller');
const { getMe } = require("../controllers/user.controller");

router.get('/users', authMiddleware, getAllUsers);
// GET /api/users/me - Get current user profile
router.get("/me", authMiddleware, getMe);

// GET /api/users - Get all users (admin only)
router.get("/", authMiddleware, roleMiddleware('admin'), userController.getAllUsers);

module.exports = router;