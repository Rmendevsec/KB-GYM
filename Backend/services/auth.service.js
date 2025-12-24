const jwt = require('jsonwebtoken');
const { User, Payment, Package } = require('../models');

class AuthService {
  static async registerUser(userData, createdBy = null) {
    const transaction = await sequelize.transaction();

    try {
      // Create user
      const user = await User.create({
        ...userData,
        created_by: createdBy
      }, { transaction });

      // Create payment record
      const payment = await Payment.create({
        user_id: user.id,
        package_id: userData.package_id,
        confirmed: true,
        confirmed_by: createdBy,
        start_date: new Date()
      }, { transaction });

      await transaction.commit();

      // Remove password from response
      const userResponse = user.toJSON();
      delete userResponse.password;

      return { user: userResponse, payment };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked()) {
      const lockoutTime = Math.ceil((user.lockout_until - new Date()) / 60000);
      throw new Error(`Account locked. Try again in ${lockoutTime} minutes.`);
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      await user.incrementLoginAttempts();
      throw new Error('Invalid credentials');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Remove sensitive data
    const userResponse = user.toJSON();
    delete userResponse.password;

    return { user: userResponse, token };
  }
}

module.exports = AuthService;