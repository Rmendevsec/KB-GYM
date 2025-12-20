const sequelize = require("../config/db.config");
const User = require("./user");
const Role = require("./role");

// Define associations
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

module.exports = {
  sequelize,
  User,
  Role
};