// backend/src/controllers/enrollment.controller.js
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const generateCertificate = require('../utils/generateCertificate');
const { sendCertificateIssued } = require('../services/email.service');
const crypto = require('crypto');

// ─── @POST /api/enrollments/:courseId ────────────────────────
// Free-course enrollment only. Paid courses go through Stripe payment flow.
const enrollFree = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Only students can enroll
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll. Please log in with a student account.',
      });
    }

    if (course.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This course requires payment. Use the buy button.',
      });
    }

    // Check already enrolled
    const existing = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course._id,
      amountPaid: 0,
    });

    // Update stats
    await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: enrollment._id },
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/enrollments/my ─────────────────────────────────
const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title thumbnail instructor level category totalLessons sections',
        populate: { path: 'instructor', select: 'name' },
      })
      .populate('certificate', 'pdfUrl certificateId')
      .sort('-lastAccessedAt');

    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/enrollments/:courseId/progress ─────────────────
// Updates lesson completion. When progress reaches 100%, triggers
// certificate generation and email notification automatically.
const updateProgress = async (req, res, next) => {
  try {
    const { lessonId, watchTimeSeconds } = req.body;

    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found. Please enroll first.',
      });
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      l => l.lessonId.toString() === lessonId
    );

    if (!alreadyCompleted) {
      enrollment.completedLessons.push({
        lessonId,
        completedAt: new Date(),
        watchTimeSeconds: watchTimeSeconds || 0,
      });
    }

    const course = await Course.findById(req.params.courseId)
      .populate('instructor', 'name');
    const totalLessons = course.sections.reduce(
      (acc, s) => acc + s.lessons.length, 0
    );

    enrollment.progressPercentage = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    enrollment.lastAccessedAt = new Date();

    // ── Course completion: generate certificate ─────────────
    const wasAlreadyComplete = enrollment.isCompleted;
    if (enrollment.progressPercentage >= 100 && !wasAlreadyComplete) {
      enrollment.isCompleted = true;
      enrollment.completedAt = new Date();

      // Trigger certificate generation asynchronously (don't block the response)
      issueCertificate(enrollment, course, req.user).catch(err =>
        console.error('Certificate generation error:', err.message)
      );
    }

    await enrollment.save();
    res.json({ success: true, data: enrollment });
  } catch (error) {
    next(error);
  }
};

// ─── Certificate issuance (internal helper) ───────────────────
// Runs async after the progress response is sent. Generates the PDF,
// uploads to Cloudinary, saves the Certificate document, and emails
// the student. Idempotent — silently skips if already issued.
const issueCertificate = async (enrollment, course, student) => {
  // Idempotency: don't issue twice
  const existing = await Certificate.findOne({
    student: enrollment.student,
    course: enrollment.course,
  });
  if (existing) return;

  // Build a short unique cert ID (8 hex chars)
  const certId = crypto.randomBytes(4).toString('hex').toUpperCase();

  const pdfUrl = await generateCertificate({
    studentName: student.name,
    courseTitle: course.title,
    instructorName: course.instructor?.name || 'AI-LMS Instructor',
    certificateId: certId,
    completedAt: enrollment.completedAt,
  });

  const cert = await Certificate.create({
    student: enrollment.student,
    course: enrollment.course,
    enrollment: enrollment._id,
    certificateId: certId,
    studentName: student.name,
    courseTitle: course.title,
    instructorName: course.instructor?.name || 'AI-LMS Instructor',
    completedAt: enrollment.completedAt,
    pdfUrl,
  });

  // Link certificate to enrollment and student profile
  await Enrollment.findByIdAndUpdate(enrollment._id, { certificate: cert._id });
  await User.findByIdAndUpdate(enrollment.student, {
    $push: { certificates: cert._id },
    $addToSet: { completedCourses: enrollment.course },
  });

  // Email the student
  sendCertificateIssued(
    student.email,
    student.name,
    course.title,
    pdfUrl
  ).catch(err => console.error('Certificate email error:', err.message));
};

module.exports = { enrollFree, getMyEnrollments, updateProgress };