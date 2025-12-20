const { User, Role } = require("../models");

const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{
      model: Role,
      attributes: ['id', 'name', 'description']
    }],
    attributes: ['id', 'full_name', 'email', 'is_active', 'created_at', 'updated_at']
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.Role.name,
    is_active: user.is_active,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
};

const getAllUsers = async () => {
  return await User.findAll({
    include: [{
      model: Role,
      attributes: ['name']
    }],
    attributes: ['id', 'full_name', 'email', 'is_active', 'created_at']
  });
};

module.exports = {
  getProfile,
  getAllUsers
};