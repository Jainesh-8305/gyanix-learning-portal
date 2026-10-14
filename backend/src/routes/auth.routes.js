// backend/src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const isDev = process.env.NODE_ENV !== 'production';

// Rate limiter for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 500 : 60,     // 60 attempts per 15 mins (500 in dev)
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Successful logins do not count against the limit
});

router.post('/register', register);
router.post('/login', loginLimiter, login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;