const { User, Role, Package } = require("../models");

const getAllUsers = async () => {
  const users = await User.findAll({
    include: [
      { 
        model: Role, 
        attributes: ["name"] 
      },
      {
        model: Package,
        as: "package",
        attributes: ["name", "max_scans", "duration_days"] 
      }
    ],
    order: [["created_at", "DESC"]],
  });

  console.log('DEBUG: First user package data:', {
    name: users[0]?.package?.name,
    max_scans: users[0]?.package?.max_scans,
    hasMaxScans: users[0]?.package?.hasOwnProperty('max_scans')
  });

  return users.map(u => {
    let remainingScans = "Unlimited";

    if (u.package && u.package.max_scans !== null && u.package.max_scans !== undefined) {
      const max = Number(u.package.max_scans);
      const used = Number(u.used_scans || 0);
      
      console.log(`User ${u.id}: max_scans=${max}, used=${used}`);
      
      if (max === 0) {
        remainingScans = 0;
      } else if (max > 0) {
        remainingScans = Math.max(max - used, 0);
      }
    } else {
      console.log(`User ${u.id}: No max_scans found on package`);
    }

    return {
      id: u.id,
      name: u.full_name,
      phone: u.phone_number,
      role: u.Role?.name || "N/A",
      active: u.is_active ? "Yes" : "No",
      package: u.package?.name || "N/A",
      createdAt: u.registered_at,
      expireAt: u.expire_at,
      remainingScans,
    };
  });
};

module.exports = { getAllUsers };
