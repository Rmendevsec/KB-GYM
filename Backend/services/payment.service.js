const { Payment, Package, User, QRCodeModel } = require("../models");
const QRCode = require("qrcode");

const confirmPayment = async (userId, packageId) => {
  // Fetch user and package
  const user = await User.findByPk(userId);
  const gymPackage = await Package.findByPk(packageId);

  if (!user) throw new Error("User not found");
  if (!gymPackage) throw new Error("Package not found");

  // Set paid_at as now
  const paidAt = new Date();

  // Calculate expire_at
  const expireAt = new Date();
  expireAt.setDate(paidAt.getDate() + gymPackage.duration_days);

  // Create payment record
  const payment = await Payment.create({
    user_id: userId,
    package_id: packageId,
    paid_at: paidAt,
    expire_at: expireAt,
    confirmed: true
  });

  // Generate QR code
  const qrData = JSON.stringify({
    userId: user.id,
    paymentId: payment.id,
    paid_at: paidAt,
    expire_at: expireAt
  });
  const qrCodeBase64 = await QRCode.toDataURL(qrData);

  // Save QR code
  const qr = await QRCodeModel.create({
    user_id: user.id,
    payment_id: payment.id,
    qr_data: qrCodeBase64
  });

  return { payment, qr };
};

const checkQRCodeExpiry = async () => {
  const payments = await Payment.findAll({
    where: { confirmed: true },
    include: [User]
  });

  for (const payment of payments) {
    const user = payment.User;

    if (!user) continue;

    let expired = false;

    // Time-based
    if (payment.expire_at && new Date() > payment.expire_at) {
      expired = true;
    }

    // Scan-based
    if (payment.scans_left !== null && payment.scans_left <= 0) {
      expired = true;
    }

    if (expired) {
      user.is_active = false;
      user.qrCode = null; // invalidate QR
      await user.save();
    }
  }
};
module.exports = {
  confirmPayment,
  checkQRCodeExpiry
};
