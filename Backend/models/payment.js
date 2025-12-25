// models/payment.js
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define("Payment", {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    package_id: { type: DataTypes.INTEGER, allowNull: false },
    paid_at: { type: DataTypes.DATE, allowNull: false },
    expire_at: { type: DataTypes.DATE, allowNull: false },
    allowed_scans: { type: DataTypes.INTEGER, allowNull: false },
    is_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.User, { foreignKey: "user_id" });
    Payment.belongsTo(models.Package, { foreignKey: "package_id" });
  };

  return Payment;
};
