const { Payment, AccessLog, Package, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

class ScanService {
  /**
   * Comprehensive scan validation with all package rules
   * Implements: max scans, 3 days/week, Sunday bonus, duplicate prevention
   */
  static async validateScan(userId, paymentId, scannerUserId = null) {
    const transaction = await sequelize.transaction();
    
    try {
      const today = moment().startOf('day');
      const dayOfWeek = moment().day(); // 0 = Sunday, 1 = Monday, etc.
      const todayStr = today.format('YYYY-MM-DD');

      // 1. Get user and check if active
      const user = await User.findByPk(userId, { transaction });
      if (!user || !user.is_active) {
        await transaction.rollback();
        throw new Error('User account is inactive or not found');
      }

      // 2. Get payment with package details
      const payment = await Payment.findOne({
        where: { 
          id: paymentId,
          user_id: userId,
          is_active: true,
          confirmed: true
        },
        include: [{
          model: Package,
          as: 'package',
          required: true
        }],
        transaction
      });

      if (!payment) {
        await transaction.rollback();
        throw new Error('No valid active payment found');
      }

      // 3. Check if payment is expired
      const isExpired = await payment.isExpired();
      if (isExpired.expired) {
        await transaction.rollback();
        throw new Error(`Payment expired: ${isExpired.reason}`);
      }

      // 4. Check duplicate scan for today
      const existingScan = await AccessLog.findOne({
        where: {
          user_id: userId,
          scan_date: todayStr,
          valid: true
        },
        transaction
      });

      if (existingScan) {
        await transaction.rollback();
        throw new Error('Already scanned today');
      }

      // 5. Check max scans
      if (payment.used_scans >= payment.package.max_scans) {
        await transaction.rollback();
        throw new Error('Maximum scans reached for this package');
      }

      // 6. Get week boundaries (ISO week: Monday to Sunday)
      const weekStart = moment().startOf('isoWeek'); // Monday
      const weekEnd = moment().endOf('isoWeek'); // Sunday

      // 7. Count valid scans this week
      const weeklyScans = await AccessLog.count({
        where: {
          user_id: userId,
          payment_id: paymentId,
          valid: true,
          scanned_at: {
            [Op.between]: [weekStart.toDate(), weekEnd.toDate()]
          }
        },
        transaction
      });

      // 8. Apply 3 days per week rule
      if (weeklyScans >= 3) {
        // Check if today is Sunday and package has Sunday bonus
        if (dayOfWeek === 0 && payment.package.sunday_bonus) {
          // Sunday bonus allowed - continue validation
          console.log(`Sunday bonus applied for user ${userId}`);
        } else {
          await transaction.rollback();
          throw new Error('Weekly scan limit reached (3 scans/week)');
        }
      }

      // 9. Additional check: If today is Sunday, ensure package has Sunday bonus
      if (dayOfWeek === 0 && !payment.package.sunday_bonus) {
        await transaction.rollback();
        throw new Error('Sunday access not allowed for this package');
      }

      await transaction.commit();

      return {
        isValid: true,
        user,
        payment,
        weeklyScans,
        dayOfWeek,
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
        remainingScans: payment.package.max_scans - payment.used_scans
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Process a successful scan
   * Creates access log and updates scan count
   */
  static async processScan(userId, paymentId, scannerUserId = null, note = '') {
    const transaction = await sequelize.transaction();
    
    try {
      // 1. Validate scan first
      const validation = await this.validateScan(userId, paymentId, scannerUserId);
      
      // 2. Create access log entry
      const accessLog = await AccessLog.create({
        user_id: userId,
        payment_id: paymentId,
        scanned_by: scannerUserId,
        valid: true,
        note: note || `Scanned on ${validation.dayName}`,
        day_of_week: validation.dayOfWeek,
        scan_date: moment().format('YYYY-MM-DD')
      }, { transaction });

      // 3. Increment used scans
      await Payment.increment('used_scans', {
        by: 1,
        where: { id: paymentId },
        transaction
      });

      // 4. Reload payment to get updated data
      const updatedPayment = await Payment.findByPk(paymentId, {
        include: [{
          model: Package,
          as: 'package',
          required: true
        }],
        transaction
      });

      // 5. Check if package is now exhausted
      let packageExhausted = false;
      if (updatedPayment.used_scans >= updatedPayment.package.max_scans) {
        await updatedPayment.update({ is_active: false }, { transaction });
        packageExhausted = true;
      }

      await transaction.commit();

      return {
        success: true,
        accessLog: {
          id: accessLog.id,
          scanned_at: accessLog.scanned_at,
          day_of_week: accessLog.day_of_week,
          day_name: validation.dayName
        },
        user: {
          id: validation.user.id,
          full_name: validation.user.full_name,
          email: validation.user.email
        },
        payment: {
          id: updatedPayment.id,
          used_scans: updatedPayment.used_scans,
          max_scans: updatedPayment.package.max_scans
        },
        remainingScans: updatedPayment.package.max_scans - updatedPayment.used_scans,
        packageExhausted,
        dayOfWeek: validation.dayOfWeek,
        weeklyScans: validation.weeklyScans + 1,
        weeklyLimit: 3,
        isSunday: validation.dayOfWeek === 0,
        usedSundayBonus: validation.dayOfWeek === 0 && validation.weeklyScans >= 3
      };
    } catch (error) {
      await transaction.rollback();
      
      // Create failed access log for tracking
      await this.createFailedScanLog(userId, paymentId, scannerUserId, error.message);
      
      throw error;
    }
  }

  /**
   * Create a log for failed scans for analytics
   */
  static async createFailedScanLog(userId, paymentId, scannerUserId, reason) {
    try {
      await AccessLog.create({
        user_id: userId,
        payment_id: paymentId,
        scanned_by: scannerUserId,
        valid: false,
        note: `Failed scan: ${reason}`,
        day_of_week: moment().day(),
        scan_date: moment().format('YYYY-MM-DD'),
        rejection_reason: this.getRejectionReasonCode(reason)
      });
    } catch (logError) {
      console.error('Failed to create scan failure log:', logError);
    }
  }

  /**
   * Map rejection reason to enum code
   */
  static getRejectionReasonCode(reason) {
    const reasonMap = {
      'Already scanned today': 'duplicate_scan',
      'Maximum scans reached': 'max_scans_reached',
      'Weekly scan limit reached': 'weekly_limit_reached',
      'Sunday access not allowed': 'sunday_not_allowed',
      'Payment expired': 'payment_expired',
      'User account is inactive': 'user_inactive',
      'QR code expired': 'qr_expired',
      'Invalid QR signature': 'invalid_signature'
    };
    
    return reasonMap[reason] || null;
  }

  /**
   * Get user's scan statistics
   */
  static async getUserStats(userId) {
    try {
      // Get active payment
      const activePayment = await Payment.findOne({
        where: {
          user_id: userId,
          is_active: true,
          confirmed: true
        },
        include: [{
          model: Package,
          as: 'package',
          required: true
        }]
      });

      if (!activePayment) {
        return null;
      }

      const now = moment();
      const weekStart = now.clone().startOf('isoWeek');
      const weekEnd = now.clone().endOf('isoWeek');
      const monthStart = now.clone().startOf('month');
      const monthEnd = now.clone().endOf('month');

      // Get scan counts
      const [weeklyScans, monthlyScans, totalScans] = await Promise.all([
        AccessLog.count({
          where: {
            user_id: userId,
            payment_id: activePayment.id,
            valid: true,
            scanned_at: {
              [Op.between]: [weekStart.toDate(), weekEnd.toDate()]
            }
          }
        }),
        AccessLog.count({
          where: {
            user_id: userId,
            payment_id: activePayment.id,
            valid: true,
            scanned_at: {
              [Op.between]: [monthStart.toDate(), monthEnd.toDate()]
            }
          }
        }),
        AccessLog.count({
          where: {
            user_id: userId,
            payment_id: activePayment.id,
            valid: true
          }
        })
      ]);

      // Check if today's scan was used
      const todayScan = await AccessLog.findOne({
        where: {
          user_id: userId,
          payment_id: activePayment.id,
          valid: true,
          scan_date: now.format('YYYY-MM-DD')
        }
      });

      // Calculate remaining weekly scans
      const remainingWeeklyScans = Math.max(0, 3 - weeklyScans);

      // Check if today is Sunday and if bonus applies
      const today = now.day();
      const isSunday = today === 0;
      const canScanToday = !todayScan;
      const canScanSunday = isSunday && activePayment.package.sunday_bonus;

      return {
        package: {
          id: activePayment.package.id,
          name: activePayment.package.name,
          max_scans: activePayment.package.max_scans,
          sunday_bonus: activePayment.package.sunday_bonus,
          description: activePayment.package.description
        },
        payment: {
          id: activePayment.id,
          used_scans: activePayment.used_scans,
          start_date: activePayment.start_date,
          is_active: activePayment.is_active
        },
        stats: {
          totalScans: totalScans,
          remainingScans: activePayment.package.max_scans - activePayment.used_scans,
          weeklyScans,
          monthlyScans,
          remainingWeeklyScans,
          weeklyLimit: 3,
          todayScanned: !!todayScan,
          canScanToday,
          isSunday,
          canScanSunday,
          dayOfWeek: today,
          dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today]
        },
        usagePercentage: {
          total: Math.round((activePayment.used_scans / activePayment.package.max_scans) * 100),
          weekly: Math.round((weeklyScans / 3) * 100),
          monthly: monthlyScans > 0 ? Math.round((monthlyScans / (activePayment.package.max_scans / 12)) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Get scan history for a user
   */
  static async getUserScanHistory(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await AccessLog.findAndCountAll({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'scanner',
        attributes: ['id', 'full_name', 'email']
      }],
      order: [['scanned_at', 'DESC']],
      limit,
      offset
    });

    return {
      scans: rows.map(scan => scan.toResponseFormat()),
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get daily scan analytics
   */
  static async getDailyAnalytics(date = null) {
    const targetDate = date ? moment(date) : moment();
    const dateStr = targetDate.format('YYYY-MM-DD');
    
    const [scans, validScans, invalidScans] = await Promise.all([
      AccessLog.findAll({
        where: {
          scan_date: dateStr
        },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email', 'role']
        }]
      }),
      AccessLog.count({
        where: {
          scan_date: dateStr,
          valid: true
        }
      }),
      AccessLog.count({
        where: {
          scan_date: dateStr,
          valid: false
        }
      })
    ]);

    // Group by hour for chart data
    const hourlyData = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyData[hour] = 0;
    }

    scans.forEach(scan => {
      if (scan.valid) {
        const hour = moment(scan.scanned_at).hour();
        hourlyData[hour]++;
      }
    });

    return {
      date: dateStr,
      dayOfWeek: targetDate.day(),
      dayName: targetDate.format('dddd'),
      totalScans: scans.length,
      validScans,
      invalidScans,
      successRate: scans.length > 0 ? Math.round((validScans / scans.length) * 100) : 0,
      hourlyData: Object.entries(hourlyData).map(([hour, count]) => ({
        hour: parseInt(hour),
        count
      })),
      scans: scans.map(scan => ({
        id: scan.id,
        user: scan.user,
        scanned_at: scan.scanned_at,
        valid: scan.valid,
        note: scan.note
      }))
    };
  }
}

module.exports = ScanService;