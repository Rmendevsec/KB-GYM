const {user, role, role} = require("../models")
const passwordUtil = require("../utils/password")
const jwtUtil = require("../utils/jwt")

exports.register = async (data) =>{
    const role = await role.findOne({where: {name: data.role || "user"}})
    const hashedPassword = await passwordUtil.hash(data.password)
    
    return user.create({
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        roleId : role.id
    })
}

exports.login = async (email, password) =>{
    const user =await user.findOne({where: {email}, include: role})

    if(!user) throw new Error("Invalid credentials")
    
    const match = await passwordUtil.compare(password, user.password)
    if(!match) throw new Error("Invalid credentials")
    
    return jwtUtil.sign({id: user.id, role: user.role.name})
}
