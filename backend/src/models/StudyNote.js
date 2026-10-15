const mongoose = require('mongoose');
module.exports = mongoose.model(
  'StudyNote',
  new mongoose.Schema(
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
      },
      title: { type: String, required: true, maxlength: 200 },
      content: { type: String, required: true, maxlength: 100000 },
      style: String,
      language: String,
      sourceType: String,
      wordCount: Number,
    },
    { timestamps: true },
  ),
);
