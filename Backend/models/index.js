const sequelize = require("../config/db.config");

const User = require("./user");
const Role = require("./role");
const Scan = require("./scan");
const Package = require("./package");

// Roles
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

// Scans
User.hasMany(Scan, { foreignKey: "user_id" });
Scan.belongsTo(User, { foreignKey: "user_id" });

// Package (directly, no Payment)
User.belongsTo(Package, {
  foreignKey: 'package_id',
  as: 'package' // lowercase alias
});
Package.hasMany(User, {
  foreignKey: 'package_id',
  as: 'users'
});


module.exports = {
  sequelize,
  User,
  Role,
  Scan,
  Package
};
