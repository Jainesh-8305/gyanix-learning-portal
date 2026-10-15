const mongoose = require('mongoose');
const source = new mongoose.Schema(
  { id: String, title: String, url: String },
  { _id: false },
);
const message = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true, maxlength: 10000 },
    sources: [source],
    mode: String,
    language: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);
const schema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ownerRole: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      required: true,
    },
    title: { type: String, maxlength: 100, default: 'New conversation' },
    messages: { type: [message], default: [] },
    busyUntil: { type: Date, default: () => new Date(0) },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 86400000),
    },
  },
  { timestamps: true },
);
schema.index({ owner: 1, ownerRole: 1, updatedAt: -1 });
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('ChatConversation', schema);
