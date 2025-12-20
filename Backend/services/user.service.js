const user = require("../models")

exports.getMe = async (id)=>{
    user.findByPk(id, {include: role})
}