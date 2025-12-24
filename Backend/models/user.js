const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'users_email',
        msg: 'Email already exists'
      },
      validate: {
        isEmail: true,
        notEmpty: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [8, 100],
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'cashier', 'user'),
      defaultValue: 'user',
      allowNull: false,
      validate: {
        isIn: [['admin', 'cashier', 'user']]
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    qr_code: {
      type: DataTypes.TEXT
    },
    qr_expires_at: {
      type: DataTypes.DATE
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockout_until: {
      type: DataTypes.DATE
    },
    created_by: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    last_login: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true, // Soft deletes
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'qr_code'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      },
      withQRCode: {
        attributes: { include: ['qr_code', 'qr_expires_at'] }
      },
      active: {
        where: { is_active: true }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.incrementLoginAttempts = async function() {
    this.login_attempts += 1;
    if (this.login_attempts >= process.env.MAX_LOGIN_ATTEMPTS || 5) {
      const lockoutMinutes = process.env.LOCKOUT_TIME_MINUTES || 15;
      this.lockout_until = new Date(Date.now() + lockoutMinutes * 60 * 1000);
    }
    await this.save();
    return this;
  };

  User.prototype.resetLoginAttempts = async function() {
    this.login_attempts = 0;
    this.lockout_until = null;
    await this.save();
    return this;
  };

  User.prototype.isLocked = function() {
    return this.lockout_until && new Date() < this.lockout_until;
  };

  User.prototype.updateLastLogin = async function() {
    this.last_login = new Date();
    await this.save();
    return this;
  };

  User.prototype.regenerateQRCode = async function() {
    const QRService = require('../services/qrService');
    return await QRService.generateQRData(this.id);
  };

  return User;
};