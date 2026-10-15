// backend/src/controllers/assignment.controller.js
//
// Assignment CRUD — Create, Read, Submit, Grade.
// Instructors create/manage assignments and grade submissions.
// Students submit answers (text or file URL).
// AI-assisted grading is available via the gradeAnswer service.

const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { fail, owned } = require('../utils/http');
const { gradeAnswer } = require('../services/ai.service');

// ─── @POST /api/assignments ───────────────────────────────────
const createAssignment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      courseId,
      lessonId,
      maxScore,
      dueDate,
      rubric,
      enableAiGrading,
    } = req.body;

    const c = await Course.findById(courseId);
    if (!c) throw fail(404, 'Course not found');
    if (!owned(c, req.user)) throw fail(403, 'Course owner required');
    const assignment = await Assignment.create({
      answerKey: req.body.answerKey,
      title,
      description,
      course: courseId,
      lesson: lessonId || undefined,
      instructor: req.user._id,
      maxScore: maxScore ?? 100,
      dueDate: dueDate || undefined,
      rubric: rubric || undefined,
      enableAiGrading: enableAiGrading ?? false,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/assignments/course/:courseId ───────────────────
const getAssignmentsByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Students must be enrolled
    if (req.user.role === 'student') {
      const enrolled = await Enrollment.exists({
        student: req.user._id,
        course: courseId,
      });
      if (!enrolled) {
        return res
          .status(403)
          .json({ success: false, message: 'Enrollment required' });
      }
    }

    const c = await Course.findById(courseId);
    if (!c) throw fail(404, 'Course not found');
    if (req.user.role !== 'student' && !owned(c, req.user))
      throw fail(403, 'Course owner required');
    const assignments = await Assignment.find({ course: courseId })
      .select('-submissions') // Don't send all submissions to everyone
      .sort('createdAt');

    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/assignments/:id ────────────────────────────────
// Instructors see all submissions; students see only their own
const getAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(
      'instructor',
      'name',
    );

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role === 'student') {
      const enrolled = await Enrollment.exists({
        student: req.user._id,
        course: assignment.course,
      });
      if (!enrolled)
        return res
          .status(403)
          .json({ success: false, message: 'Enrollment required' });

      // Filter to show only the student's own submission
      const mySubmission = assignment.submissions.find(
        (s) => s.student.toString() === req.user._id.toString(),
      );
      const assignmentObj = assignment.toObject();
      assignmentObj.submissions = mySubmission ? [mySubmission] : [];
      return res.json({ success: true, data: assignmentObj });
    }

    if (req.user.role !== 'student') {
      const c = await Course.findById(assignment.course);
      if (!c || !owned(c, req.user)) throw fail(403, 'Course owner required');
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/assignments/:id ────────────────────────────────
const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });

    if (
      assignment.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    const allowed = [
      'title',
      'description',
      'maxScore',
      'dueDate',
      'rubric',
      'enableAiGrading',
    ];
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) assignment[key] = req.body[key];
    });
    await assignment.save();

    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/assignments/:id ─────────────────────────────
const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });

    if (
      assignment.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    await assignment.deleteOne();
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/assignments/:id/submit ───────────────────────
// Student submits their answer. If AI grading is enabled, auto-grades immediately.
const submitAssignment = async (req, res, next) => {
  try {
    const { content, fileUrl } = req.body;

    const assignment = await Assignment.findById(req.params.id).select(
      '+answerKey',
    );
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });
    if (assignment.dueDate && assignment.dueDate < new Date())
      throw fail(400, 'Submission deadline has passed');
    if (req.user.role !== 'student')
      throw fail(403, 'Student account required');
    if (
      typeof content !== 'string' ||
      !content.trim() ||
      content.length > 20000
    )
      throw fail(400, 'Answer must contain 1-20000 characters');

    // Verify enrollment
    const enrolled = await Enrollment.exists({
      student: req.user._id,
      course: assignment.course,
    });
    if (!enrolled)
      return res
        .status(403)
        .json({ success: false, message: 'Enrollment required' });

    // Prevent duplicate submission (one submission per student)
    const alreadySubmitted = assignment.submissions.some(
      (s) => s.student.toString() === req.user._id.toString(),
    );
    if (alreadySubmitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    const submission = {
      student: req.user._id,
      content,
      fileUrl: fileUrl || undefined,
      submittedAt: new Date(),
    };

    // ── Optional: AI auto-grading ─────────────────────────
    if (assignment.enableAiGrading && assignment.rubric) {
      try {
        const result = await gradeAnswer({
          question: `${assignment.title}\n\n${assignment.description}`,
          studentAnswer: content,
          rubric: `${assignment.rubric || ''}\nReference answer: ${assignment.answerKey || ''}`,
          maxPoints: assignment.maxScore,
        });
        submission.score = result.score;
        submission.feedback = result.feedback;
        submission.strengths = result.strengths || [];
        submission.improvements = result.improvements || [];
        submission.aiGraded = true;
        submission.gradedAt = new Date();
      } catch (_aiErr) {
        // AI grading failed — submission saved without a grade
        console.error('AI grading failed:', _aiErr.message);
      }
    }

    assignment.submissions.push(submission);
    await assignment.save();

    const savedSubmission =
      assignment.submissions[assignment.submissions.length - 1];
    res.status(201).json({ success: true, data: savedSubmission });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/assignments/:id/grade/:submissionId ────────────
// Instructor manually grades a submission (overrides AI grade if any)
const gradeSubmission = async (req, res, next) => {
  try {
    const { score, feedback, strengths, improvements } = req.body;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment)
      return res
        .status(404)
        .json({ success: false, message: 'Assignment not found' });

    if (
      assignment.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Not authorized' });
    }

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission)
      return res
        .status(404)
        .json({ success: false, message: 'Submission not found' });

    if (!Number.isFinite(score) || score < 0 || score > assignment.maxScore)
      throw fail(400, 'Score must be between zero and maximum points');
    submission.score = score;
    submission.feedback = feedback;
    submission.strengths = strengths || [];
    submission.improvements = improvements || [];
    submission.aiGraded = false;
    submission.gradedAt = new Date();
    submission.gradedBy = req.user._id;

    await assignment.save();
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
};
