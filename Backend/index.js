require("dotenv").config();
const bcrypt = require("bcrypt");
const app = require("./app");
const { sequelize, Role, User } = require("./models");
const seedPackages = require("./seedPackage");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("Starting server initialization...");

    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    await sequelize.sync();
    console.log("Database synchronized.");

    const roles = ["admin", "cashier", "user"];
    for (const roleName of roles) {
      await Role.findOrCreate({ where: { name: roleName } });
    }
    console.log("Default roles created.");

    await seedPackages();

    const existingAdmin = await User.findOne({
      where: { phone_number: "0910000000" }
    });

    if (!existingAdmin) {
      const password = await bcrypt.hash("admin123", 10);
      await User.create({
        full_name: "Super Admin",
        phone_number: "0910000000",
        password,
        role_id: 1,
        is_active: true,
      });
      console.log("Admin user created: 0910000000 / admin123");
    } else {
      console.log("Admin user already exists");
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Available roles: ${roles.join(", ")}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
})();
