const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Package = sequelize.define("Package", {
  name: { type: DataTypes.STRING, allowNull: false },

  duration_days: { type: DataTypes.INTEGER, allowNull: false },

  max_scans: {
    type: DataTypes.INTEGER,
    allowNull: true, 
  },

  price: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Package;
