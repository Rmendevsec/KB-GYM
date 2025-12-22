const {DataTypes} = require("sequelize")
const sequelize = require("../config/db.config")

const Package = new sequelize.define("Package", {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    duration_days: {type: DataTypes.INTEGER, allowNull: false},
    session_per_week: {type: DataTypes.INTEGER, allowNull: false}

},{
    tableName: "packages",
    timestamps: true
})

module.exports = Package