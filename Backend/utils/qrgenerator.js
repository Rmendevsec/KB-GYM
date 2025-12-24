const QRCode = require('qrcode');
const crypto = require('crypto');
const moment = require('moment');

class QRGenerator {
  /**
   * Generate secure QR code for user
   * @param {string} userId - User UUID
   * @param {string} paymentId - Active payment UUID
   * @returns {Promise<Object>} QR code data and image
   */
  static async generateSecureQR(userId, paymentId) {
    try {
      // Create payload with timestamp
      const timestamp = Date.now();
      const payload = {
        userId,
        paymentId,
        timestamp,
        version: '1.0'
      };

      // Create signature using JWT secret
      const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      // Add signature to payload
      const signedPayload = {
        ...payload,
        signature
      };

      // Convert to base64
      const qrData = Buffer.from(JSON.stringify(signedPayload)).toString('base64');

      // Generate QR code image with error correction
      const qrImage = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'H', // High error correction (30%)
        type: 'image/png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Calculate expiration (10 minutes from now)
      const expiresAt = moment().add(10, 'minutes').toDate();

      return {
        qrData,
        qrImage,
        expiresAt,
        payload: signedPayload
      };
    } catch (error) {
      console.error('QR generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify QR code signature
   * @param {string} qrData - Base64 encoded QR data
   * @returns {Object} Verified payload or throws error
   */
  static verifyQRSignature(qrData) {
    try {
      // Decode base64
      const decoded = Buffer.from(qrData, 'base64').toString();
      const parsed = JSON.parse(decoded);

      // Extract signature from payload
      const { signature, ...payloadWithoutSignature } = parsed;

      // Recreate signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(payloadWithoutSignature))
        .digest('hex');

      // Verify signature
      if (signature !== expectedSignature) {
        throw new Error('Invalid QR signature');
      }

      // Check expiration (10 minutes)
      const timestamp = parseInt(payloadWithoutSignature.timestamp, 10);
      const qrAge = Date.now() - timestamp;
      const maxAge = 10 * 60 * 1000; // 10 minutes

      if (qrAge > maxAge) {
        throw new Error('QR code expired');
      }

      // Check if timestamp is in the future (shouldn't happen)
      if (timestamp > Date.now()) {
        throw new Error('Invalid QR timestamp');
      }

      return {
        ...payloadWithoutSignature,
        age: qrAge,
        expiresIn: maxAge - qrAge
      };
    } catch (error) {
      console.error('QR verification error:', error);
      throw error;
    }
  }

  /**
   * Generate temporary QR code for one-time use
   * @param {Object} data - Data to encode
   * @param {number} expiresInMinutes - Expiration time in minutes
   * @returns {Promise<Object>} Temporary QR code
   */
  static async generateTemporaryQR(data, expiresInMinutes = 5) {
    const timestamp = Date.now();
    const expiresAt = moment().add(expiresInMinutes, 'minutes').toDate();

    const payload = {
      data,
      timestamp,
      expiresAt: expiresAt.getTime(),
      type: 'temporary'
    };

    const signature = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const signedPayload = {
      ...payload,
      signature
    };

    const qrData = Buffer.from(JSON.stringify(signedPayload)).toString('base64');
    const qrImage = await QRCode.toDataURL(qrData);

    return {
      qrData,
      qrImage,
      expiresAt,
      payload: signedPayload
    };
  }

  /**
   * Generate batch of QR codes for multiple users
   * @param {Array} users - Array of user objects with id and paymentId
   * @returns {Promise<Array>} Array of QR codes
   */
  static async generateBatchQRCodes(users) {
    const qrPromises = users.map(async (user) => {
      try {
        const qr = await this.generateSecureQR(user.id, user.paymentId);
        return {
          userId: user.id,
          ...qr
        };
      } catch (error) {
        console.error(`Failed to generate QR for user ${user.id}:`, error);
        return {
          userId: user.id,
          error: error.message
        };
      }
    });

    return Promise.all(qrPromises);
  }

  /**
   * Generate QR code with custom options
   * @param {string} data - Data to encode
   * @param {Object} options - QR code options
   * @returns {Promise<string>} QR code data URL
   */
  static async generateCustomQR(data, options = {}) {
    const defaultOptions = {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    const mergedOptions = { ...defaultOptions, ...options };

    try {
      return await QRCode.toDataURL(data, mergedOptions);
    } catch (error) {
      console.error('Custom QR generation error:', error);
      throw new Error('Failed to generate custom QR code');
    }
  }

  /**
   * Validate QR data structure
   * @param {Object} payload - Decoded QR payload
   * @returns {Object} Validation result
   */
  static validateQRPayload(payload) {
    const errors = [];

    if (!payload.userId) {
      errors.push('Missing userId');
    }

    if (!payload.paymentId) {
      errors.push('Missing paymentId');
    }

    if (!payload.timestamp) {
      errors.push('Missing timestamp');
    }

    if (!payload.signature) {
      errors.push('Missing signature');
    }

    if (payload.timestamp && isNaN(parseInt(payload.timestamp, 10))) {
      errors.push('Invalid timestamp format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get QR code information without verification
   * @param {string} qrData - Base64 encoded QR data
   * @returns {Object} QR information
   */
  static getQRInfo(qrData) {
    try {
      const decoded = Buffer.from(qrData, 'base64').toString();
      const parsed = JSON.parse(decoded);

      const timestamp = parseInt(parsed.timestamp, 10);
      const age = Date.now() - timestamp;
      const maxAge = 10 * 60 * 1000;
      const expiresIn = Math.max(0, maxAge - age);

      return {
        userId: parsed.userId,
        paymentId: parsed.paymentId,
        timestamp: new Date(timestamp),
        age: moment.duration(age).humanize(),
        expiresIn: moment.duration(expiresIn).humanize(),
        isExpired: age > maxAge,
        hasSignature: !!parsed.signature
      };
    } catch (error) {
      return {
        error: 'Invalid QR data',
        details: error.message
      };
    }
  }
}

module.exports = QRGenerator;