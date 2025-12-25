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

// Calculate allowed scans
const calculateScans = (months, startDate) => {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  return 40 * months + calculateSundays(startDate, end);
};
const login = async (email, password) => {
  const user = await User.scope("withPassword").findOne({ where: { email } });
  if (!user) throw new Error("Invalid email or password");

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid email or password");

  const token = generateToken({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  });

  return { user, token };
};

const register = async (userData) => {
  const { full_name, email, password, role_id, package_id } = userData;

  if (!full_name || !email || !password || !package_id) {
    throw new Error("All fields are required");
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const selectedPackage = await Package.findByPk(package_id);
  if (!selectedPackage) throw new Error("Package not found");

  const hashedPassword = await hashPassword(password);

  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    role_id: role_id || 3,
  });

  const weeks = Math.ceil(selectedPackage.duration_days / 7);
  const allowed_scans = selectedPackage.session_per_week * weeks;

  await Payment.create({
    user_id: user.id,
    package_id: selectedPackage.id,
    paid_at: new Date(),
    expire_at: new Date(Date.now() + selectedPackage.duration_days * 86400000),
    allowed_scans,
    is_confirmed: true,
  });

  const token = generateToken({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  });

  return { user, token };
};


module.exports = { register, login };
