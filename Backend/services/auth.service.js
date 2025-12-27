const { User,  Package } = require("../models");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

const calculateSundays = (start, end) => {
  let count = 0;
  const d = new Date(start);
  while (d <= end) {
    if (d.getDay() === 0) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
};
function calculateAllowedScans(durationDays, startDate) {
  const months = Math.ceil(durationDays / 30);
  let sundays = 0;
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);

  const d = new Date(start);
  while (d <= end) {
    if (d.getDay() === 0) sundays++;
    d.setDate(d.getDate() + 1);
  }
  return 40 * months + sundays;
}

const calculateScans = (months, startDate) => {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  return 40 * months + calculateSundays(startDate, end);
};
const login = async (phone_number, password) => {
  const user = await User.scope("withPassword").findOne({ where: { phone_number } });
  if (!user) throw new Error("Invalid phone number or password");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid phone number or password");

  const token = generateToken({
    id: user.id,
    phone_number: user.phone_number,
    role_id: user.role_id,
  });

  return { user, token };
};
 

const register = async (userData) => {
  const { full_name, phone_number, password, role_id, package_id } = userData;

  if (!full_name || !phone_number || !password) {
    throw new Error("Full name, phone number, and password are required");
  }

  const existingUser = await User.findOne({ where: { phone_number } });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await hashPassword(password);

  let expire_at = null;
  let allowed_scans = null;

  if (package_id) {
    const selectedPackage = await Package.findByPk(package_id);
    if (!selectedPackage) throw new Error("Package not found");

    expire_at = new Date(Date.now() + selectedPackage.duration_days * 86400000);

    // If 1 month package → 13 scans, else unlimited
    allowed_scans = selectedPackage.duration_days === 30 ? 13 : null;
  }

  const newUser = await User.create({
    full_name,
    phone_number,
    password: hashedPassword,
    role_id: role_id || 3,
    registered_at: new Date(),
    expire_at,
    used_scans: 0,
    package_id: package_id || null,
    remaining_scans: allowed_scans, // store remaining scans
  });

  const token = generateToken({
    id: newUser.id,
    phone_number: newUser.phone_number,
    role_id: newUser.role_id,
  });

  return { user: newUser, token };
};






module.exports = { register, login };
