const userService = require("../services/user.service");
// Backend/controllers/user.controller.js
const { User, Payment, Package } = require("../models"); // ✅ ADD THIS

const getProfile = async (req, res, next) => {
  try {
    const userProfile = await userService.getProfile(req.user.id);
    
    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: userProfile
    });
  } catch (error) {
    next(error);
  }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Payment,
        where: { is_confirmed: true },
        include: Package,
        required: false,
        limit: 1,
        order: [["created_at", "DESC"]],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ data: user });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAllUsers = async (req, res, next) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required"
      });
    }

    const users = await userService.getAllUsers();
    
    res.json({
      success: true,
      message: "Users retrieved successfully",
      data: users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getAllUsers,
  getMe
};