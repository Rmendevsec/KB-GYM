const Package = require("../models/package");

exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch packages" });
  }
};
