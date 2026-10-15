const mongoose = require('mongoose');
const schema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'submitted', 'expired', 'processing'],
      default: 'active',
    },
    startedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    percentage: Number,
    result: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);
schema.index(
  { student: 1, quiz: 1 },
  { unique: true, partialFilterExpression: { status: 'active' } },
);
module.exports = mongoose.model('QuizAttempt', schema);
