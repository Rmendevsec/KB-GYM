require("dotenv").config();
const { sequelize, User } = require("./models");
const { hashPassword } = require("./utils/password");

(async () => {
  try {
    await sequelize.authenticate();

    const email = "cashier@kbgym.com";

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.log("❌ Admin already exists");
      process.exit(0);
    }

    const password = await hashPassword("Admin@123");

    await User.create({
      full_name: "System Admin",
      email,
      password,
      role_id: 2, // ADMIN
      is_active: true,
    });

    console.log("✅ Admin created successfully");
    console.log("Email:", email);
    console.log("Password: Admin@123");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
    process.exit(2);
  }
})();
