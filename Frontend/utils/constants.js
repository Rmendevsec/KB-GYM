export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  USER: 'user'
};

export const PACKAGE_TYPES = {
  ONE_MONTH: '1 Month',
  THREE_MONTH: '3 Month',
  SIX_MONTH: '6 Month',
  ONE_YEAR: '1 Year'
};

export const SCAN_STATUS = {
  VALID: 'valid',
  INVALID: 'invalid',
  EXPIRED: 'expired',
  DUPLICATE: 'duplicate',
  MAX_REACHED: 'max_reached',
  WEEK_LIMIT: 'week_limit',
  SUNDAY_NOT_ALLOWED: 'sunday_not_allowed'
};

export const DAYS_OF_WEEK = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me'
  },
  ADMIN: {
    USERS: '/admin/users',
    DASHBOARD_STATS: '/admin/dashboard-stats',
    ACCESS_LOGS: '/admin/access-logs'
  },
  QR: {
    CURRENT: '/qr/current',
    SCAN: '/qr/scan',
    STATS: '/qr/stats'
  }
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  ACCESS_DENIED: 'Access denied. Insufficient permissions.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account locked. Please try again later.'
};