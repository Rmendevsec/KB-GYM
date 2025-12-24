const { DataTypes, Op } = require('sequelize');
const moment = require('moment');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
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
    package_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'packages',
        key: 'id'
      }
    },
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    confirmed_by: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    transaction_id: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    payment_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    start_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true
      }
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isDate: true
      }
    },
    used_scans: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 1000]
      }
    }
  }, {
    tableName: 'payments',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['user_id', 'is_active'],
        where: { is_active: true }
      },
      {
        fields: ['package_id']
      },
      {
        fields: ['confirmed']
      }
    ],
    defaultScope: {
      where: { is_active: true }
    },
    scopes: {
      active: {
        where: { 
          is_active: true,
          confirmed: true
        }
      },
      expired: {
        where: {
          [Op.or]: [
            sequelize.where(
              sequelize.col('used_scans'),
              '>=',
              sequelize.col('package.max_scans')
            ),
            { end_date: { [Op.lt]: new Date() } }
          ]
        }
      }
    }
  });

  // Instance method to check if payment is expired
  Payment.prototype.isExpired = async function() {
    // Reload with package included
    await this.reload({
      include: [{
        association: 'package',
        required: true
      }]
    });
    
    // Check if max scans reached
    if (this.used_scans >= this.package.max_scans) {
      return { expired: true, reason: 'Max scans reached' };
    }
    
    // Check if calendar duration expired (if end_date is set)
    if (this.end_date && new Date() > this.end_date) {
      return { expired: true, reason: 'Calendar duration expired' };
    }
    
    return { expired: false };
  };

  // Instance method to get remaining scans
  Payment.prototype.getRemainingScans = async function() {
    // Reload with package included
    await this.reload({
      include: [{
        association: 'package',
        required: true
      }]
    });
    
    return this.package.max_scans - this.used_scans;
  };

  // Instance method to increment used scans
  Payment.prototype.incrementUsedScans = async function() {
    this.used_scans += 1;
    
    // Reload with package to check max scans
    await this.reload({
      include: [{
        association: 'package',
        required: true
      }]
    });
    
    // Check if package is now exhausted
    if (this.used_scans >= this.package.max_scans) {
      this.is_active = false;
    }
    
    await this.save();
    return this;
  };

  return Payment;
};