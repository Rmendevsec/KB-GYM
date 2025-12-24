const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const AccessLog = sequelize.define('AccessLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    payment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'payments',
        key: 'id'
      }
    },
    scanned_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    note: {
      type: DataTypes.STRING(500),
      validate: {
        len: [0, 500]
      }
    },
    scanned_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      defaultValue: () => new Date().getDay(),
      validate: {
        min: 0,
        max: 6
      }
    },
    scan_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    rejection_reason: {
      type: DataTypes.ENUM(
        'duplicate_scan',
        'max_scans_reached',
        'weekly_limit_reached',
        'sunday_not_allowed',
        'payment_expired',
        'user_inactive',
        'qr_expired',
        'invalid_signature'
      )
    }
  }, {
    tableName: 'access_logs',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'scan_date'],
        where: {
          valid: true
        },
        name: 'unique_daily_scan'
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['scanned_at']
      },
      {
        fields: ['valid']
      },
      {
        fields: ['scanned_by']
      },
      {
        fields: ['payment_id']
      }
    ],
    defaultScope: {
      order: [['scanned_at', 'DESC']]
    },
    scopes: {
      valid: {
        where: { valid: true }
      },
      invalid: {
        where: { valid: false }
      },
      today: {
        where: {
          scan_date: new Date().toISOString().split('T')[0]
        }
      },
      thisWeek: {
        where: {
          scanned_at: {
            [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
          }
        }
      },
      byUser: function(userId) {
        return {
          where: { user_id: userId }
        };
      }
    }
  });

  // Instance method to format scan data for response
  AccessLog.prototype.toResponseFormat = function() {
    const response = this.toJSON();
    response.day_name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][this.day_of_week];
    response.formatted_time = this.scanned_at.toLocaleTimeString();
    response.formatted_date = this.scanned_at.toLocaleDateString();
    return response;
  };

  // Hook to ensure day_of_week is set correctly
  AccessLog.beforeCreate((accessLog) => {
    if (!accessLog.day_of_week) {
      accessLog.day_of_week = new Date(accessLog.scanned_at || new Date()).getDay();
    }
    if (!accessLog.scan_date) {
      const date = new Date(accessLog.scanned_at || new Date());
      accessLog.scan_date = date.toISOString().split('T')[0];
    }
  });

  return AccessLog;
};