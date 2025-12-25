const sequelize = require("../config/db.config");

const User = require("./user");
const Role = require("./role");
const Scan = require("./scan");
const Payment = require("./payment");
const Package = require("./package");

/* =======================
   ROLE ↔ USER
======================= */
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

/* =======================
   USER ↔ SCAN
======================= */
User.hasMany(Scan, { foreignKey: "user_id" });
Scan.belongsTo(User, { foreignKey: "user_id" });

/* =======================
   USER ↔ PAYMENT
======================= */
User.hasMany(Payment, { foreignKey: "user_id" });
Payment.belongsTo(User, { foreignKey: "user_id" });

/* =======================
   PACKAGE ↔ PAYMENT
======================= */
Package.hasMany(Payment, { foreignKey: "package_id" });
Payment.belongsTo(Package, { foreignKey: "package_id" });

module.exports = {
  sequelize,
  User,
  Role,
  Scan,
  Payment,
  Package
};
