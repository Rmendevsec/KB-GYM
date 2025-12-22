  const { User, Role } = require("../models");
  const { hashPassword, comparePassword } = require("../utils/password");
  const { generateToken } = require("../utils/jwt");

const register = async (userData) => {
  const existingUser = await User.findOne({
    where: { email: userData.email }
  });
  if (existingUser) {
    throw new Error("User with this email already exists");
  }


  if (!userData.full_name || !userData.email || !userData.password || !userData.role_id) {
    throw new Error("All fields are required");
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user 
  const user = await User.create({
    full_name: userData.full_name,   
    email: userData.email,
    password: hashedPassword,
    role_id: userData.role_id        
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role_id: user.role_id
  });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      is_active: user.is_active
    },
    token
  };
};


  const login = async (email, password) => {
    // Find user with role
    const user = await User.scope('withPassword').findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['name']
      }]
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error("Account is deactivated");
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.Role.name
    });

    return {
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.Role.name,
        is_active: user.is_active
      },
      token
    };
  };

  module.exports = {
    register,
    login
  };