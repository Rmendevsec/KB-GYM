const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

class AuthController {
  static async register(req, res) {
    try {
      const { full_name, email, password, role, package_id } = req.body;
      
      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        });
      }

      // Create user
      const user = await User.create({
        full_name,
        email,
        password,
        role: role || 'user',
        is_active: true
      });

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'development-secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: userResponse, token }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed'
      });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await User.scope('withPassword').findOne({ where: { email } });
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(403).json({
          success: false,
          error: 'Account is deactivated'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'development-secret',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login successful',
        data: { user: userResponse, token }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const user = req.user;
      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AuthController;