const Package = require("./models/package");

const seedPackages = async () => {
  const count = await Package.count();
  if (count > 0) return;

  await Package.bulkCreate([
    {
      name: "1 Month",
      duration_days: 40,
      max_scans: 13,
      price: 2500
    },
    {
      name: "3 Months",
      duration_days: 120,
      max_scans: 9999,
      price: 2500
    },
    {
      name: "6 Months",
      duration_days: 240,
      max_scans: 9999,
      price: 2300
    },
    {
      name: "12 Months",
      duration_days: 480,
      max_scans: 9999,
      price: 2300
    }
  ]);

  console.log("Packages seeded");
};

module.exports = seedPackages;
