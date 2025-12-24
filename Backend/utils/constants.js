module.exports = {
  // Application constants
  APP_NAME: 'Gym Management System',
  APP_VERSION: '1.0.0',
  
  // JWT Constants
  JWT_ALGORITHM: 'HS256',
  JWT_EXPIRY: '24h',
  JWT_REFRESH_EXPIRY: '7d',
  
  // QR Code Constants
  QR_EXPIRE_MINUTES: 10,
  QR_ERROR_CORRECTION: 'H', // High (30%)
  QR_SIZE: 300,
  
  // Security Constants
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  PASSWORD_MIN_LENGTH: 8,
  SALT_ROUNDS: 12,
  TOKEN_BLACKLIST_TTL: 3600, // 1 hour in seconds
  
  // Rate Limiting Constants
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX: 100, // requests per window
  
  // Package Constants
  PACKAGE_TYPES: {
    ONE_MONTH: '1 Month',
    THREE_MONTH: '3 Month',
    SIX_MONTH: '6 Month',
    ONE_YEAR: '1 Year'
  },
  
  PACKAGE_MAX_SCANS: {
    ONE_MONTH: 40,
    THREE_MONTH: 120,
    SIX_MONTH: 240,
    ONE_YEAR: 480
  },
  
  PACKAGE_SUNDAY_BONUS: {
    ONE_MONTH: false,
    THREE_MONTH: true,
    SIX_MONTH: true,
    ONE_YEAR: true
  },
  
  // Scan Rules
  WEEKLY_SCAN_LIMIT: 3,
  DAILY_SCAN_LIMIT: 1,
  SUNDAY_INDEX: 0, // JavaScript Date.getDay() returns 0 for Sunday
  
  // Day Constants
  DAYS_OF_WEEK: {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  },
  
  DAYS_SHORT: {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
  },
  
  // Role Constants
  ROLES: {
    ADMIN: 'admin',
    CASHIER: 'cashier',
    USER: 'user'
  },
  
  ROLE_HIERARCHY: {
    admin: 3,
    cashier: 2,
    user: 1
  },
  
  // Permission Constants
  PERMISSIONS: {
    // Admin permissions
    ADMIN: {
      USER_MANAGEMENT: 'user:manage',
      PACKAGE_MANAGEMENT: 'package:manage',
      PAYMENT_MANAGEMENT: 'payment:manage',
      ACCESS_LOG_VIEW: 'access_log:view',
      SYSTEM_SETTINGS: 'system:settings'
    },
    
    // Cashier permissions
    CASHIER: {
      SCAN_QR: 'qr:scan',
      VIEW_USER_INFO: 'user:view',
      VIEW_ACCESS_LOGS: 'access_log:view:own'
    },
    
    // User permissions
    USER: {
      VIEW_OWN_PROFILE: 'profile:view:own',
      VIEW_OWN_QR: 'qr:view:own',
      VIEW_OWN_SCANS: 'scan:view:own',
      UPDATE_OWN_PROFILE: 'profile:update:own'
    }
  },
  
  // Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    GONE: 410,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  },
  
  // Error Messages
  ERROR_MESSAGES: {
    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCOUNT_LOCKED: 'Account is temporarily locked. Please try again later.',
    SESSION_EXPIRED: 'Session expired. Please login again.',
    INVALID_TOKEN: 'Invalid authentication token',
    ACCESS_DENIED: 'Access denied. Insufficient permissions.',
    
    // User errors
    USER_NOT_FOUND: 'User not found',
    USER_INACTIVE: 'User account is inactive',
    EMAIL_EXISTS: 'Email already exists',
    INVALID_EMAIL: 'Invalid email format',
    WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, and number',
    
    // Package errors
    PACKAGE_NOT_FOUND: 'Package not found',
    PACKAGE_INACTIVE: 'Package is not active',
    MAX_SCANS_REACHED: 'Maximum scans reached for this package',
    
    // Scan errors
    DUPLICATE_SCAN: 'Already scanned today',
    WEEKLY_LIMIT_REACHED: 'Weekly scan limit reached (3 scans/week)',
    SUNDAY_NOT_ALLOWED: 'Sunday access not allowed for this package',
    QR_EXPIRED: 'QR code expired. Please regenerate.',
    INVALID_QR: 'Invalid QR code',
    
    // Payment errors
    PAYMENT_NOT_FOUND: 'Payment not found',
    PAYMENT_EXPIRED: 'Payment has expired',
    PAYMENT_NOT_CONFIRMED: 'Payment not confirmed',
    
    // Validation errors
    VALIDATION_ERROR: 'Validation failed',
    REQUIRED_FIELD: 'This field is required',
    INVALID_UUID: 'Invalid ID format',
    INVALID_DATE: 'Invalid date format',
    
    // System errors
    DATABASE_ERROR: 'Database error occurred',
    INTERNAL_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    PACKAGE_CREATED: 'Package created successfully',
    PACKAGE_UPDATED: 'Package updated successfully',
    PAYMENT_CONFIRMED: 'Payment confirmed successfully',
    SCAN_SUCCESS: 'Scan successful',
    QR_GENERATED: 'QR code generated successfully',
    QR_REGENERATED: 'QR code regenerated successfully'
  },
  
  // Validation Patterns
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/,
    PHONE: /^\+?[1-9]\d{1,14}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
    TIME_24H: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  
  // Business Rules
  BUSINESS_HOURS: {
    OPEN: '06:00',
    CLOSE: '22:00',
    TIMEZONE: 'UTC' // Default timezone
  },
  
  // Cache TTLs (in seconds)
  CACHE_TTL: {
    USER_PROFILE: 300, // 5 minutes
    PACKAGE_LIST: 600, // 10 minutes
    SCAN_STATS: 60, // 1 minute
    QR_CODE: 600 // 10 minutes (matches QR expiry)
  },
  
  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },
  
  // File Upload Limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    ALLOWED_DOC_TYPES: ['application/pdf', 'application/msword']
  },
  
  // Notification Types
  NOTIFICATION_TYPES: {
    SCAN_SUCCESS: 'scan_success',
    SCAN_FAILED: 'scan_failed',
    PACKAGE_EXPIRING: 'package_expiring',
    PACKAGE_EXPIRED: 'package_expired',
    WEEKLY_LIMIT_REACHED: 'weekly_limit_reached',
    NEW_PAYMENT: 'new_payment',
    SYSTEM_ALERT: 'system_alert'
  }
};