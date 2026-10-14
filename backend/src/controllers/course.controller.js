// backend/src/controllers/course.controller.js
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// ─── @GET /api/courses ────────────────────────────────────────
// Public: Get all published courses with search & filter
const getCourses = async (req, res, next) => {
  try {
    const {
      search, category, level, minPrice, maxPrice, status,
      sort = '-createdAt', page = 1, limit = 12,
    } = req.query;

    const filter = {};

    // Role-based status filtering
    if (req.user?.role === 'admin') {
      if (status) filter.status = status;
      // No status filter = admin sees everything
    } else if (req.user?.role === 'instructor') {
      // Instructors browsing the catalog see published only
      filter.status = 'published';
    } else {
      filter.status = 'published';
    }

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar rating')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-sections');

    res.json({
      success: true,
      data: courses,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
// ─── @GET /api/courses/:id ────────────────────────────────────
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio rating totalStudents');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // For non-enrolled users, hide video URLs (only show free lessons)
    const courseData = course.toObject();
    const isEnrolled = req.user
      ? await Enrollment.exists({ student: req.user._id, course: course._id })
      : false;

    if (!isEnrolled) {
      courseData.sections = courseData.sections?.map(section => ({
        ...section,
        lessons: section.lessons?.map(lesson => ({
          ...lesson,
          videoUrl: lesson.isFree ? lesson.videoUrl : null,
        })),
      }));
    }

    res.json({ success: true, data: courseData, isEnrolled: !!isEnrolled });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/courses ───────────────────────────────────────
// Instructor only
const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user._id,
      status: 'draft',
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/courses/:id ────────────────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Ownership check (instructors can only edit their own courses)
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/courses/:id/submit ───────────────────────────
// Instructor submits course for admin review
const submitCourseForReview = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    course.status = 'pending';
    await course.save();

    res.json({ success: true, message: 'Course submitted for review', data: course });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/courses/:id ─────────────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await course.deleteOne();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourse, createCourse, updateCourse, submitCourseForReview, deleteCourse };