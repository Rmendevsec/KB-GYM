const QRCode = require("qrcode");
const { User, Payment, Package } = require("../models");

// Generate QR code helper
const generateQRCode = async (user) => {
  const qrData = JSON.stringify({
    id: user.id,
    email: user.email,
    timestamp: Date.now(),
  });
  return await QRCode.toDataURL(qrData);
};

// GET /api/qr/current
const getCurrentQR = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.qrCode) {
      user.qrCode = await generateQRCode(user);
      await user.save();
    }

    res.json({ qrCode: user.qrCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get QR code" });
  }
};

const scanQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    if (!qrData) return res.status(400).json({ error: "qrData is required" });

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch (err) {
      return res.status(400).json({ error: "QR code is not valid JSON" });
    }

    const user = await User.findByPk(parsed.id);
    if (!user) return res.status(404).json({ valid: false, error: "User not found" });

    res.json({ valid: true, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, error: "Internal server error" });
  }
};


module.exports = {
  getCurrentQR,
  scanQR,
};
