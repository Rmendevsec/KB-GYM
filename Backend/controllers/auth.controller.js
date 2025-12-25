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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await authService.login(email, password);

    // Make sure result has user and token
    if (!result || !result.user || !result.token) {
      return res.status(400).json({ message: "Login failed" });
    }

    // Send a single response
    res.json({
      success: true,
      user: result.user,
      token: result.token,
    });
  } catch (err) {
    console.error(err);
    // Only one response per request
    if (!res.headersSent) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = { registerController, loginController };
