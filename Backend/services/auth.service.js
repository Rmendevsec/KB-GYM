const {user, role, role} = require("../models")
const passwordUtil = require("../utils/password")
const jwtUtil = require("../utils/jwt")

exports.register = async (data) =>{
    const role = await role.findOne({where: {name: data.role || "user"}})
    const hashedPassword = await passwordUtil.hash(data.password)
    
    return user.create({
        email: data.email,
        password: hashedPassword,
        fullname: data.fullname,
        roleId : role.id
    })
}