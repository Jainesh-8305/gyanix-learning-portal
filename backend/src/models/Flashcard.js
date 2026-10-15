const mongoose = require('mongoose');
module.exports = mongoose.model(
  'Flashcard',
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },
      front: { type: String, required: true, maxlength: 2000 },
      back: { type: String, required: true, maxlength: 10000 },
      subject: { type: String, default: 'General' },
      repetitions: { type: Number, default: 0 },
      ease: { type: Number, default: 2.5 },
      interval: { type: Number, default: 0 },
      dueAt: { type: Date, default: Date.now },
      reviewedAt: Date,
    },
    { timestamps: true },
  ),
);
