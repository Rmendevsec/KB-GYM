const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await authService.login(email, password);
    
    res.json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login
};