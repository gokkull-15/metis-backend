const { verifyToken } = require('../utils/jwt');
const AuthUser = require('../models/AuthUser');

const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await AuthUser.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authenticate;
