const paymentService = require("../services/payment.service");

const confirmPayment = async (req, res, next) => {
  try {
    const { userId, packageId } = req.body;

    if (!userId || !packageId) {
      return res.status(400).json({ message: "userId and packageId are required" });
    }

    const result = await paymentService.confirmPayment(userId, packageId);

    res.json({
      success: true,
      message: "Payment confirmed and QR code generated",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  confirmPayment
};
