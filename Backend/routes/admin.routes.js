const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/users", userController.getAllUsers);

router.get("/test-query", userController.testDirectQuery);

module.exports = router;