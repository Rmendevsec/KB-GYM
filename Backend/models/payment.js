const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Payment = sequelize.define("Payment", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  expire_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  allowed_scans: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_confirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: "payments",
  timestamps: true
});

module.exports = Payment;
