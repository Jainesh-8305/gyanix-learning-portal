const crypto = require('crypto');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const { fail, owned, completed } = require('../utils/http');
async function access(quiz, user, studentOnly = false) {
  const course = await Course.findById(quiz.course);
  if (!course) throw fail(404, 'Course not found');
  if (!studentOnly && owned(course, user)) return { course };
  if (user.role !== 'student' || course.status !== 'published')
    throw fail(403, 'Published enrolled course required');
  const enrollment = await Enrollment.findOne({
    student: user._id,
    course: course._id,
  });
  if (!enrollment) throw fail(403, 'Enrollment required');
  if (quiz.isCertification && !completed(course, enrollment))
    throw fail(403, 'Complete all video lessons before assessment');
  if (quiz.dueDate && quiz.dueDate < new Date())
    throw fail(403, 'Assessment deadline has passed');
  return { course, enrollment };
}
async function start(quiz, user) {
  await access(quiz, user, true);
  await QuizAttempt.updateMany(
    {
      student: user._id,
      quiz: quiz._id,
      status: 'active',
      expiresAt: { $lte: new Date() },
    },
    { $set: { status: 'expired' } },
  );
  let attempt = await QuizAttempt.findOne({
    student: user._id,
    quiz: quiz._id,
    status: 'active',
  });
  if (!attempt) {
    if (
      (await QuizAttempt.countDocuments({
        student: user._id,
        quiz: quiz._id,
      })) >= quiz.maxAttempts
    )
      throw fail(403, 'Maximum attempts reached');
    try {
      attempt = await QuizAttempt.create({
        student: user._id,
        quiz: quiz._id,
        course: quiz.course,
        expiresAt: new Date(Date.now() + quiz.timeLimit * 60000),
      });
    } catch (e) {
      if (e.code !== 11000) throw e;
      attempt = await QuizAttempt.findOne({
        student: user._id,
        quiz: quiz._id,
        status: 'active',
      });
    }
  }
  const data = quiz.toObject();
  data.questions = data.questions.map((q) => {
    const { correctAnswer, explanation, ...safe } = q;
    void correctAnswer;
    void explanation;
    return safe;
  });
  return {
    ...data,
    attemptId: attempt._id,
    expiresAt: attempt.expiresAt,
    courseId: quiz.course,
    courseTitle: quiz.title,
  };
}
async function submit(quiz, user, body) {
  const { course, enrollment } = await access(quiz, user, true);
  if (
    body.questions ||
    !body.attemptId ||
    !body.answers ||
    typeof body.answers !== 'object' ||
    Array.isArray(body.answers)
  )
    throw fail(400, 'Submit an attemptId and answers only');
  const now = new Date();
  const attempt = await QuizAttempt.findOneAndUpdate(
    {
      _id: body.attemptId,
      student: user._id,
      quiz: quiz._id,
      status: 'active',
      expiresAt: { $gt: now },
    },
    { $set: { status: 'processing' } },
    { new: true },
  );
  if (!attempt)
    throw fail(403, 'Attempt expired, already submitted or not owned by you');
  try {
    let earned = 0,
      possible = 0;
    const results = quiz.questions.map((q, index) => {
      const value = body.answers[String(q._id)] ?? body.answers[index] ?? '';
      if (typeof value !== 'string' || value.length > 10000)
        throw fail(400, 'Answers must be text');
      const correct =
        ['multiple-choice', 'true-false'].includes(q.type) &&
        value.trim().toLowerCase() ===
          String(q.correctAnswer).trim().toLowerCase();
      possible += q.points || 1;
      if (correct) earned += q.points || 1;
      return {
        questionId: q._id,
        question: q.question,
        studentAnswer: value,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect: correct,
        pointsEarned: correct ? q.points || 1 : 0,
        pointsPossible: q.points || 1,
      };
    });
    const percentage = possible ? Math.round((earned / possible) * 100) : 0;
    let certificateId = null;
    if (quiz.isCertification && percentage >= quiz.passingScore) {
      const certCode = crypto.randomBytes(16).toString('hex').toUpperCase();
      const instructor = await User.findById(course.instructor);
      const cert = await Certificate.findOneAndUpdate(
        { student: user._id, course: course._id },
        {
          $setOnInsert: {
            student: user._id,
            course: course._id,
            enrollment: enrollment._id,
            assessmentAttempt: attempt._id,
            certificateId: certCode,
            studentName: user.name,
            courseTitle: course.title,
            instructorName: instructor?.name || 'Course instructor',
            completedAt: now,
            pdfUrl: `${process.env.API_PUBLIC_URL || 'http://localhost:5000'}/api/users/certificates/${certCode}/pdf`,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
      certificateId = cert._id;
      enrollment.isCompleted = true;
      enrollment.completedAt = now;
      enrollment.certificate = cert._id;
      await enrollment.save();
      await User.updateOne(
        { _id: user._id },
        { $addToSet: { certificates: cert._id, completedCourses: course._id } },
      );
    }
    const result = {
      quizId: quiz._id,
      quizTitle: quiz.title,
      score: earned,
      possible,
      total: quiz.questions.length,
      percentage,
      passed: percentage >= quiz.passingScore,
      passingScore: quiz.passingScore,
      certificateId,
      results,
    };
    attempt.status = 'submitted';
    attempt.percentage = percentage;
    attempt.result = result;
    await attempt.save();
    return result;
  } catch (error) {
    attempt.status = 'active';
    await attempt.save();
    throw error;
  }
}
module.exports = { access, start, submit };
