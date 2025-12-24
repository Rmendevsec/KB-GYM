const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate, schemas } = require('../middlewares/validation');

// All admin routes require admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', AdminController.getAllUsers);
router.get('/access-logs', AdminController.getAccessLogs);
router.get('/dashboard-stats', AdminController.getDashboardStats);
router.post('/packages', 
  validate(schemas.createPackage),
  AdminController.createPackage
);
router.post('/qr/regenerate/:userId', AdminController.regenerateQR);

module.exports = router;