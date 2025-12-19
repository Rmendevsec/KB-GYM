const { Sequelize } = require("sequelize");

let sequelize = new Sequelize(
    {
        dialect: 'sqlite',
        storage: 'db.sqlite'
    }
)

module.exports = sequelize