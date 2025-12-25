const { User, Payment, Package } = require("../models");
const { hashPassword } = require("../utils/password");
const { generateToken } = require("../utils/jwt");

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

const register = async (userData) => {
  if (!userData.full_name || !userData.email || !userData.password) {
    throw new Error("full_name, email, and password are required");
  }
// Convert months to duration_days (assuming 30 days per month)
const durationDays = months * 30;

// Fetch package by duration_days
const selectedPackage = await Package.findOne({ where: { duration_days: durationDays } });
if (!selectedPackage) throw new Error("Package not found");

  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) throw new Error("User with this email already exists");

  const hashedPassword = await hashPassword(userData.password);

  const user = await User.create({
    full_name: userData.full_name,
    email: userData.email,
    password: hashedPassword,
    role_id: userData.role_id || 3,
  });

  if (userData.packageMonths) {
    const months = Number(userData.packageMonths);
    const now = new Date();
    const expireDate = new Date();
    expireDate.setMonth(expireDate.getMonth() + months);

    const allowedScans = calculateScans(months, now);

    // ✅ Fetch package from Package table
    const selectedPackage = await Package.findOne({ where: { months } });
    if (!selectedPackage) throw new Error("Package not found");
await Payment.create({
  user_id: user.id,
  package_id: selectedPackage.id,
  paid_at: new Date(),
  expire_at: new Date(Date.now() + selectedPackage.duration_days * 24*60*60*1000),
  allowed_scans: calculateScans(months, new Date()),
  is_confirmed: true,
});

  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role_id: user.role_id,
  });

  return {
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      is_active: user.is_active,
    },
    token,
  };
};

module.exports = { register };
