// backend/src/models/AiInteractionMemory.js
const mongoose = require('mongoose');

const aiInteractionMemorySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    studentName: {
      type: String,
      default: 'Scholar',
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    intent: {
      type: String,
      enum: ['greeting', 'conceptual', 'code', 'exam_revision', 'coaching', 'correction', 'general'],
      default: 'general',
      index: true,
    },
    answer: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: 'tutor',
    },
    modelEngine: {
      type: String,
      default: 'Gyanix Frontier Neural Hybrid (Claude Sonnet + GPT-4o + Gemini)',
    },
    feedback: {
      type: String,
      enum: ['helpful', 'needs_improvement', 'neutral'],
      default: 'neutral',
    },
    studentNotesOrCorrection: {
      type: String,
      default: '',
    },
    learnedConcepts: [
      {
        topic: String,
        insight: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AiInteractionMemory', aiInteractionMemorySchema);
