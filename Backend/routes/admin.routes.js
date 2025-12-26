const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware'); // check if user is admin

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;
