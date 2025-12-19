const database = require("../config/db.config")

const {DataTypes}  = require("sequelize")

const user = database.define("user",
{
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    createdAt: DataTypes.DATE, 
    updatedAt: DataTypes.DATE

}
)

module.exports = user