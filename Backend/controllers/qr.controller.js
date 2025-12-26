const QRCode = require("qrcode");
const { User, Package } = require("../models");

// Generate QR code
const generateQRCode = async (user) => {
  const qrData = JSON.stringify({
    user_id: user.id,
    email: user.email,
    issued_at: Date.now(),
  });
  return QRCode.toDataURL(qrData);
};

// GET /api/qr/current
// GET /api/qr/current
const getCurrentQR = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: { model: Package, as: 'package' },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const QR_TTL = 10 * 60 * 1000; // 10 minutes

    // Only regenerate QR if it doesn't exist or expired
    if (!user.qrCode || !user.qrCodeIssuedAt || Date.now() - new Date(user.qrCodeIssuedAt) > QR_TTL) {
      const qrCode = await generateQRCode(user);
      user.qrCode = qrCode;
      user.qrCodeIssuedAt = new Date();
      await user.save();
    }

    res.json({
      qrCode: user.qrCode,
      package: user.package
        ? {
            name: user.package.name,
            expire_at: user.expire_at,
            max_scans: user.package.max_scans,
          }
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate QR" });
  }
};


// Scan QR
const scanQR = async (req, res) => {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ message: "QR required" });

  let decoded;
  try {
    decoded = JSON.parse(qrData);
  } catch {
    return res.status(400).json({ message: "Invalid QR" });
  }

  const user = await User.findByPk(decoded.user_id, {
    include: { model: Package, as: 'package' },
  });
  if (!user) return res.json({ valid: false, message: "User not found" });

  // QR expiration (10 min)
  const QR_TTL = 10 * 60 * 1000;
  if (Date.now() - decoded.issued_at > QR_TTL) {
    return res.json({ valid: false, reason: "QR_EXPIRED", message: "QR expired" });
  }

  // Membership expiry
  if (user.expire_at && new Date() > new Date(user.expire_at)) {
    return res.json({
      valid: false,
      reason: "MEMBERSHIP_EXPIRED",
      message: "Package expired",
      expired_at: user.expire_at,
    });
  }

// Scan limit
if (user.package && user.package.max_scans !== null) {
  if (user.used_scans >= user.package.max_scans) {
    return res.json({
      valid: false,
      reason: "SCAN_LIMIT_REACHED",
      message: "Scan limit reached",
    });
  }
  user.used_scans += 1;
  await user.save();
}


  res.json({
    valid: true,
    message: "Access granted",
    user: { full_name: user.full_name, phone_number: user.phone_number },
    package: {
      name: user.package?.name || "N/A",
      remaining_scans:
        user.package?.max_scans === null
          ? "Unlimited"
          : user.package.max_scans - user.used_scans,
      expire_at: user.expire_at,
    },
  });
};

module.exports = { getCurrentQR, scanQR };
