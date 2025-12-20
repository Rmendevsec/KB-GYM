const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');

const authMiddleware = require('../middlewares/auth.middleware');

router.get('/current', authMiddleware, qrController.getCurrentQR);
router.post('/regenerate', authMiddleware, qrController.regenerateQR);

console.log(authMiddleware.verifyToken);
console.log(qrController.getCurrentQR); 

// Public endpoint for scanning QR
router.post('/scan', qrController.scanQR);

module.exports = router;
