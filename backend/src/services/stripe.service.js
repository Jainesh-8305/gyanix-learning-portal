// backend/src/services/stripe.service.js
//
// Wraps Stripe API calls for the payment flow:
//   1. createPaymentIntent  — called by POST /api/payments/create-intent
//   2. handlePaymentSuccess — called by POST /api/payments/webhook
//
// After a successful webhook, the student is enrolled and receives
// a payment receipt email. Certificate is triggered by the enrollment
// controller when the student completes the course.

const STRIPE_KEY =
  process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('dummy')
    ? process.env.STRIPE_SECRET_KEY
    : 'sk_test_placeholder_for_dev_mode_only';

const stripe = require('stripe')(STRIPE_KEY);
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { sendPaymentReceipt } = require('./email.service');

/**
 * Create a Stripe PaymentIntent for a course purchase.
 * Returns { clientSecret, amount } for the frontend Stripe Elements form.
 */
const createPaymentIntent = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');
  if (course.price <= 0) throw new Error('This course is free — use the free enrollment endpoint');

  const existing = await Enrollment.findOne({ student: userId, course: courseId });
  if (existing) throw new Error('Already enrolled in this course');

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(course.price * 100), // Convert INR rupees to paise
      currency: 'inr',
      description: `Gyanix Academy - ${course.title}`,
      metadata: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        courseTitle: course.title,
      },
    });

    return { clientSecret: paymentIntent.client_secret, amount: course.price, currency: 'inr' };
  } catch (stripeErr) {
    console.error('Stripe createPaymentIntent failed:', stripeErr.message);
    const err = new Error(stripeErr.message || 'Payment gateway configuration error');
    err.statusCode = 502;
    throw err;
  }
};

/**
 * Handle the Stripe webhook event after a successful payment.
 * Creates the Enrollment record and sends a payment receipt email.
 * The Certificate is generated separately when the student completes the course.
 */
const handlePaymentSuccess = async (paymentIntent) => {
  const { courseId, userId, courseTitle } = paymentIntent.metadata;

  // Idempotency: don't double-enroll if webhook fires twice
  const existing = await Enrollment.findOne({ student: userId, course: courseId });
  if (existing) return existing;

  const enrollment = await Enrollment.create({
    student: userId,
    course: courseId,
    paymentId: paymentIntent.id,
    amountPaid: paymentIntent.amount / 100,
  });

  const [, user] = await Promise.all([
    Course.findByIdAndUpdate(courseId, {
      $inc: { totalStudents: 1, totalRevenue: paymentIntent.amount / 100 },
    }),
    User.findByIdAndUpdate(userId, {
      $push: { enrolledCourses: enrollment._id },
    }, { new: true }),
  ]);

  // Send payment receipt email (fire and forget)
  if (user?.email) {
    sendPaymentReceipt(
      user.email,
      user.name,
      courseTitle || 'your course',
      paymentIntent.amount / 100
    ).catch(err => console.error('Receipt email error:', err.message));
  }

  return enrollment;
};

module.exports = { createPaymentIntent, handlePaymentSuccess };