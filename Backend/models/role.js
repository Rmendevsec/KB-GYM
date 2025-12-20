const {DataTypes} = require("sequelize")
const sequelize = require("../config/db.config")
const role = sequelize.define("Role", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
})

module.exports = role