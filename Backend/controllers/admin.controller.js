const { User, AccessLog, Payment, Package, sequelize } = require('../models');
const QRService = require('../services/qr.service');

class AdminController {
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;

      const { count, rows: users } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        include: [{
          model: Payment,
          as: 'payments',
          include: ['package']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getAccessLogs(req, res) {
    try {
      const { 
        page = 1, 
        limit = 50, 
        userId,
        startDate,
        endDate 
      } = req.query;
      
      const offset = (page - 1) * limit;
      const where = {};

      if (userId) where.user_id = userId;
      
      if (startDate || endDate) {
        where.scanned_at = {};
        if (startDate) where.scanned_at[Op.gte] = new Date(startDate);
        if (endDate) where.scanned_at[Op.lte] = new Date(endDate);
      }

      const { count, rows: logs } = await AccessLog.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'full_name', 'email'] },
          { model: User, as: 'scanner', attributes: ['id', 'full_name'] },
          { model: Payment, as: 'payment', include: ['package'] }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['scanned_at', 'DESC']]
      });

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  static async regenerateQR(req, res) {
    try {
      const { userId } = req.params;
      
      // Verify user exists and is active
      const user = await User.findByPk(userId);
      if (!user || !user.is_active) {
        return res.status(404).json({
          success: false,
          error: 'User not found or inactive'
        });
      }

      // Generate new QR
      const qrData = await QRService.generateQRData(userId);

      res.json({
        success: true,
        message: 'QR code regenerated successfully',
        data: qrData
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async createPackage(req, res) {
    try {
      const packageData = req.body;
      const newPackage = await Package.create(packageData);

      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        data: newPackage
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [
        totalUsers,
        activeUsers,
        todayScans,
        weekScans,
        monthScans,
        activePackages
      ] = await Promise.all([
        User.count(),
        User.count({ where: { is_active: true } }),
        AccessLog.count({ 
          where: { 
            scan_date: new Date().toISOString().split('T')[0],
            valid: true 
          } 
        }),
        AccessLog.count({ 
          where: { 
            scanned_at: { [Op.gte]: weekStart },
            valid: true 
          } 
        }),
        AccessLog.count({ 
          where: { 
            scanned_at: { [Op.gte]: monthStart },
            valid: true 
          } 
        }),
        Payment.count({ where: { is_active: true } })
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          todayScans,
          weekScans,
          monthScans,
          activePackages
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = AdminController;