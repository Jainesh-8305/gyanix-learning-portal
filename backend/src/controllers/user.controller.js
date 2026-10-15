// backend/src/controllers/user.controller.js
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

// ─── @GET /api/users/me ───────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses')
      .populate('certificates');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const enrollments = await Enrollment.find({ student: user._id });
    const days = new Set(
      enrollments
        .flatMap((e) => e.completedLessons)
        .filter((l) => l.completedAt)
        .map((l) => l.completedAt.toISOString().slice(0, 10)),
    );
    let streak = 0;
    const day = new Date();
    if (!days.has(day.toISOString().slice(0, 10)))
      day.setUTCDate(day.getUTCDate() - 1);
    while (days.has(day.toISOString().slice(0, 10))) {
      streak++;
      day.setUTCDate(day.getUTCDate() - 1);
    }
    res.json({
      success: true,
      data: { ...user.toObject(), learningStreak: streak },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/users/me ───────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar, learningPreferences } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (bio !== undefined) fieldsToUpdate.bio = bio;
    if (avatar !== undefined) fieldsToUpdate.avatar = avatar;
    if (learningPreferences !== undefined)
      fieldsToUpdate.learningPreferences = learningPreferences;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/enrolled-courses ─────────────────────────
const getEnrolledCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title category level thumbnail instructor totalDuration',
        populate: { path: 'instructor', select: 'name avatar' },
      })
      .sort('-updatedAt');

    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/completed-courses ────────────────────────
const getCompletedCourses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
      isCompleted: true,
    })
      .populate({
        path: 'course',
        select: 'title category level thumbnail instructor',
        populate: { path: 'instructor', select: 'name avatar' },
      })
      .populate('certificate');

    res.json({ success: true, data: enrollments });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/users/certificates ─────────────────────────────
const getUserCertificates = async (req, res, next) => {
  try {
    const certs = await Certificate.find({ student: req.user._id })
      .populate('course', 'title category level thumbnail')
      .sort('-completedAt');

    res.json({ success: true, data: certs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
  getEnrolledCourses,
  getCompletedCourses,
  getUserCertificates,
};
