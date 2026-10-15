// backend/src/models/Discussion.js
const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      trim: true,
      maxlength: 2000,
    },
    isInstructorReply: {
      type: Boolean,
      default: false,
    },
    isAiAnswer: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Discussion topic title is required'],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, 'Discussion description is required'],
      trim: true,
      maxlength: 5000,
    },
    tags: [String],
    isResolved: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [replySchema],
  },
  {
    timestamps: true,
  },
);

discussionSchema.index({ course: 1, createdAt: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);
