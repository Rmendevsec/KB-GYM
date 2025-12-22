require("dotenv").config();

const app = require("./app");
const { sequelize, Role } = require("./models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("Starting server initialization...");
    
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    
    // Sync database (alter for dev, use migrations for prod)
    await sequelize.sync();
    console.log("Database synchronized.");
    
    // Create default roles
    const roles = ["admin", "cashier", "user"];
    for (const roleName of roles) {
      await Role.findOrCreate({
        where: { name: roleName }
      });
    }
    console.log("Default roles created.");
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📊 Available roles: ${roles.join(", ")}`);
    });
    
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();