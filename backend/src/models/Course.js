// backend/src/models/Course.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  videoUrl: String, // Cloudinary URL
  videoDuration: Number, // in seconds
  order: { type: Number, required: true },
  resources: [
    {
      title: String,
      fileUrl: String,
      fileType: { type: String, enum: ['pdf', 'doc', 'zip', 'link'] },
    },
  ],
  isFree: { type: Boolean, default: false }, // Preview lessons
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 150,
    },
    description: { type: String, required: true, maxlength: 2000 },
    shortDescription: { type: String, maxlength: 300 },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'programming',
        'design',
        'business',
        'marketing',
        'data-science',
        'ai-ml',
        'mobile-dev',
        'devops',
        'cybersecurity',
        'other',
      ],
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    language: { type: String, default: 'English' },
    thumbnail: String,
    previewVideo: String,

    classroomCode: {
      type: String,
      unique: true,
      sparse: true,
      default: () => crypto.randomBytes(5).toString('hex').toUpperCase(),
    },
    resourceHub: {
      recommendedBooks: [
        { title: String, author: String, link: String, isbn: String },
      ],
      recommendedVideos: [{ title: String, url: String, platform: String }],
      officialDocs: [{ title: String, url: String, provider: String }],
    },
    // Content
    sections: [
      {
        title: { type: String, required: true },
        order: Number,
        lessons: [lessonSchema],
      },
    ],

    // Meta
    tags: [String],
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],

    // Status & Moderation
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'rejected', 'archived', 'hidden'],
      default: 'draft',
    },
    adminFeedback: String,
    publishedAt: Date,

    // Stats
    totalStudents: { type: Number, default: 0 },
    totalLessons: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // seconds
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    // AI metadata
    aiGeneratedSummary: String,
    difficultyScore: { type: Number, min: 1, max: 10 },
  },
  {
    timestamps: true,
  },
);

courseSchema.pre('validate', function () {
  this.totalLessons = this.sections.reduce((n, s) => n + s.lessons.length, 0);
  this.totalDuration = this.sections.reduce(
    (n, s) => n + s.lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0),
    0,
  );
});
// Full-text search index
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

courseSchema.index({ instructor: 1, status: 1, updatedAt: -1 });

// Do not serialize historical financial fields from older database records.
for (const option of ['toJSON', 'toObject'])
  courseSchema.set(option, {
    transform: (document, value) => {
      delete value.price;
      delete value.discountPrice;
      delete value.totalRevenue;
      return value;
    },
  });

module.exports = mongoose.model('Course', courseSchema);
