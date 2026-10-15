// backend/src/controllers/admin.controller.js
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const {
  sendCourseApproved,
  sendCourseRejected,
  sendCourseChangeRequest,
} = require('../services/email.service');

// ─── @GET /api/admin/dashboard ────────────────────────────────
const getDashboard = async (req, res, next) => {
  try {
    const [totalUsers, totalCourses, totalEnrollments, pendingCourses] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments({ status: 'published' }),
        Enrollment.countDocuments(),
        Course.countDocuments({ status: 'pending' }),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        pendingCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/admin/courses/:id/approve ──────────────────────
const approveCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        status: 'published',
        publishedAt: new Date(),
        adminFeedback: undefined,
      },
      { new: true },
    ).populate('instructor', 'name email');

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    // Notify instructor by email (fire and forget)
    if (course.instructor?.email) {
      sendCourseApproved(
        course.instructor.email,
        course.instructor.name,
        course.title,
      ).catch((err) => console.error('Email error (approve):', err.message));
    }

    res.json({
      success: true,
      data: course,
      message: 'Course approved and published',
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/admin/courses/:id/reject ───────────────────────
const rejectCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', adminFeedback: req.body.feedback },
      { new: true },
    ).populate('instructor', 'name email');

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    // Notify instructor by email (fire and forget)
    if (course.instructor?.email) {
      sendCourseRejected(
        course.instructor.email,
        course.instructor.name,
        course.title,
        req.body.feedback,
      ).catch((err) => console.error('Email error (reject):', err.message));
    }

    res.json({ success: true, data: course, message: 'Course rejected' });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/admin/courses/:id/status ───────────────────────
// Admin can set status to 'published', 'hidden', 'archived', 'draft', 'pending', or 'rejected'
const updateCourseStatus = async (req, res, next) => {
  try {
    const { status, feedback } = req.body;
    const allowedStatuses = [
      'draft',
      'pending',
      'published',
      'rejected',
      'archived',
      'hidden',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const updateFields = { status };
    if (status === 'published') {
      updateFields.publishedAt = new Date();
    }
    if (feedback !== undefined) {
      updateFields.adminFeedback = feedback;
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    }).populate('instructor', 'name email');

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    res.json({
      success: true,
      data: course,
      message: `Course status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/admin/courses/:id/request-changes ────────────
// Admin sends edit/change instructions to instructor & updates course status
const requestCourseChanges = async (req, res, next) => {
  try {
    const { feedback, status = 'rejected' } = req.body;
    if (!['rejected', 'draft', 'hidden'].includes(status))
      return res
        .status(400)
        .json({ success: false, message: 'Unsupported review status' });

    if (!feedback || !feedback.trim()) {
      return res.status(400).json({
        success: false,
        message:
          'Feedback or instruction details are required to send change request',
      });
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status, adminFeedback: feedback.trim() },
      { new: true },
    ).populate('instructor', 'name email');

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    // Notify instructor with instructions via email
    if (course.instructor?.email) {
      sendCourseChangeRequest(
        course.instructor.email,
        course.instructor.name,
        course.title,
        feedback.trim(),
        `Course placed in "${status}" status pending your revisions.`,
      ).catch((err) =>
        console.error('Email error (requestChanges):', err.message),
      );
    }

    res.json({
      success: true,
      data: course,
      message: 'Change request and instructions sent to instructor',
    });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/admin/courses/:id ───────────────────────────
// Admin can permanently remove a course
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });

    course.status = 'archived';
    await course.save();

    res.json({
      success: true,
      message: `Course "${course.title}" archived by admin; learning records retained`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/admin/users/:id/toggle-status ──────────────────
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Cannot modify admin accounts' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/admin/users ────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const { page, limit } = require('../utils/http').pagination(req.query);
    const filter = {};
    if (role && !['student', 'instructor', 'admin'].includes(role))
      throw require('../utils/http').fail(400, 'Unsupported role filter');
    if (role) filter.role = role;
    if (search) {
      const safeSearch = require('../utils/http').literalSearch(search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ success: true, data: users, total });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  approveCourse,
  rejectCourse,
  updateCourseStatus,
  requestCourseChanges,
  deleteCourse,
  toggleUserStatus,
  getUsers,
};
