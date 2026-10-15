// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500 },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Student-specific
    enrolledCourses: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
    ],
    completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    certificates: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    ],
    learningStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: Date.now },
    totalPoints: { type: Number, default: 0 },

    // Instructor-specific
    createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },

    // AI personalization
    learningPreferences: {
      topics: [String],
      difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
      },
      preferredFormat: { type: String, enum: ['video', 'text', 'mixed'] },
      linkedinUrl: String,
      githubUrl: String,
      portfolioUrl: String,
    },

    tokenVersion: { type: Number, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  },
);

// Hash password before saving (Mongoose async hook without next callback)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
