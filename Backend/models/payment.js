const {DataTypes} = require("sequelize")
const sequelize = require("../config/db.config")
const User = require("./user")
const Package = require("./package")


const Payment = new sequelize.define("Payment",{
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    user_id: {type: DataTypes.STRING, allowNull: false, references:{model: "users", key: 'id'}},
    package_id : {type: DataTypes.INTEGER, allowNull: false, references: {model: 'packages', key: 'id'}},
    paid_at: {type: DataTypes.DATE, allowNull: false},
    expire_at: {type: DataTypes.DATE, allowNull: false},
    is_confirmed: {type: DataTypes.BOOLEAN, defaultValue: false}
},{
    tableName: 'payments',
    timestamps: true
}

)

User.hasMany(Payment, {foreignKey: 'user_id'})
Payment.belongsTo(User, {foreignKey: 'user_id'})

Package.hasMany(Payment, {foreignKey: 'package_id'})
Payment.belongsTo(Package, {foreignKey: 'package_id'})

module.exports = Payment