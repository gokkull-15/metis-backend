const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {
  checkNullifier,
  register,
  login,
  getCurrentUser,
  updateProfile,
  getUserDashboard,
  logout
} = require('../controllers/authController');

// Registration flow
router.post('/check-nullifier', checkNullifier); // Step 1: Check if Aadhaar nullifier is available
router.post('/register', register); // Step 2: Complete registration with all details

// Login
router.post('/login', login);

// Protected Routes (require authentication)
router.get('/me', authenticate, getCurrentUser);
router.get('/dashboard', authenticate, getUserDashboard); // User dashboard with all data
router.put('/profile', authenticate, updateProfile);
router.post('/logout', authenticate, logout);

// Test route to verify authentication
router.get('/protected', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'This is a protected route',
    user: {
      username: req.user.username,
      state: req.user.state,
      userLevel: req.user.userLevel
    }
  });
});

module.exports = router;
