const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Package = sequelize.define('Package', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        name: 'packages_name',
        msg: 'Package name already exists'
      },
      validate: {
        len: [2, 50],
        notEmpty: true
      }
    },
    max_scans: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        isInt: true
      }
    },
    sunday_bonus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    description: {
      type: DataTypes.TEXT,
      validate: {
        len: [0, 500]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Optional calendar duration in days'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'packages',
    timestamps: true
  });

  return Package;
};