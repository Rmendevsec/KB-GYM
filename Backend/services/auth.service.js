const { User, Payment, Package } = require("../models");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");

// Calculate Sundays between two dates
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

// Calculate allowed scans
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

  if (!full_name || !phone_number || !password || !package_id) {
    throw new Error("All fields are required");
  }

  // check if user exists
  const existingUser = await User.findOne({ where: { phone_number } });
  if (existingUser) throw new Error("User already exists");

  // get selected package
  const selectedPackage = await Package.findByPk(package_id);
  if (!selectedPackage) throw new Error("Package not found");

  // hash password
  const hashedPassword = await hashPassword(password);

  // create user
  const newUser = await User.create({
    full_name,
    phone_number,
    password: hashedPassword,
    role_id: role_id || 3,
  });

let allowed_scans;

// 1-month package → limited scans
if (selectedPackage.duration_days === 30) {
  allowed_scans = 13; // 13 scans in 40 days
} else {
  allowed_scans = -1; // unlimited scans for 3/6/12 months
}


  await Payment.create({
    user_id: newUser.id,
    package_id: selectedPackage.id,
    paid_at: new Date(),
    expire_at: new Date(Date.now() + selectedPackage.duration_days * 86400000),
    allowed_scans,
    is_confirmed: true,
  });

  // generate token
  const token = generateToken({
    id: newUser.id,
    phone_number: newUser.phone_number,
    role_id: newUser.role_id,
  });

  return { user: newUser, token };
};



module.exports = { register, login };
