const { Package } = require("./models"); // Import your Sequelize Package model
const sequelize = require("./config/db.config"); // Import your DB connection

async function seedPackages() {
  try {
    await sequelize.sync(); // Ensure tables exist

    await Package.bulkCreate([
      { name: "1 Month", type: "scan", max_scans: 40, duration_days: 40 },
      { name: "3 Months", type: "scan", max_scans: 120, duration_days: 120 },
      { name: "6 Months", type: "scan", max_scans: 240, duration_days: 180 },
      { name: "1 Year", type: "scan", max_scans: 480, duration_days: 365 }
    ], { ignoreDuplicates: true }); // prevent duplicates if run again

    console.log("Packages seeded successfully");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed packages:", err);
    process.exit(1);
  }
}

seedPackages();
