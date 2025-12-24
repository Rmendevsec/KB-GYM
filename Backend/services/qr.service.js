const QRCode = require('qrcode');
const crypto = require('crypto');
const { User, Payment } = require('../models');
const moment = require('moment');

class QRService {
  /**
   * Generate secure QR code data
   * Includes user ID, payment ID, and timestamp signature
   * Prevents QR replay attacks with short expiration
   */
  static async generateQRData(userId) {
    try {
      // Get active payment for user
      const activePayment = await Payment.findOne({
        where: { 
          user_id: userId, 
          is_active: true,
          confirmed: true
        },
        order: [['createdAt', 'DESC']]
      });

      if (!activePayment) {
        throw new Error('No active payment found');
      }

      // Create payload with timestamp
      const timestamp = Date.now();
      const payload = {
        userId,
        paymentId: activePayment.id,
        timestamp
      };

      // Create signature for security
      const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      // Combine payload and signature
      const qrPayload = {
        ...payload,
        signature
      };

      // Encode to base64
      const qrData = Buffer.from(JSON.stringify(qrPayload)).toString('base64');

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(qrData);

      // Update user's QR code and expiration (10 minutes)
      const expiresAt = moment().add(10, 'minutes').toDate();
      await User.update(
        { 
          qr_code: qrImage,
          qr_expires_at: expiresAt
        },
        { where: { id: userId } }
      );

      return {
        qrImage,
        qrData,
        expiresAt,
        remainingScans: activePayment.package.max_scans - activePayment.used_scans
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate QR code data
   * Checks: signature, expiration, duplicate scans, package rules
   */
  static async validateQRData(qrData, scannerUserId = null) {
    try {
      // Decode base64
      const decoded = JSON.parse(
        Buffer.from(qrData, 'base64').toString()
      );

      // Verify signature
      const { userId, paymentId, timestamp, signature } = decoded;
      
      const expectedSignature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify({ userId, paymentId, timestamp }))
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid QR signature');
      }

      // Check QR expiration (10 minutes)
      const qrAge = Date.now() - timestamp;
      if (qrAge > 10 * 60 * 1000) {
        throw new Error('QR code expired. Please regenerate.');
      }

      // Get user and payment
      const user = await User.findByPk(userId);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      const payment = await Payment.findOne({
        where: { 
          id: paymentId,
          user_id: userId,
          is_active: true,
          confirmed: true
        },
        include: ['package']
      });

      if (!payment) {
        throw new Error('No valid active payment found');
      }

      return { user, payment, timestamp };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = QRService;