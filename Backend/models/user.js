const database = require("../config/db.config");

const { DataTypes } = require("sequelize");

const user = database.define("user", {
  fullName: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  role: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = user;
