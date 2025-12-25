// models/package.js
module.exports = (sequelize, DataTypes) => {
  const Package = sequelize.define("Package", {
    name: { type: DataTypes.STRING, allowNull: false },
    duration_days: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false },
  });

  Package.associate = (models) => {
    Package.hasMany(models.Payment, { foreignKey: "package_id" });
  };

  return Package;
};
