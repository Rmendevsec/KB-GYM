const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");
const Package = require("./package"); // make sure this path is correct

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  full_name: { type: DataTypes.STRING, allowNull: false },
  phone_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  qrCode: { type: DataTypes.TEXT, allowNull: true },
  package_id: { type: DataTypes.INTEGER, allowNull: true },       // NEW
  registered_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // NEW
  expire_at: { type: DataTypes.DATE, allowNull: true },          // NEW
  used_scans: { type: DataTypes.INTEGER, defaultValue: 0 },      // NEW
  
}, {
  tableName: "users",
  timestamps: true,
  defaultScope: { attributes: { exclude: ["password"] } },
  scopes: { withPassword: { attributes: { include: ["password"] } } }
});



module.exports = User;
