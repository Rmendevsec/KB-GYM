const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 * Implements security features: token expiration, user lockout, account status
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Token expired. Please login again.' 
        });
      }
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid token.' 
        });
      }
      throw jwtError;
    }

    // Find user with password for validation
    const user = await User.scope('withPassword').findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found.' 
      });
    }

    // Check if user account is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Check if user is locked out
    if (user.isLocked()) {
      const lockoutTime = Math.ceil((user.lockout_until - new Date()) / 60000);
      return res.status(423).json({ 
        success: false, 
        error: `Account is temporarily locked. Try again in ${lockoutTime} minutes.` 
      });
    }

    // Check if token was issued before password change (if we track password change date)
    if (user.password_changed_at && decoded.iat * 1000 < user.password_changed_at) {
      return res.status(401).json({ 
        success: false, 
        error: 'Password changed. Please login again.' 
      });
    }

    // Remove sensitive data before attaching to request
    const userResponse = user.toJSON();
    delete userResponse.password;
    delete userResponse.qr_code; // Remove QR code from general auth

    // Attach user to request
    req.user = userResponse;
    req.token = token;
    
    // Update last login on significant actions
    if (req.method !== 'GET' || req.path.includes('/qr/scan')) {
      user.updateLastLogin();
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed.' 
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, just doesn't attach user
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        
        if (user && user.is_active && !user.isLocked()) {
          req.user = user.toJSON();
          req.token = token;
        }
      } catch (error) {
        // Token is invalid, but we don't fail the request
        console.debug('Optional authentication failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { authenticate, optionalAuthenticate };