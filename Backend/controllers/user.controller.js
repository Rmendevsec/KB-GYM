const userService = require("../services/user.service");

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
  getAllUsers
};