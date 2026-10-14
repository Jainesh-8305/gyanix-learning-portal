// backend/src/models/Quiz.js
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'coding'],
    default: 'multiple-choice',
  },
  options: [String],               // For multiple-choice
  correctAnswer: String,
  explanation: String,             // Shown after answering
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  points: { type: Number, default: 1 },
  aiGenerated: { type: Boolean, default: false },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId },  // Optional: tied to lesson
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 },          // minutes; 0 = no limit
  passingScore: { type: Number, default: 70 },       // percentage
  maxAttempts: { type: Number, default: 3 },
  isAdaptive: { type: Boolean, default: false },     // AI adaptive mode
  isRandomized: { type: Boolean, default: true },    // Randomize questions
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', quizSchema);