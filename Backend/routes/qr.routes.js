const express = require('express');
const router = express.Router();
const QRController = require('../controllers/qr.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate, schemas } = require('../middlewares/validation');

// All QR routes require authentication
router.use(authenticate);

// User: Get current QR code
router.get('/current',
  authorize('user'),
  QRController.getCurrentQR
);

// User: Get scan statistics
router.get('/stats',
  authorize('user'),
  QRController.getScanStats
);

// User: Get scan history
router.get('/history',
  authorize('user'),
  QRController.getScanHistory
);

// Cashier/Admin: Scan QR code
router.post('/scan',
  authorize('cashier', 'admin'),
  validate(schemas.scanQR),
  QRController.scanQR
);

// Admin: Regenerate QR for any user
router.post('/regenerate/:userId',
  authorize('admin'),
  QRController.regenerateQRForUser
);

// Admin/Cashier: Validate QR without scanning
router.post('/validate',
  authorize('cashier', 'admin'),
  validate(schemas.scanQR),
  QRController.validateQR
);

module.exports = router;