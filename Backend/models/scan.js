const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Scan = sequelize.define("Scan", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  scanned_at: { type: DataTypes.DATE, allowNull: false }
}, {
  tableName: "scans",
  timestamps: true
});

module.exports = Scan;
