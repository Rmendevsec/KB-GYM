const Joi = require('joi');
const moment = require('moment');

/**
 * Validates if a string is a valid UUID v4
 */
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * Minimum 8 characters, at least one uppercase, one lowercase, one number
 */
const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates phone number (basic international format)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validates date string format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) && date.toISOString().slice(0, 10) === dateString;
};

/**
 * Validates if date is in the future
 */
const isFutureDate = (dateString) => {
  if (!isValidDate(dateString)) return false;
  return moment(dateString).isAfter(moment());
};

/**
 * Validates if date is in the past
 */
const isPastDate = (dateString) => {
  if (!isValidDate(dateString)) return false;
  return moment(dateString).isBefore(moment());
};

/**
 * Validates if a number is within range
 */
const isWithinRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

/**
 * Validates credit card number (Luhn algorithm)
 */
const isValidCreditCard = (cardNumber) => {
  // Remove non-digits
  cardNumber = cardNumber.replace(/\D/g, '');
  
  // Check length
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validates if string contains only letters and spaces
 */
const isAlphaWithSpaces = (str) => {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(str);
};

/**
 * Validates if string contains only letters, numbers, and basic punctuation
 */
const isAlphanumericWithPunctuation = (str) => {
  const regex = /^[A-Za-z0-9\s.,!?'"-]+$/;
  return regex.test(str);
};

/**
 * Validates URL format
 */
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates file extension
 */
const isValidFileExtension = (filename, allowedExtensions) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedExtensions.includes(extension);
};

/**
 * Validates file size (in bytes)
 */
const isValidFileSize = (fileSize, maxSizeBytes) => {
  return fileSize <= maxSizeBytes;
};

/**
 * Validates if value is a valid percentage (0-100)
 */
const isValidPercentage = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

/**
 * Validates if value is a positive integer
 */
const isPositiveInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

/**
 * Validates if value is a positive number (including decimals)
 */
const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates QR code data format
 */
const isValidQRData = (qrData) => {
  try {
    // Decode base64
    const decoded = Buffer.from(qrData, 'base64').toString();
    const parsed = JSON.parse(decoded);
    
    // Check required fields
    if (!parsed.userId || !parsed.paymentId || !parsed.timestamp || !parsed.signature) {
      return false;
    }
    
    // Validate UUIDs
    if (!isValidUUID(parsed.userId) || !isValidUUID(parsed.paymentId)) {
      return false;
    }
    
    // Validate timestamp (should be within last 10 minutes)
    const timestamp = parseInt(parsed.timestamp, 10);
    if (isNaN(timestamp) || timestamp > Date.now()) {
      return false;
    }
    
    // Check if QR expired (10 minutes)
    const qrAge = Date.now() - timestamp;
    if (qrAge > 10 * 60 * 1000) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sanitizes user input to prevent XSS
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Trims and normalizes whitespace in strings
 */
const normalizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/\s+/g, ' ');
};

/**
 * Validates day of week (0-6)
 */
const isValidDayOfWeek = (day) => {
  const num = Number(day);
  return !isNaN(num) && num >= 0 && num <= 6;
};

/**
 * Validates time format (HH:MM)
 */
const isValidTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * Validates if time is within business hours
 */
const isWithinBusinessHours = (time, open = '06:00', close = '22:00') => {
  if (!isValidTime(time) || !isValidTime(open) || !isValidTime(close)) {
    return false;
  }
  
  const [timeHour, timeMinute] = time.split(':').map(Number);
  const [openHour, openMinute] = open.split(':').map(Number);
  const [closeHour, closeMinute] = close.split(':').map(Number);
  
  const timeInMinutes = timeHour * 60 + timeMinute;
  const openInMinutes = openHour * 60 + openMinute;
  const closeInMinutes = closeHour * 60 + closeMinute;
  
  return timeInMinutes >= openInMinutes && timeInMinutes <= closeInMinutes;
};

/**
 * Validates package scan rules
 */
const validatePackageScanRules = (packageData) => {
  const errors = [];
  
  if (!packageData.max_scans || !isPositiveInteger(packageData.max_scans)) {
    errors.push('Max scans must be a positive integer');
  }
  
  if (typeof packageData.sunday_bonus !== 'boolean') {
    errors.push('Sunday bonus must be true or false');
  }
  
  if (packageData.duration_days && !isPositiveInteger(packageData.duration_days)) {
    errors.push('Duration days must be a positive integer if provided');
  }
  
  if (!packageData.price || !isPositiveNumber(packageData.price)) {
    errors.push('Price must be a positive number');
  }
  
  return errors;
};

/**
 * Creates a Joi schema for validation
 */
const createValidationSchema = (fields) => {
  let schema = Joi.object().keys({});
  
  fields.forEach(field => {
    let fieldSchema;
    
    switch (field.type) {
      case 'string':
        fieldSchema = Joi.string();
        if (field.minLength) fieldSchema = fieldSchema.min(field.minLength);
        if (field.maxLength) fieldSchema = fieldSchema.max(field.maxLength);
        if (field.pattern) fieldSchema = fieldSchema.pattern(new RegExp(field.pattern));
        if (field.required) fieldSchema = fieldSchema.required();
        break;
        
      case 'number':
        fieldSchema = Joi.number();
        if (field.min) fieldSchema = fieldSchema.min(field.min);
        if (field.max) fieldSchema = fieldSchema.max(field.max);
        if (field.integer) fieldSchema = fieldSchema.integer();
        if (field.required) fieldSchema = fieldSchema.required();
        break;
        
      case 'boolean':
        fieldSchema = Joi.boolean();
        if (field.required) fieldSchema = fieldSchema.required();
        break;
        
      case 'date':
        fieldSchema = Joi.date().iso();
        if (field.required) fieldSchema = fieldSchema.required();
        break;
        
      case 'email':
        fieldSchema = Joi.string().email();
        if (field.required) fieldSchema = fieldSchema.required();
        break;
        
      case 'uuid':
        fieldSchema = Joi.string().uuid({ version: 'uuidv4' });
        if (field.required) fieldSchema = fieldSchema.required();
        break;
    }
    
    schema = schema.append({ [field.name]: fieldSchema });
  });
  
  return schema;
};

module.exports = {
  isValidUUID,
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidDate,
  isFutureDate,
  isPastDate,
  isWithinRange,
  isValidCreditCard,
  isAlphaWithSpaces,
  isAlphanumericWithPunctuation,
  isValidURL,
  isValidFileExtension,
  isValidFileSize,
  isValidPercentage,
  isPositiveInteger,
  isPositiveNumber,
  isValidQRData,
  sanitizeInput,
  normalizeString,
  isValidDayOfWeek,
  isValidTime,
  isWithinBusinessHours,
  validatePackageScanRules,
  createValidationSchema
};