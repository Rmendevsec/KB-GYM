/**
 * Role-based authorization middleware
 * Ensures user has required role(s) to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required.' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log unauthorized access attempt
      console.warn(`Unauthorized access attempt: User ${req.user.id} (${req.user.role}) tried to access ${req.method} ${req.path}`);
      
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${req.user.role}` 
      });
    }

    next();
  };
};

/**
 * Permission checker middleware
 * Checks if user has permission to access specific resource
 */
const checkPermission = (resourceType, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Admin has all permissions
      if (user.role === 'admin') {
        return next();
      }

      // Cashier permissions
      if (user.role === 'cashier') {
        const allowedActions = {
          user: ['read'],
          qr: ['scan'],
          access_log: ['create']
        };
        
        if (allowedActions[resourceType]?.includes(action)) {
          return next();
        }
      }

      // User permissions - can only access own resources
      if (user.role === 'user') {
        // Users can only access their own data
        if (req.params.userId && req.params.userId !== user.id) {
          return res.status(403).json({ 
            success: false, 
            error: 'You can only access your own data.' 
          });
        }
        
        const allowedActions = {
          user: ['read', 'update'],
          qr: ['read'],
          payment: ['read'],
          access_log: ['read']
        };
        
        if (allowedActions[resourceType]?.includes(action)) {
          return next();
        }
      }

      return res.status(403).json({ 
        success: false, 
        error: `Insufficient permissions for ${action} on ${resourceType}.` 
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Permission check failed.' 
      });
    }
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources unless admin
 */
const checkOwnership = (modelName, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      // Admin can access all resources
      if (user.role === 'admin') {
        return next();
      }

      const { [paramName]: resourceId } = req.params;
      
      // Get model
      const { sequelize } = require('../models');
      const modelMap = {
        user: sequelize.models.User,
        payment: sequelize.models.Payment,
        access_log: sequelize.models.AccessLog
      };
      
      const Model = modelMap[modelName];
      if (!Model) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid resource type.' 
        });
      }

      // Find resource
      const resource = await Model.findByPk(resourceId);
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          error: 'Resource not found.' 
        });
      }

      // Check ownership
      let isOwner = false;
      
      switch (modelName) {
        case 'user':
          isOwner = resource.id === user.id;
          break;
        case 'payment':
          isOwner = resource.user_id === user.id;
          break;
        case 'access_log':
          isOwner = resource.user_id === user.id;
          break;
        default:
          isOwner = false;
      }

      if (!isOwner) {
        return res.status(403).json({ 
          success: false, 
          error: 'You can only access your own resources.' 
        });
      }

      // Attach resource to request for later use
      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Ownership check failed.' 
      });
    }
  };
};

module.exports = { authorize, checkPermission, checkOwnership };