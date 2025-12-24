const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validateQuery } = require('../middlewares/validation');

// All user routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/profile',
  authorize('user', 'admin', 'cashier'),
  UserController.getProfile
);

// Update user profile
router.put('/profile',
  authorize('user'),
  UserController.updateProfile
);

// Change password
router.post('/change-password',
  authorize('user', 'admin', 'cashier'),
  UserController.changePassword
);

// Get user's active package info
router.get('/package',
  authorize('user'),
  UserController.getActivePackage
);

// Get user's payment history
router.get('/payments',
  authorize('user'),
  UserController.getPaymentHistory
);

// Request QR code regeneration
router.post('/request-qr-regeneration',
  authorize('user'),
  UserController.requestQRRegeneration
);

// Get user's scan analytics
router.get('/analytics',
  authorize('user'),
  UserController.getUserAnalytics
);

module.exports = router;