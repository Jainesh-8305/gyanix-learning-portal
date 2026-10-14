// backend/src/routes/assignment.routes.js
const express = require('express');
const router = express.Router();
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

// ── CRUD on individual assignment ────────────────────────────
router.get('/:id', getAssignment);
router.put('/:id', isInstructor, updateAssignment);
router.delete('/:id', isInstructor, deleteAssignment);

// ── Student: submit answer ────────────────────────────────────
router.post('/:id/submit', submitAssignment);

// ── Instructor: manually grade a submission ───────────────────
router.put('/:id/grade/:submissionId', isInstructor, gradeSubmission);

module.exports = router;