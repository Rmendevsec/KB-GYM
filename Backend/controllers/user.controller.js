const { User, Payment, Package, AccessLog } = require('../models');
const QRService = require('../services/qr.service');
const ScanService = require('../services/scan.service');
const bcrypt = require('bcryptjs');

class UserController {
  /**
   * Get current user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'qr_code'] },
        include: [{
          model: Payment,
          as: 'payments',
          include: [{
            model: Package,
            as: 'package'
          }],
          limit: 5,
          order: [['created_at', 'DESC']]
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get active payment stats
      const activePayment = await Payment.findOne({
        where: {
          user_id: userId,
          is_active: true,
          confirmed: true
        },
        include: [{
          model: Package,
          as: 'package'
        }]
      });

      const userResponse = user.toJSON();
      userResponse.active_payment = activePayment || null;

      res.json({
        success: true,
        data: userResponse
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { full_name, email } = req.body;

      // Check if email is being changed and if it already exists
      if (email) {
        const existingUser = await User.findOne({
          where: { email, id: { $ne: userId } }
        });

        if (existingUser) {
          return res.status(400).json({
            success: false,
            error: 'Email already in use'
          });
        }
      }

      const updates = {};
      if (full_name) updates.full_name = full_name;
      if (email) updates.email = email;

      await User.update(updates, {
        where: { id: userId }
      });

      // Get updated user
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'qr_code'] }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { current_password, new_password, confirm_password } = req.body;

      // Validate inputs
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          error: 'All password fields are required'
        });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          error: 'New passwords do not match'
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'New password must be at least 8 characters'
        });
      }

      // Get user with password
      const user = await User.scope('withPassword').findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }

      // Update password
      user.password = new_password;
      await user.save();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to change password'
      });
    }
  }

  /**
   * Get user's active package info
   */
  static async getActivePackage(req, res) {
    try {
      const userId = req.user.id;

      const activePayment = await Payment.findOne({
        where: {
          user_id: userId,
          is_active: true,
          confirmed: true
        },
        include: [{
          model: Package,
          as: 'package'
        }]
      });

      if (!activePayment) {
        return res.status(404).json({
          success: false,
          error: 'No active package found'
        });
      }

      // Get scan statistics
      const stats = await ScanService.getUserStats(userId);

      res.json({
        success: true,
        data: {
          payment: activePayment,
          stats: stats ? stats.stats : null,
          usage_percentage: stats ? stats.usagePercentage : null
        }
      });
    } catch (error) {
      console.error('Get active package error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get active package'
      });
    }
  }

  /**
   * Get user's payment history
   */
  static async getPaymentHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const { count, rows: payments } = await Payment.findAndCountAll({
        where: { user_id: userId },
        include: [{
          model: Package,
          as: 'package'
        }],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get payment history error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get payment history'
      });
    }
  }

  /**
   * Request QR code regeneration
   */
  static async requestQRRegeneration(req, res) {
    try {
      const userId = req.user.id;

      // Generate new QR code
      const qrData = await QRService.generateQRData(userId);

      res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: {
          qrImage: qrData.qrImage,
          expiresAt: qrData.expiresAt
        }
      });
    } catch (error) {
      console.error('QR regeneration error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to regenerate QR code'
      });
    }
  }

  /**
   * Get user's scan analytics
   */
  static async getUserAnalytics(req, res) {
    try {
      const userId = req.user.id;
      const { period = 'week' } = req.query; // week, month, year

      let startDate, endDate;
      const now = new Date();

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }

      // Get scans for the period
      const scans = await AccessLog.findAll({
        where: {
          user_id: userId,
          valid: true,
          scanned_at: {
            $gte: startDate,
            $lte: new Date()
          }
        },
        order: [['scanned_at', 'ASC']]
      });

      // Process data for chart
      const scanData = scans.reduce((acc, scan) => {
        const date = new Date(scan.scanned_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      // Get day of week distribution
      const dayDistribution = scans.reduce((acc, scan) => {
        const day = new Date(scan.scanned_at).getDay();
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, Array(7).fill(0));

      // Get hourly distribution
      const hourDistribution = scans.reduce((acc, scan) => {
        const hour = new Date(scan.scanned_at).getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, Array(24).fill(0));

      res.json({
        success: true,
        data: {
          period,
          total_scans: scans.length,
          scan_data: Object.entries(scanData).map(([date, count]) => ({
            date,
            count
          })),
          day_distribution: dayDistribution.map((count, day) => ({
            day,
            day_name: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            count
          })),
          hour_distribution: hourDistribution.map((count, hour) => ({
            hour,
            count
          })),
          average_daily_scans: Object.values(scanData).reduce((a, b) => a + b, 0) / Object.keys(scanData).length || 0
        }
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user analytics'
      });
    }
  }
}

module.exports = UserController;