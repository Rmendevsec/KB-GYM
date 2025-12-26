const express = require("express");
const router = express.Router();
const { getAllPackages } = require("../controllers/package.controller");

router.get("/", getAllPackages);

module.exports = router;
