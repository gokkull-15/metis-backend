const express = require('express');
const router = express.Router();
const { saveUser, getUserByWallet } = require('../controllers/userController');

// POST /api/users/save - Save or update user
router.post('/save', saveUser);

// GET /api/users - Get user by wallet address
router.get('/', getUserByWallet);

module.exports = router;
