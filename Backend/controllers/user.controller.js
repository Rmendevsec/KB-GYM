const userService = require("../services/user.service");
const { User, Payment, Package, Role } = require("../models"); 

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

// In your user controller
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id', 
        'full_name', 
        'phone_number', 
        'registered_at', 
        'expire_at', 
        'used_scans', 
        'is_active',
        'package_id'
      ],
      include: [
        {
          model: Package,
          as: 'package',
          attributes: ['name', 'max_scans', 'duration_days']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      success: true,
      data: user 
    });
  } catch (err) {
    console.error("GET /users/me error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsersHandler = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, attributes: ["name"] }, 
        {
          model: Package,
          as: "package",
          attributes: ["name", "max_scans", "duration_days"] 
        }
      ],
      order: [["created_at", "DESC"]],
    });

    console.log("DEBUG - Total users:", users.length);
    if (users.length > 0) {
      console.log("DEBUG - First user's package:", {
        name: users[0]?.package?.name,
        max_scans: users[0]?.package?.max_scans,
        has_max_scans: users[0]?.package?.hasOwnProperty('max_scans')
      });
    }
    
    const formattedUsers = users.map(u => {
      let remainingScans = "Unlimited";

      if (u.package && u.package.max_scans !== null && u.package.max_scans !== undefined) {
        const max = Number(u.package.max_scans);
        const used = Number(u.used_scans || 0);
        remainingScans = Math.max(max - used, 0);
      }

      return {
        id: u.id,
        name: u.full_name,
        phone: u.phone_number,
        role: u.Role?.name || "N/A",
        active: u.is_active ? "Yes" : "No",
        package: u.package?.name || "N/A",
        createdAt: u.registered_at,
        expireAt: u.expire_at,
        remainingScans,
      };
    });

    res.json({ success: true, data: formattedUsers });
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const testDirectQuery = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{
        model: Package,
        as: 'package',
        attributes: ['name', 'max_scans']
      }],
      limit: 1
    });
    
    res.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        name: u.full_name,
        package: u.package ? {
          name: u.package.name,
          max_scans: u.package.max_scans
        } : null
      }))
    });
  } catch (error) {
    console.error('Direct query error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  getAllUsers: getAllUsersHandler, 
  getMe,
  testDirectQuery
};