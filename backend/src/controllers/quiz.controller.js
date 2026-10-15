const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const assessment = require('../services/assessment.service');
const { fail, owned } = require('../utils/http');
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
const owner = async (id, user) => {
  const c = await Course.findById(id);
  if (!c) throw fail(404, 'Course not found');
  if (!owned(c, user)) throw fail(403, 'Course owner required');
  return c;
};
const createQuiz = wrap(async (req, res) => {
  const c = await owner(req.body.courseId, req.user);
  const { title, questions, timeLimit, passingScore, maxAttempts } = req.body;
  if (!Array.isArray(questions) || !questions.length || questions.length > 30)
    throw fail(400, 'Provide 1-30 questions');
  const data = await Quiz.create({
    title,
    course: c._id,
    instructor: c.instructor,
    questions,
    timeLimit,
    passingScore,
    maxAttempts,
  });
  res.status(201).json({ success: true, data });
});
const getQuizzesByCourse = wrap(async (req, res) => {
  const c = await Course.findById(req.params.courseId);
  if (!c) throw fail(404, 'Course not found');
  if (
    !owned(c, req.user) &&
    !(
      req.user.role === 'student' &&
      (await Enrollment.exists({ student: req.user._id, course: c._id }))
    )
  )
    throw fail(403, 'Enrollment or course ownership required');
  const data = await Quiz.find({
    course: c._id,
    isCertification: false,
  }).select('-questions');
  res.json({ success: true, data });
});
const getQuiz = wrap(async (req, res) => {
  const q = await Quiz.findById(req.params.id);
  if (!q) throw fail(404, 'Quiz not found');
  const { course } = await assessment.access(q, req.user);
  const data = owned(course, req.user)
    ? q
    : await assessment.start(q, req.user);
  res.json({ success: true, data });
});
const updateQuiz = wrap(async (req, res) => {
  const q = await Quiz.findById(req.params.id);
  if (!q) throw fail(404, 'Quiz not found');
  await owner(q.course, req.user);
  if (await require('../models/QuizAttempt').exists({ quiz: q._id }))
    throw fail(409, 'Cannot change a quiz after attempts have started');
  for (const k of [
    'title',
    'questions',
    'timeLimit',
    'passingScore',
    'maxAttempts',
  ])
    if (req.body[k] !== undefined) q[k] = req.body[k];
  await q.save();
  res.json({ success: true, data: q });
});
const deleteQuiz = wrap(async (req, res) => {
  const q = await Quiz.findById(req.params.id);
  if (!q) throw fail(404, 'Quiz not found');
  await owner(q.course, req.user);
  if (await require('../models/QuizAttempt').exists({ quiz: q._id }))
    throw fail(409, 'Cannot delete a quiz with attempt records');
  await q.deleteOne();
  res.json({ success: true });
});
const submitQuiz = wrap(async (req, res) => {
  const q = await Quiz.findById(req.params.id);
  if (!q) throw fail(404, 'Quiz not found');
  res.json({
    success: true,
    data: await assessment.submit(q, req.user, req.body),
  });
});
module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
};
