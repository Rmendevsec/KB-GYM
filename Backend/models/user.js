const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "users",
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ["password"] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ["password"] }
    }
  }
});

module.exports = User;