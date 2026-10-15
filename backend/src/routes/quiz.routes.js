// backend/src/routes/quiz.routes.js
const express = require('express');
const router = express.Router();
router.param('id', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);
router.param('courseId', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);

const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/roles');
const {
  createQuiz,
  getQuizzesByCourse,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
} = require('../controllers/quiz.controller');

// All routes require authentication
router.use(protect);

// ── Instructor: create a quiz ────────────────────────────────
router.post('/', isInstructor, createQuiz);

// ── Get all quizzes for a course ─────────────────────────────
router.get('/course/:courseId', getQuizzesByCourse);

// ── CRUD on individual quiz ───────────────────────────────────
router.get('/:id', getQuiz);
router.put('/:id', isInstructor, updateQuiz);
router.delete('/:id', isInstructor, deleteQuiz);

// ── Student: submit a quiz attempt ───────────────────────────
router.post('/:id/submit', submitQuiz);

module.exports = router;
