// backend/src/models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },

    watchSessions: [
      {
        lessonId: mongoose.Schema.Types.ObjectId,
        lastHeartbeatAt: Date,
        verifiedSeconds: { type: Number, default: 0 },
      },
    ],
    // Progress tracking
    completedLessons: [
      {
        lessonId: mongoose.Schema.Types.ObjectId,
        completedAt: Date,
        watchTimeSeconds: Number,
      },
    ],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessedAt: Date,

    // Completion
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },

    // Rating (after completion)
    rating: { type: Number, min: 1, max: 5 },
    review: String,
    reviewedAt: Date,
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

enrollmentSchema.index({ student: 1, lastAccessedAt: -1 });
enrollmentSchema.index({ course: 1, createdAt: -1 });

// Do not serialize historical financial fields from older database records.
for (const option of ['toJSON', 'toObject'])
  enrollmentSchema.set(option, {
    transform: (document, value) => {
      delete value.paymentId;
      delete value.amountPaid;
      return value;
    },
  });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
