// backend/src/models/Assignment.js
const mongoose = require('mongoose');

/**
 * Submission sub-document — one per student attempt.
 */
const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true },       // Student's written answer
  fileUrl: String,                                   // Optional file upload URL (Cloudinary)
  submittedAt: { type: Date, default: Date.now },

  // Grading
  score: Number,
  maxScore: Number,
  feedback: String,
  strengths: [String],
  improvements: [String],
  aiGraded: { type: Boolean, default: false },      // true if graded by AI auto-grader
  gradedAt: Date,
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // instructor or null for AI
});

/**
 * Assignment — linked to a Course (and optionally a Lesson).
 * Supports manual instructor grading and AI-assisted grading via
 * the POST /api/ai/grade-answer endpoint.
 */
const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: 5000,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    // Optional: tie to a specific lesson so it surfaces in the learn page
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  maxScore: { type: Number, required: true, min: 1, default: 100 },
  dueDate: Date,
  rubric: String, // Grading criteria shown to students and used in AI grading prompt

  // Whether AI auto-grading is enabled for this assignment
  enableAiGrading: { type: Boolean, default: false },

  submissions: [submissionSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);
