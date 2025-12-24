const Joi = require('joi');
const { isValidUUID } = require('../utils/validators');

// Common validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    full_name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .max(100)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    role: Joi.string()
      .valid('admin', 'cashier', 'user')
      .default('user')
      .messages({
        'any.only': 'Role must be one of: admin, cashier, user'
      }),
    package_id: Joi.string()
      .custom((value, helpers) => {
        if (!isValidUUID(value)) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .required()
      .messages({
        'any.invalid': 'Invalid package ID format',
        'any.required': 'Package ID is required'
      })
  }).options({ stripUnknown: true }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required'
      })
  }).options({ stripUnknown: true }),

  // QR schemas
  scanQR: Joi.object({
    qrData: Joi.string()
      .required()
      .messages({
        'string.empty': 'QR data is required'
      })
  }).options({ stripUnknown: true }),

  // Admin schemas
  createPackage: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.empty': 'Package name is required',
        'string.min': 'Package name must be at least 2 characters',
        'string.max': 'Package name cannot exceed 50 characters'
      }),
    max_scans: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        'number.base': 'Max scans must be a number',
        'number.integer': 'Max scans must be an integer',
        'number.min': 'Max scans must be at least 1'
      }),
    sunday_bonus: Joi.boolean()
      .required()
      .messages({
        'boolean.base': 'Sunday bonus must be true or false'
      }),
    price: Joi.number()
      .precision(2)
      .positive()
      .required()
      .messages({
        'number.base': 'Price must be a number',
        'number.positive': 'Price must be positive',
        'number.precision': 'Price can have maximum 2 decimal places'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    duration_days: Joi.number()
      .integer()
      .min(1)
      .optional()
      .messages({
        'number.base': 'Duration must be a number',
        'number.integer': 'Duration must be an integer',
        'number.min': 'Duration must be at least 1 day'
      })
  }).options({ stripUnknown: true }),

  updateUser: Joi.object({
    full_name: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters'
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    role: Joi.string()
      .valid('admin', 'cashier', 'user')
      .optional()
      .messages({
        'any.only': 'Role must be one of: admin, cashier, user'
      }),
    is_active: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Status must be true or false'
      })
  }).options({ stripUnknown: true }),

  // Query parameter schemas
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    sort: Joi.string()
      .pattern(/^[a-zA-Z_]+:(asc|desc)$/)
      .optional()
      .messages({
        'string.pattern.base': 'Sort must be in format: field:asc or field:desc'
      })
  }).options({ stripUnknown: true }),

  dateRange: Joi.object({
    startDate: Joi.date()
      .iso()
      .optional()
      .messages({
        'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
      }),
    endDate: Joi.date()
      .iso()
      .min(Joi.ref('startDate'))
      .optional()
      .messages({
        'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
        'date.min': 'End date cannot be before start date'
      })
  }).options({ stripUnknown: true })
};

// Validation middleware factory
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Collect all errors
      allowUnknown: false // Disallow unknown fields
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      });
    }
    
    // Replace request data with validated data
    req[property] = value;
    next();
  };
};

// Validate UUID parameter
const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];
    
    if (!isValidUUID(value)) {
      return res.status(400).json({
        success: false,
        error: `Invalid ${paramName} format. Must be a valid UUID.`
      });
    }
    
    next();
  };
};

// Validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true, // Allow other query params
      stripUnknown: true // Remove unknown params
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: 'Invalid query parameters',
        details: errorDetails
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = { 
  validate, 
  validateUUID, 
  validateQuery, 
  schemas 
};