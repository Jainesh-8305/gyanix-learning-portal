// backend/src/routes/course.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getCourses, getCourse, createCourse,
  updateCourse, submitCourseForReview, deleteCourse,
} = require('../controllers/course.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { isInstructor } = require('../middleware/roles');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const cloudinary = require('../config/cloudinary');

// Multer setup for thumbnail uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ─── PUBLIC ─────────────────────────────────────────────────
router.get('/', optionalAuth, getCourses);

// ─── NAMED ROUTES (must be before /:id) ─────────────────────

// Instructor: comprehensive analytics with student roster, reviews, and rating breakdown
router.get('/instructor-overview', protect, isInstructor, async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({
      $or: [{ instructor: instructorId }, { instructor: String(instructorId) }],
    }).sort('-createdAt');

    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email avatar createdAt')
      .populate('course', 'title classroomCode')
      .sort('-createdAt');

    const enrolledStudents = enrollments.map((e) => ({
      enrollmentId: e._id,
      studentId: e.student?._id,
      studentName: e.student?.name || 'Student',
      studentEmail: e.student?.email || 'N/A',
      studentAvatar: e.student?.avatar || '',
      courseId: e.course?._id,
      courseTitle: e.course?.title || 'Unknown Course',
      classroomCode: e.course?.classroomCode || 'N/A',
      progressPercentage: e.progressPercentage || 0,
      isCompleted: e.isCompleted || false,
      enrolledAt: e.createdAt,
      rating: e.rating || null,
      review: e.review || '',
      reviewedAt: e.reviewedAt || null,
    }));

    // Reviews list (enrolled students who submitted a review or rating)
    const reviews = enrolledStudents
      .filter((s) => s.review || (s.rating && s.rating > 0))
      .map((r) => ({
        id: r.enrollmentId,
        studentName: r.studentName,
        studentEmail: r.studentEmail,
        courseTitle: r.courseTitle,
        rating: r.rating || 5,
        reviewText: r.review || 'Active student learning participation',
        reviewedAt: r.reviewedAt || r.enrolledAt,
      }));

    const publishedCourses = courses.filter((c) => c.status === 'published');
    const totalStudentsCount = enrollments.length;

    let sumRatings = 0;
    let totalRatingsCount = 0;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    enrollments.forEach((e) => {
      if (e.rating && e.rating > 0) {
        sumRatings += e.rating;
        totalRatingsCount++;
        const rounded = Math.round(e.rating);
        if (distribution[rounded] !== undefined) distribution[rounded]++;
      }
    });

    if (totalRatingsCount === 0) {
      publishedCourses.forEach((c) => {
        if (c.rating && c.rating > 0) {
          sumRatings += c.rating;
          totalRatingsCount++;
          const rounded = Math.round(c.rating);
          if (distribution[rounded] !== undefined) distribution[rounded]++;
        }
      });
    }

    const averageRating = totalRatingsCount > 0 ? (sumRatings / totalRatingsCount).toFixed(1) : '5.0';

    res.json({
      success: true,
      data: {
        totalPublishedCourses: publishedCourses.length,
        totalEnrolledCadets: totalStudentsCount,
        totalActiveReviews: reviews.length,
        averageRating: parseFloat(averageRating),
        ratingDistribution: distribution,
        courses: courses.map((c) => ({
          _id: c._id,
          title: c.title,
          category: c.category,
          level: c.level,
          status: c.status,
          classroomCode: c.classroomCode,
          totalStudents:
            enrollments.filter((e) => String(e.course?._id) === String(c._id)).length ||
            c.totalStudents ||
            0,
          rating: c.rating || 5.0,
          createdAt: c.createdAt,
        })),
        students: enrolledStudents,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Instructor: get own courses
router.get('/my-courses', protect, isInstructor, async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({
      $or: [{ instructor: instructorId }, { instructor: String(instructorId) }],
    })
      .sort('-createdAt')
      .select('title status level category price createdAt totalStudents rating sections classroomCode thumbnail');
    res.json({ success: true, data: courses });
  } catch (error) { next(error); }
});

// Thumbnail upload
router.post('/upload-thumbnail', protect, isInstructor, upload.single('thumbnail'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'ai-lms/thumbnails', transformation: [{ width: 1280, height: 720, crop: 'fill' }] },
        (error, result) => { if (error) reject(error); else resolve(result); }
      )(req.file.buffer);
    });
    res.json({ success: true, url: result.secure_url });
  } catch (error) {
    next(error);
  }
});

// ─── DYNAMIC (must be after named routes) ────────────────────
router.get('/:id', optionalAuth, getCourse);

// ─── MUTATIONS ───────────────────────────────────────────────
router.post('/', protect, isInstructor, createCourse);
router.put('/:id', protect, isInstructor, updateCourse);
router.post('/:id/submit', protect, isInstructor, submitCourseForReview);

// 1-Click Toggle Publish / Draft
router.post('/:id/toggle-publish', protect, isInstructor, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();
    res.json({
      success: true,
      message: `Course ${course.status === 'published' ? 'published' : 'moved to drafts'} successfully`,
      data: course,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', protect, isInstructor, deleteCourse);

module.exports = router;