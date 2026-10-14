 // backend/src/controllers/auth.controller.js
  const User = require('../models/User');
  const jwt = require('jsonwebtoken');
  const crypto = require('crypto');
  const { sendWelcomeEmail, sendPasswordReset } = require('../services/email.service');

  // Helper: Generate JWT token
  const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });
  };

  // Helper: Send token response
  const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
      success: true,
      token,
      user,
    });
  };

  // ─── @POST /api/auth/register ────────────────────────────────
  const register = async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;

      // Prevent self-assigning admin role
      const safeRole = role === 'admin' ? 'student' : (role || 'student');

      // Check if email already exists
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered',
        });
      }

      const user = await User.create({ name, email, password, role: safeRole });

      sendTokenResponse(user, 201, res);

      // Send welcome email (don't await — fire and forget)
      sendWelcomeEmail(user.email, user.name).catch(() => {});
    } catch (error) {
      next(error);
    }
  };

  // ─── @POST /api/auth/login ────────────────────────────────────
  const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password',
        });
      }

      const normalizedEmail = email ? email.toLowerCase().trim() : '';

      // Find user (include password for comparison)
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated. Contact support.',
        });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      sendTokenResponse(user, 200, res);
    } catch (error) {
      next(error);
    }
  };

  // ─── @GET /api/auth/me ────────────────────────────────────────
  const getMe = async (req, res) => {
    // req.user is set by the protect middleware
    res.json({ success: true, user: req.user });
  };

  // ─── @POST /api/auth/forgot-password ─────────────────────────
  const forgotPassword = async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email });

      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({
          success: true,
          message: 'If that email exists, a reset link has been sent',
        });
      }

      // Generate reset token (raw token sent in email, hashed version stored in DB)
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save({ validateBeforeSave: false });

      // Send email
      await sendPasswordReset(user.email, resetToken);

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      res.json({
        success: true,
        message: 'Password reset email sent',
        resetUrl,
      });
    } catch (error) {
      next(error);
    }
  };

  // ─── @POST /api/auth/reset-password ──────────────────────────
  // Consumes the raw token from the email link, validates the hashed
  // version stored in DB, and updates the user's password.
  const resetPassword = async (req, res, next) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token and new password are required',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters',
        });
      }

      // Hash the incoming raw token to match what was stored
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      // Find user with matching, non-expired token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new link.',
        });
      }

      // Update password and clear reset fields
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save(); // triggers bcrypt pre('save') hook

      res.json({
        success: true,
        message: 'Password reset successfully. You can now log in.',
      });
    } catch (error) {
      next(error);
    }
  };

  module.exports = { register, login, getMe, forgotPassword, resetPassword };