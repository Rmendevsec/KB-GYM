const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const QRCodeModel = sequelize.define("QRCode", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  payment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  qr_data: {
    type: DataTypes.TEXT, // store QR code base64
    allowNull: true
  }
}, {
  tableName: 'qrcodes',
  timestamps: true
});

module.exports = QRCodeModel;
