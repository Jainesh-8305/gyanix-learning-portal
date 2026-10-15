const Discussion = require('../models/Discussion');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const aiService = require('../services/ai.service');

// ─── Shared enrollment guard helper ─────────────────────────────────────────
// Returns true if user is enrolled in the course, OR is the instructor, OR is admin.
const isAllowedInCourse = async (courseId, user) => {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const course = await Course.findById(courseId).select('instructor');
  if (!course) return false;
  if (course.instructor.toString() === user._id.toString()) return true; // instructor
  const enrolled = await Enrollment.exists({
    student: user._id,
    course: courseId,
  });
  return !!enrolled;
};

// ─── @GET /api/courses/:courseId/discussions ─────────────────
const getDiscussions = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // ── Enrollment Guard: only enrolled students / instructor / admin ─────
    const allowed = await isAllowedInCourse(courseId, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to view the community.',
        requiresEnrollment: true,
      });
    }

    const { search, filter } = req.query;

    const query = { course: courseId };
    if (filter === 'resolved') query.isResolved = true;
    if (filter === 'unresolved') query.isResolved = false;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const discussions = await Discussion.find(query)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort('-createdAt');

    res.json({ success: true, data: discussions });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/courses/:courseId/discussions ────────────────
const createDiscussion = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, content, lessonId, tags, askAi } = req.body;

    // ── Enrollment Guard ─────────────────────────────────────────────────
    const allowed = await isAllowedInCourse(courseId, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to post a discussion.',
        requiresEnrollment: true,
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: 'Course not found' });
    }

    const discussion = new Discussion({
      course: courseId,
      lessonId: lessonId || '',
      user: req.user._id,
      title,
      content,
      tags: tags || [],
      replies: [],
    });

    // If student asked for AI instant assistant answer
    if (askAi) {
      const aiResponse = await aiService.generateTutorAnswer({
        courseTitle: course.title,
        lessonTitle: lessonId || '',
        studentQuestion: `${title}. ${content}`,
        studentName: req.user?.name || 'Scholar',
      });

      discussion.replies.push({
        user: req.user._id,
        content: aiResponse,
        isAiAnswer: true,
      });
    }

    await discussion.save();
    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/courses/:courseId/discussions/:id/reply ──────
const addReply = async (req, res, next) => {
  try {
    const { id, courseId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Reply content cannot be empty' });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: 'Discussion not found' });
    }

    // ── Enrollment Guard ─────────────────────────────────────────────────
    if (String(discussion.course) !== courseId)
      return res
        .status(400)
        .json({ success: false, message: 'Discussion/course mismatch' });
    const targetCourseId = discussion.course;
    const allowed = await isAllowedInCourse(targetCourseId, req.user);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled in this course to reply.',
        requiresEnrollment: true,
      });
    }

    const course = await Course.findById(discussion.course);
    const isInstructor =
      course && course.instructor.toString() === req.user._id.toString();

    discussion.replies.push({
      user: req.user._id,
      content,
      isInstructorReply: isInstructor || req.user.role === 'admin',
    });

    await discussion.save();
    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/courses/:courseId/discussions/:id/upvote ──────
const toggleUpvote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: 'Discussion not found' });
    }

    if (
      String(discussion.course) !== req.params.courseId ||
      !(await isAllowedInCourse(discussion.course, req.user))
    )
      return res
        .status(403)
        .json({ success: false, message: 'Course membership required' });
    const userIdStr = req.user._id.toString();
    const existsIndex = discussion.upvotes.findIndex(
      (u) => u.toString() === userIdStr,
    );

    if (existsIndex > -1) {
      discussion.upvotes.splice(existsIndex, 1);
    } else {
      discussion.upvotes.push(req.user._id);
    }

    await discussion.save();
    res.json({ success: true, upvotesCount: discussion.upvotes.length });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/courses/:courseId/discussions/:id/resolve ─────
const toggleResolve = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res
        .status(404)
        .json({ success: false, message: 'Discussion not found' });
    }

    const course = await Course.findById(discussion.course);
    if (
      String(discussion.course) !== req.params.courseId ||
      !(await isAllowedInCourse(discussion.course, req.user)) ||
      (req.user.role !== 'admin' &&
        String(discussion.user) !== String(req.user._id) &&
        String(course?.instructor) !== String(req.user._id))
    )
      return res.status(403).json({
        success: false,
        message:
          'Only the author or course moderator may resolve this discussion',
      });
    discussion.isResolved = !discussion.isResolved;
    await discussion.save();

    res.json({ success: true, isResolved: discussion.isResolved });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscussions,
  createDiscussion,
  addReply,
  toggleUpvote,
  toggleResolve,
};
