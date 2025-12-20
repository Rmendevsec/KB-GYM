const jwt = require("jsonwebtoken")
const {JWT_SECRETE} =require("../")

exports.sign = (payload) => {
    jwt.sign(payload, JWT_SECRETE, {expiresIn: "24h"})
}
exports.verify = (token) => jwt.verify(token, JWT_SECRETE)