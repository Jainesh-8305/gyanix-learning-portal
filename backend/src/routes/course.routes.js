// backend/src/routes/course.routes.js
const express = require('express');
const router = express.Router();
router.param('id', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);

const { fail, owned, objectIds } = require('../utils/http');
router.use(objectIds);
const multer = require('multer');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  submitCourseForReview,
  deleteCourse,
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
router.get(
  '/instructor-overview',
  protect,
  isInstructor,
  async (req, res, next) => {
    try {
      const instructorId = req.user._id;
      const courses = await Course.find({
        $or: [
          { instructor: instructorId },
          { instructor: String(instructorId) },
        ],
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
          rating: r.rating || 0,
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

      const averageRating =
        totalRatingsCount > 0
          ? (sumRatings / totalRatingsCount).toFixed(1)
          : '0.0';

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
              enrollments.filter((e) => String(e.course?._id) === String(c._id))
                .length ||
              c.totalStudents ||
              0,
            rating: c.rating || 0,
            createdAt: c.createdAt,
          })),
          students: enrolledStudents,
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// Instructor: get own courses
router.get('/my-courses', protect, isInstructor, async (req, res, next) => {
  try {
    const instructorId = req.user._id;
    const courses = await Course.find({
      $or: [{ instructor: instructorId }, { instructor: String(instructorId) }],
    })
      .sort('-createdAt')
      .select(
        'title status level category createdAt totalStudents totalLessons totalRatings rating classroomCode thumbnail',
      );
    res.json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
});

// Thumbnail upload
router.post(
  '/upload-thumbnail',
  protect,
  isInstructor,
  upload.single('thumbnail'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: 'No file uploaded' });
      }
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'ai-lms/thumbnails',
              transformation: [{ width: 1280, height: 720, crop: 'fill' }],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(req.file.buffer);
      });
      res.json({ success: true, url: result.secure_url });
    } catch (error) {
      next(error);
    }
  },
);

router.post('/join-batch', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'student')
      throw fail(403, 'Student account required');
    if (typeof req.body.classroomCode !== 'string')
      throw fail(400, 'Classroom code required');
    const c = await Course.findOne({
      classroomCode: req.body.classroomCode.trim().toUpperCase(),
      status: 'published',
    });
    if (!c) throw fail(404, 'Classroom not found');
    req.params.courseId = String(c._id);
    await require('../controllers/enrollment.controller').enrollFree(
      req,
      res,
      next,
    );
  } catch (e) {
    next(e);
  }
});
router.get('/batch-quizzes', protect, async (req, res, next) => {
  try {
    const ids = (await Enrollment.find({ student: req.user._id })).map(
      (e) => e.course,
    );
    const data = await require('../models/Quiz')
      .find({ course: { $in: ids }, isCertification: false })
      .select('-questions')
      .populate('course', 'title classroomCode');
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.post(
  '/:id/batch-quiz',
  protect,
  isInstructor,
  require('../services/ai-status').middleware,
  async (req, res, next) => {
    try {
      const c = await Course.findById(req.params.id);
      if (!c) throw fail(404, 'Course not found');
      if (!owned(c, req.user)) throw fail(403, 'Not authorized');
      const dueDate = req.body.dueDate ? new Date(req.body.dueDate) : undefined;
      if (
        dueDate &&
        (!Number.isFinite(dueDate.getTime()) || dueDate <= new Date())
      )
        throw fail(400, 'Quiz deadline must be in the future');
      const { questions } =
        await require('../services/ai.service').generateQuizQuestions({
          topic: req.body.topic || c.title,
          count: 5,
          difficulty: req.body.difficulty || 'medium',
        });
      const data = await require('../models/Quiz').create({
        title: req.body.topic || c.title + ' recall quiz',
        course: c._id,
        instructor: c.instructor,
        questions: questions.map((q) => ({ ...q, difficulty: 'medium' })),
        timeLimit: Number(req.body.timeLimit) || 15,
        dueDate,
        generationMode: require('../services/ai-status').metadata().mode,
      });
      res.status(201).json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
);

// ─── DYNAMIC (must be after named routes) ────────────────────
router.get('/:id', optionalAuth, getCourse);

// ─── MUTATIONS ───────────────────────────────────────────────
router.post('/', protect, isInstructor, createCourse);
router.put('/:id', protect, isInstructor, updateCourse);
router.post('/:id/submit', protect, isInstructor, submitCourseForReview);

// Owners may unpublish, but only admin can publish.
router.post(
  '/:id/toggle-publish',
  protect,
  isInstructor,
  async (req, res, next) => {
    try {
      const c = await Course.findById(req.params.id);
      if (!c) throw fail(404, 'Course not found');
      if (!owned(c, req.user)) throw fail(403, 'Not authorized');
      if (c.status !== 'published' && req.user.role !== 'admin')
        throw fail(403, 'Submit this course for admin review');
      c.status = c.status === 'published' ? 'draft' : 'published';
      await c.save();
      res.json({ success: true, data: c });
    } catch (e) {
      next(e);
    }
  },
);

router.delete('/:id', protect, isInstructor, deleteCourse);

module.exports = router;
