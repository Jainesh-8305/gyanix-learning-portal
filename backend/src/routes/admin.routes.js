// backend/src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const {
  getDashboard,
  approveCourse,
  rejectCourse,
  updateCourseStatus,
  requestCourseChanges,
  deleteCourse,
  toggleUserStatus,
  getUsers,
} = require('../controllers/admin.controller');

router.use(protect);
router.use(isAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Users
router.get('/users', getUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// All courses (filter by status or search)
router.get('/courses', async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .sort('-createdAt')
      .select('title shortDescription category level status instructor createdAt publishedAt totalStudents price adminFeedback');
    
    res.json({ success: true, data: courses, total: courses.length });
  } catch (error) { next(error); }
});

// Pending courses
router.get('/courses/pending', async (req, res, next) => {
  try {
    const courses = await Course.find({ status: 'pending' })
      .populate('instructor', 'name email')
      .sort('-createdAt')
      .select('title shortDescription category level status instructor createdAt');
    res.json({ success: true, data: courses, total: courses.length });
  } catch (error) { next(error); }
});

// Moderate / Status Actions
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/reject', rejectCourse);
router.put('/courses/:id/status', updateCourseStatus);
router.post('/courses/:id/request-changes', requestCourseChanges);
router.delete('/courses/:id', deleteCourse);

// All enrollments
router.get('/enrollments', async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find()
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, data: enrollments });
  } catch (error) { next(error); }
});

module.exports = router;