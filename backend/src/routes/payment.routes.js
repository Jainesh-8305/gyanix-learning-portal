// backend/src/routes/payment.routes.js
const express = require('express');
const router = express.Router();
const STRIPE_KEY =
  process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('dummy')
    ? process.env.STRIPE_SECRET_KEY
    : 'sk_test_placeholder_for_dev_mode_only';

const stripe = require('stripe')(STRIPE_KEY);
const { protect } = require('../middleware/auth');
const stripeService = require('../services/stripe.service');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// Create payment intent
router.post('/create-intent', protect, async (req, res, next) => {
  try {
    const result = await stripeService.createPaymentIntent(
      req.body.courseId,
      req.user._id
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

// Sandbox / Test Purchase Route (for testing without live card)
router.post('/simulate-enroll', protect, async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existing) return res.json({ success: true, message: 'Already enrolled', enrollment: existing });

    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: courseId,
      paymentId: `sandbox_${Date.now()}`,
      amountPaid: course.price || 0,
    });

    await Promise.all([
      Course.findByIdAndUpdate(courseId, { $inc: { totalStudents: 1, totalRevenue: course.price || 0 } }),
      User.findByIdAndUpdate(req.user._id, { $push: { enrolledCourses: enrollment._id } }),
    ]);

    res.json({ success: true, message: 'Enrolled via test purchase', enrollment });
  } catch (err) {
    next(err);
  }
});

// Stripe webhook (RAW body needed!)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    await stripeService.handlePaymentSuccess(event.data.object);
  }

  res.json({ received: true });
});

module.exports = router;