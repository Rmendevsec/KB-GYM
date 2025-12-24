const winston = require('winston');
const { Sequelize } = require('sequelize');

// Configure logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user?.id
  });

  // Sequelize errors
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.errors.map(e => e.message)
    });
  }

  if (err instanceof Sequelize.UniqueConstraintError) {
    return res.status(409).json({
      success: false,
      error: 'Duplicate entry',
      details: err.errors.map(e => e.message)
    });
  }

  if (err instanceof Sequelize.DatabaseError) {
    return res.status(500).json({
      success: false,
      error: 'Database error occurred'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      success: false, 
      error: 'Token expired' 
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler, logger };