// backend/src/routes/assignment.routes.js
const express = require('express');
const router = express.Router();
router.param('id', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);
router.param('courseId', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);
router.param('submissionId', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);

const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/roles');
const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission,
} = require('../controllers/assignment.controller');

router.use(protect);

// ── Instructor: create an assignment ─────────────────────────
router.post('/', isInstructor, createAssignment);

// ── Get all assignments for a course ─────────────────────────
router.get('/course/:courseId', getAssignmentsByCourse);

router.get('/instructor/my', isInstructor, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { instructor: req.user._id };
    const data = await require('../models/Assignment')
      .find(query)
      .populate('course', 'title classroomCode')
      .populate('submissions.student', 'name email');
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});
router.post('/ai-generate', isInstructor, async (req, res, next) => {
  try {
    const data = await require('../services/ai.service').generateAssignment(
      req.body,
    );
    res.json({ success: true, data });
  } catch (e) {
    next(e);
  }
});

// ── CRUD on individual assignment ────────────────────────────
router.get('/:id', getAssignment);
router.put('/:id', isInstructor, updateAssignment);
router.delete('/:id', isInstructor, deleteAssignment);

// ── Student: submit answer ────────────────────────────────────
router.post('/:id/submit', submitAssignment);

// ── Instructor: manually grade a submission ───────────────────
router.put('/:id/grade/:submissionId', isInstructor, gradeSubmission);

module.exports = router;
