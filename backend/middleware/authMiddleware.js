const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes (require login)
const protect = async (req, res, next) => {
  let token;

  // Check if header has authorization and starts with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (split "Bearer <token>" and take the token part)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token and attach to req.user (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the next middleware or route handler
    } catch (error) {
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

// Middleware to restrict access to admin only
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, error: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
