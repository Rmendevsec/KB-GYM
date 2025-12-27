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


const getCurrentQR = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: { model: Package, as: "package" }, // include user's package safely
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Regenerate QR each request
    const qrCode = await generateQRCode(user);
    user.qrCode = qrCode;
    user.qrCodeIssuedAt = new Date();
    await user.save();

    res.json({
      qrCode,
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


const scanQR = async (req, res) => {
  const { qrData } = req.body;
  if (!qrData) return res.status(400).json({ message: "QR required" });

  let decoded;
  try {
    decoded = JSON.parse(qrData);
  } catch {
    return res.status(400).json({ message: "Invalid QR" });
  }

  try {
    const user = await User.findByPk(decoded.user_id, {
      include: { model: Package, as: "package" },
    });

    if (!user)
      return res.json({ valid: false, message: "User not found" });

    // QR expiration (10 min)
    const QR_TTL = 10 * 60 * 1000;
    if (Date.now() - decoded.issued_at > QR_TTL) {
      return res.json({
        valid: false,
        reason: "QR_EXPIRED",
        message: "QR expired",
      });
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

    // Scan limit (if package exists and has max_scans)
    if (user.package && user.package.max_scans !== null) {
      if ((user.used_scans || 0) >= user.package.max_scans) {
        return res.json({
          valid: false,
          reason: "SCAN_LIMIT_REACHED",
          message: "Scan limit reached",
        });
      }
      user.used_scans = (user.used_scans || 0) + 1;
      await user.save();
    }

    res.json({
      valid: true,
      message: "Access granted",
      user: {
        full_name: user.full_name,
        phone_number: user.phone_number,
        registered_at: user.registered_at, 
      },
      package: {
        name: user.package?.name || "N/A",
        remaining_scans:
          user.package?.max_scans === null
            ? "Unlimited"
            : Math.max((user.package?.max_scans || 0) - (user.used_scans || 0), 0),
        expire_at: user.expire_at || "N/A",
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to scan QR" });
  }
};

module.exports = { getCurrentQR, scanQR };
