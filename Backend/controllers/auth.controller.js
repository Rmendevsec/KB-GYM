const authService = require("../services/auth.service");

const registerController = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

const loginController = async (req, res) => {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ message: "Phone number and password are required" });
    }

    const result = await authService.login(phone_number, password);

    if (!result || !result.user || !result.token) {
      return res.status(400).json({ message: "Login failed" });
    }

    res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = { registerController, loginController };
