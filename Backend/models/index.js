const sequelize = require("../config/db.config")
const user = require("./user")
const role = require("./role")

role.hasMany(user)
user.belongsTo(role)
module.exports = {
    sequelize, 
    user,
    role
}