const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Test users
const testUsers = [
  {
    id: '1',
    full_name: 'Admin User',
    email: 'admin@gym.com',
    password: 'Admin@123',
    role: 'admin',
    is_active: true
  },
  {
    id: '2',
    full_name: 'Cashier User',
    email: 'cashier@gym.com',
    password: 'Cashier@123',
    role: 'cashier',
    is_active: true
  },
  {
    id: '3',
    full_name: 'Member User',
    email: 'user@gym.com',
    password: 'User@123',
    role: 'user',
    is_active: true
  }
];

// Login endpoint with REAL JWT token
router.post('/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body.email);
  
  const { email, password } = req.body;
  
  // Find user
  const user = testUsers.find(u => u.email === email);
  
  if (!user) {
    console.log('❌ User not found:', email);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // For testing, accept plain text passwords
  const passwordMatches = (
    (email === 'admin@gym.com' && password === 'Admin@123') ||
    (email === 'cashier@gym.com' && password === 'Cashier@123') ||
    (email === 'user@gym.com' && password === 'User@123')
  );
  
  if (!passwordMatches) {
    console.log('❌ Invalid password for:', email);
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
  
  // Create user response without password
  const userResponse = { ...user };
  delete userResponse.password;
  
  // ✅ Generate REAL JWT token (not test string)
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // issued at
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // expires in 24 hours
    },
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    { algorithm: 'HS256' }
  );
  
  console.log('✅ Generated REAL JWT token:', {
    length: token.length,
    isJWT: token.split('.').length === 3
  });
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      token: token // REAL JWT token
    }
  });
});

module.exports = router;