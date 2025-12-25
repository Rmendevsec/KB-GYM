const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Package = sequelize.define("Package", {
  name: { type: DataTypes.STRING, allowNull: false },
  duration_days: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  session_per_week: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 }, // <- add this
});


module.exports = Package;
