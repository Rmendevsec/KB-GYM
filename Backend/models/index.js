const sequelize = require('../config/db.config');

// Import models
const UserModel = require('./user');
const PackageModel = require('./package');
const PaymentModel = require('./payment');
const AccessLogModel = require('./accessLog');

// Initialize models
const User = UserModel(sequelize);
const Package = PackageModel(sequelize);
const Payment = PaymentModel(sequelize);
const AccessLog = AccessLogModel(sequelize);

// Define relationships with explicit foreign keys
User.hasMany(Payment, { 
  foreignKey: 'user_id', 
  as: 'payments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Payment.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Package.hasMany(Payment, { 
  foreignKey: 'package_id', 
  as: 'payments',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Payment.belongsTo(Package, { 
  foreignKey: 'package_id', 
  as: 'package',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

User.hasMany(AccessLog, { 
  foreignKey: 'user_id', 
  as: 'access_logs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
AccessLog.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Payment.hasMany(AccessLog, { 
  foreignKey: 'payment_id', 
  as: 'access_logs',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
AccessLog.belongsTo(Payment, { 
  foreignKey: 'payment_id', 
  as: 'payment',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasMany(AccessLog, { 
  foreignKey: 'scanned_by', 
  as: 'scanned_logs',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
AccessLog.belongsTo(User, { 
  foreignKey: 'scanned_by', 
  as: 'scanner',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Self-referential for created_by
User.belongsTo(User, { 
  foreignKey: 'created_by', 
  as: 'creator',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
User.hasMany(User, { 
  foreignKey: 'created_by', 
  as: 'created_users',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Export models and sequelize instance
const db = {
  sequelize,
  Sequelize: require('sequelize'),
  User,
  Package,
  Payment,
  AccessLog
};

// Helper function to get all models
db.getAllModels = () => {
  return {
    User,
    Package,
    Payment,
    AccessLog
  };
};

// Helper function to sync all models
db.syncAll = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('All models were synchronized successfully.');
    return true;
  } catch (error) {
    console.error('Error synchronizing models:', error);
    throw error;
  }
};

module.exports = db;