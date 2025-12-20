require("dotenv").config()

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRETE: process.env.JWT_SECRETE
}