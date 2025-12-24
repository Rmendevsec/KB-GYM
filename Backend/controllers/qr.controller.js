const QRService = require('../services/qr.service');
const ScanService = require('../services/scan.service');
const { User, Payment, AccessLog } = require('../models');

class QRController {
  /**
   * Get current QR code for authenticated user
   */
  static async getCurrentQR(req, res) {
    try {
      const userId = req.user.id;
      
      // Generate new QR code
      const qrData = await QRService.generateQRData(userId);
      
      // Update user's QR code in database
      await User.update(
        {
          qr_code: qrData.qrImage,
          qr_expires_at: qrData.expiresAt
        },
        { where: { id: userId } }
      );

      // Get user stats
      const stats = await ScanService.getUserStats(userId);

      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrImage: qrData.qrImage,
          expiresAt: qrData.expiresAt,
          remainingScans: stats ? stats.stats.remainingScans : 0,
          refreshIn: 10 * 60 * 1000 // 10 minutes in milliseconds
        }
      });
    } catch (error) {
      console.error('QR generation error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to generate QR code'
      });
    }
  }

  /**
   * Scan a QR code (cashier/admin only)
   */
  static async scanQR(req, res) {
    try {
      const { qrData } = req.body;
      const scannerUserId = req.user.id;
      const scannerRole = req.user.role;

      // Validate QR data
      const validation = await QRService.validateQRData(qrData, scannerUserId);
      
      // Process the scan
      const result = await ScanService.processScan(
        validation.user.id,
        validation.payment.id,
        scannerUserId,
        `Scanned by ${scannerRole}: ${req.user.full_name}`
      );

      res.json({
        success: true,
        message: 'Scan successful',
        data: result
      });
    } catch (error) {
      console.error('QR scan error:', error);
      
      // Determine appropriate status code
      let statusCode = 400;
      if (error.message.includes('inactive') || error.message.includes('not found')) {
        statusCode = 404;
      } else if (error.message.includes('expired')) {
        statusCode = 410; // Gone
      } else if (error.message.includes('limit reached') || error.message.includes('Already scanned')) {
        statusCode = 429; // Too Many Requests
      }

      res.status(statusCode).json({
        success: false,
        error: error.message || 'Scan failed',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get user's scan statistics
   */
  static async getScanStats(req, res) {
    try {
      const userId = req.user.id;
      
      const stats = await ScanService.getUserStats(userId);
      
      if (!stats) {
        return res.status(404).json({
          success: false,
          error: 'No active package found for user'
        });
      }

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scan statistics'
      });
    }
  }

  /**
   * Get user's scan history
   */
  static async getScanHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      
      const history = await ScanService.getUserScanHistory(userId, parseInt(page), parseInt(limit));
      
      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scan history'
      });
    }
  }

  /**
   * Admin: Regenerate QR code for any user
   */
  static async regenerateQRForUser(req, res) {
    try {
      const { userId } = req.params;
      const adminId = req.user.id;

      // Verify target user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify user has active payment
      const activePayment = await Payment.findOne({
        where: {
          user_id: userId,
          is_active: true,
          confirmed: true
        }
      });

      if (!activePayment) {
        return res.status(400).json({
          success: false,
          error: 'User has no active payment'
        });
      }

      // Generate new QR code
      const qrData = await QRService.generateQRData(userId);
      
      // Update user's QR code
      await User.update(
        {
          qr_code: qrData.qrImage,
          qr_expires_at: qrData.expiresAt
        },
        { where: { id: userId } }
      );

      // Log the action
      await AccessLog.create({
        user_id: userId,
        payment_id: activePayment.id,
        scanned_by: adminId,
        valid: false,
        note: `QR code regenerated by admin: ${req.user.full_name}`,
        day_of_week: new Date().getDay(),
        scan_date: new Date().toISOString().split('T')[0]
      });

      res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: {
          userId,
          qrExpiresAt: qrData.expiresAt,
          regeneratedBy: req.user.full_name,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Regenerate QR error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate QR code'
      });
    }
  }

  /**
   * Validate QR code without scanning (for testing)
   */
  static async validateQR(req, res) {
    try {
      const { qrData } = req.body;
      
      const validation = await QRService.validateQRData(qrData);
      
      // Get user stats
      const stats = await ScanService.getUserStats(validation.user.id);
      
      res.json({
        success: true,
        message: 'QR code is valid',
        data: {
          user: {
            id: validation.user.id,
            full_name: validation.user.full_name,
            email: validation.user.email,
            role: validation.user.role,
            is_active: validation.user.is_active
          },
          payment: {
            id: validation.payment.id,
            used_scans: validation.payment.used_scans,
            max_scans: validation.payment.package.max_scans,
            remaining_scans: validation.payment.package.max_scans - validation.payment.used_scans
          },
          stats: stats ? stats.stats : null,
          timestamp: validation.timestamp,
          expiresAt: new Date(validation.timestamp + (10 * 60 * 1000)) // 10 minutes from generation
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Invalid QR code'
      });
    }
  }
}

module.exports = QRController;