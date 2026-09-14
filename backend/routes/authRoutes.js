const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Example of a protected test route that only admins can access
router.get('/admin-dashboard', protect, admin, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! You have access to this protected test route.',
  });
});

module.exports = router;
