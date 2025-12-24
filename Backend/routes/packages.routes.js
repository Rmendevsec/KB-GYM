const express = require("express");
const router = express.Router();
const { Package } = require("../models");

// GET /api/packages
router.get("/", async (req, res) => {
  try {
    const packages = await Package.findAll();
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

module.exports = router;
