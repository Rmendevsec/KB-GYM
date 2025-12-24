const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `${timestamp} [${level}]: ${message} ${metaString}`;
    }
  )
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'gym-management-api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write audit logs to separate file
    new winston.transports.File({
      filename: path.join(logsDir, 'audit.log'),
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Add HTTP request logging transport
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

// Custom log levels for different types of logs
const logLevels = {
  SECURITY: 0,
  AUDIT: 1,
  BUSINESS: 2,
  DEBUG: 3
};

// Security logger for sensitive operations
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'security.log'),
      level: 'info'
    })
  ]
});

// Audit logger for compliance and tracking
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, 'audit-trail.log'),
      level: 'info'
    })
  ]
});

// Helper functions for different log types
const LogHelper = {
  /**
   * Log security events
   */
  security: (event, details) => {
    securityLogger.info(event, {
      ...details,
      timestamp: new Date().toISOString(),
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown'
    });
  },

  /**
   * Log audit events for compliance
   */
  audit: (action, user, resource, changes) => {
    auditLogger.info(action, {
      userId: user?.id,
      userEmail: user?.email,
      userRole: user?.role,
      resource,
      changes,
      timestamp: new Date().toISOString(),
      ip: user?.ip || 'unknown'
    });
  },

  /**
   * Log business logic events
   */
  business: (event, data) => {
    logger.log({
      level: 'info',
      message: event,
      category: 'business',
      ...data
    });
  },

  /**
   * Log QR code events
   */
  qr: (action, userId, details) => {
    logger.info(`QR ${action}`, {
      userId,
      category: 'qr',
      ...details
    });
  },

  /**
   * Log scan events
   */
  scan: (action, userId, scannerId, result) => {
    logger.info(`Scan ${action}`, {
      userId,
      scannerId,
      category: 'scan',
      result,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log payment events
   */
  payment: (action, userId, paymentId, amount) => {
    logger.info(`Payment ${action}`, {
      userId,
      paymentId,
      amount,
      category: 'payment',
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log user management events
   */
  user: (action, userId, adminId, changes) => {
    logger.info(`User ${action}`, {
      userId,
      adminId,
      changes,
      category: 'user',
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Log API requests
   */
  api: (req, res, responseTime) => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.id,
      userRole: req.user?.role
    };

    // Don't log sensitive data
    delete logData.body?.password;
    delete logData.body?.token;

    logger.http('API Request', logData);
  },

  /**
   * Log errors with context
   */
  error: (error, context = {}) => {
    logger.error(error.message, {
      error: error.toString(),
      stack: error.stack,
      ...context
    });
  },

  /**
   * Log warnings
   */
  warn: (message, context = {}) => {
    logger.warn(message, context);
  },

  /**
   * Log debug information
   */
  debug: (message, data = {}) => {
    logger.debug(message, data);
  },

  /**
   * Log info messages
   */
  info: (message, data = {}) => {
    logger.info(message, data);
  }
};

// HTTP request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request body (excluding sensitive data)
  const loggableBody = { ...req.body };
  delete loggableBody.password;
  delete loggableBody.token;
  delete loggableBody.qrData;

  logger.debug('Request received', {
    method: req.method,
    url: req.originalUrl,
    body: loggableBody,
    query: req.query,
    params: req.params,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    LogHelper.api(req, res, duration);
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  LogHelper.error(err, {
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    ip: req.ip
  });

  next(err);
};

module.exports = {
  logger,
  securityLogger,
  auditLogger,
  LogHelper,
  requestLogger,
  errorLogger,
  logLevels
};