const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const rateLimit = require('express-rate-limit');
const { protect } = require('../middleware/auth');
const { isInstructor } = require('../middleware/roles');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Quiz = require('../models/Quiz');
const Attempt = require('../models/QuizAttempt');
const Memory = require('../models/AiInteractionMemory');
const Note = require('../models/StudyNote');
const Flashcard = require('../models/Flashcard');
const service = require('../services/ai.service');
const status = require('../services/ai-status');
const assessment = require('../services/assessment.service');
const { fail, owned, completed, objectIds } = require('../utils/http');
const router = express.Router();
router.use(protect, status.middleware);
router.use(
  rateLimit({
    windowMs: 60000,
    max: 60,
    keyGenerator: (req) => String(req.user._id),
  }),
);
router.param('courseId', (req, res, next) => objectIds(req, res, next));
router.param('id', (req, res, next) => objectIds(req, res, next));
const wrap = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (e) {
    next(e);
  }
};
const text = (value, max = 12000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max)
    throw fail(400, `Text must contain 1-${max} characters`);
  return value.trim();
};
const send = (res, data) =>
  res.json({ success: true, data: { ...data, ...status.metadata() } });
router.post(
  '/generate-quiz',
  wrap(async (req, res) => {
    const topic = text(req.body.topic, 500),
      count = Number(req.body.count ?? 5);
    if (![3, 5, 10].includes(count))
      throw fail(400, 'Question count must be 3, 5 or 10');
    const result = await service.generateQuizQuestions({
      topic,
      count,
      difficulty: req.body.difficulty,
      content:
        typeof req.body.content === 'string'
          ? req.body.content.slice(0, 12000)
          : '',
    });
    result.questions = result.questions.map((q) => ({
      ...q,
      type: 'multiple-choice',
      difficulty: ['easy', 'medium', 'hard'].includes(req.body.difficulty)
        ? req.body.difficulty
        : 'medium',
    }));
    send(res, result);
  }),
);
router.get(
  '/course-quiz/:courseId',
  wrap(async (req, res) => {
    const c = await Course.findById(req.params.courseId);
    if (!c || c.status !== 'published') throw fail(404, 'Course not available');
    const e = await Enrollment.findOne({
      student: req.user._id,
      course: c._id,
    });
    if (req.user.role !== 'student' || !e || !completed(c, e))
      throw fail(403, 'Complete all enrolled video lectures before assessment');
    let q = await Quiz.findOne({ course: c._id, isCertification: true });
    if (!q) {
      const generated = await service.generateQuizQuestions({
        topic: c.title,
        count: 10,
        difficulty: c.level,
        sections: c.sections,
        content: c.description,
      });
      q = await Quiz.findOneAndUpdate(
        { course: c._id, isCertification: true },
        {
          $setOnInsert: {
            course: c._id,
            instructor: c.instructor,
            isCertification: true,
            generationMode: status.metadata().mode,
            title: c.title,
            timeLimit: 15,
            maxAttempts: 3,
            questions: generated.questions.map((x) => ({
              ...x,
              type: 'multiple-choice',
              difficulty: 'medium',
            })),
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
    }
    send(res, await assessment.start(q, req.user));
  }),
);
router.post(
  '/course-quiz/:courseId/submit',
  wrap(async (req, res) => {
    const q = await Quiz.findOne({
      course: req.params.courseId,
      isCertification: true,
    });
    if (!q) throw fail(400, 'Start an assessment first');
    send(res, await assessment.submit(q, req.user, req.body));
  }),
);
router.get(
  '/recommendations',
  wrap(async (req, res) => {
    const ids = (await Enrollment.find({ student: req.user._id })).map(
      (e) => e.course,
    );
    const courses = await Course.find({
      status: 'published',
      _id: { $nin: ids },
    })
      .select('title category level thumbnail')
      .populate('instructor', 'name')
      .limit(4);
    send(res, {
      recommendations: courses.map((course, i) => ({
        course,
        courseId: course._id,
        priority: i + 1,
        reason: 'Available course you have not enrolled in',
      })),
      learningPathSummary:
        'Catalog suggestions based on enrollment availability; no AI profiling.',
    });
  }),
);
router.post(
  '/grade-answer',
  isInstructor,
  wrap(async (req, res) => {
    const { question, studentAnswer, rubric, maxPoints = 100 } = req.body;
    text(question);
    text(studentAnswer, 20000);
    if (!Number.isFinite(maxPoints) || maxPoints <= 0 || maxPoints > 1000)
      throw fail(400, 'Invalid maximum points');
    const result = await service.gradeAnswer({
      question,
      studentAnswer,
      rubric,
      maxPoints,
    });
    if (
      !Number.isFinite(result.score) ||
      result.score < 0 ||
      result.score > maxPoints
    )
      throw fail(502, 'AI returned an invalid score');
    send(res, result);
  }),
);
router.post(
  '/grade-rubric',
  isInstructor,
  wrap(async (req, res) => {
    text(req.body.question);
    text(req.body.studentAnswer, 20000);
    const max = Number(req.body.maxPoints || 100);
    if (!Number.isFinite(max) || max < 1 || max > 1000)
      throw fail(400, 'Invalid maximum points');
    const result = await service.gradeAnswer({
      question: req.body.question,
      studentAnswer: req.body.studentAnswer,
      rubric: `${req.body.rubric || ''} Reference: ${req.body.answerKey || ''}`,
      maxPoints: max,
    });
    if (
      !Number.isFinite(result.score) ||
      result.score < 0 ||
      result.score > max
    )
      throw fail(502, 'AI returned an invalid grade');
    send(res, result);
  }),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5, fields: 10 },
  fileFilter: (req, file, cb) =>
    cb(
      file.mimetype === 'application/pdf'
        ? null
        : fail(400, 'Only PDF documents are supported'),
      file.mimetype === 'application/pdf',
    ),
});
router.post(
  '/summarize-notes',
  upload.array('files', 5),
  wrap(async (req, res) => {
    let content = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (req.body.videoUrl && !content && !(req.files || []).length)
      throw fail(
        400,
        'Video transcription is not available. Paste the lecture transcript or upload text-based PDF notes.',
      );
    if (
      (req.files || []).reduce((total, file) => total + file.size, 0) >
      20 * 1024 * 1024
    )
      throw fail(400, 'PDF uploads must total no more than 20 MB');
    const sources = [];
    for (const file of req.files || []) {
      const parser = new PDFParse({ data: new Uint8Array(file.buffer) });
      let extracted;
      try {
        extracted = (await parser.getText()).text?.trim();
      } catch {
        throw fail(
          400,
          `Unreadable PDF: ${file.originalname}. Upload a text-based PDF or paste text.`,
        );
      } finally {
        await parser.destroy();
      }
      if (!extracted || extracted.length < 10)
        throw fail(
          400,
          'This PDF has no readable text. OCR scanned documents before uploading.',
        );
      sources.push(file.originalname);
      content += `\nSource: ${file.originalname}\n${extracted}`;
    }
    text(content, 100000);
    const result = await service.generateOneShotNotes({
      text: content.slice(0, 12000),
      title: req.body.title || sources.join(' & ') || 'Study notes',
      style: req.body.style || 'one-shot',
      language: req.body.language || 'English',
    });
    send(res, { ...result, sources });
  }),
);
// Compatibility endpoint: never trust browser-supplied history, role or context.
router.post(
  '/assistant-chat',
  wrap(async (req, res) => {
    const data = await require('../services/chat.service').answer(req.user, {
      message: req.body.query,
      ...(req.body.threadId ? { threadId: req.body.threadId } : {}),
      ...(req.body.language ? { language: req.body.language } : {}),
    });
    res.json({ success: true, data });
  }),
);
router.post(
  '/learn-feedback',
  wrap(async (req, res) => {
    const query = text(req.body.query || 'Learning feedback', 4000),
      correction = text(
        req.body.studentNotesOrCorrection ||
          req.body.insight ||
          req.body.feedback ||
          'Feedback',
        4000,
      );
    const entry = await Memory.create({
      student: req.user._id,
      studentName: req.user.name,
      query,
      answer:
        typeof req.body.answer === 'string'
          ? req.body.answer.slice(0, 12000)
          : 'User feedback',
      studentNotesOrCorrection: correction,
      feedback: ['helpful', 'needs_improvement', 'neutral'].includes(
        req.body.feedback,
      )
        ? req.body.feedback
        : 'neutral',
      learnedConcepts: req.body.topic
        ? [{ topic: text(req.body.topic, 200), insight: correction }]
        : [],
    });
    res.json({
      success: true,
      message: 'Private feedback saved. This does not train a model.',
      data: {
        memoryId: entry._id,
        totalLearned: await Memory.countDocuments({ student: req.user._id }),
      },
    });
  }),
);
router.get(
  '/learned-insights',
  wrap(async (req, res) =>
    send(res, {
      totalLearned: await Memory.countDocuments({ student: req.user._id }),
      recentInsights: await Memory.find({ student: req.user._id })
        .sort('-createdAt')
        .limit(5)
        .select('query studentNotesOrCorrection createdAt'),
      activeModels: process.env.OPENAI_API_KEY
        ? ['OpenAI gpt-4o-mini (when requests succeed)']
        : [],
      status: 'Private saved feedback; no model training',
    }),
  ),
);
router.get(
  '/quiz-attempts',
  wrap(async (req, res) => {
    const attempts = await Attempt.find({
      student: req.user._id,
      status: 'submitted',
    })
      .populate('quiz', 'title')
      .sort('-updatedAt')
      .limit(50);
    send(res, {
      attempts: attempts.map((a) => ({
        _id: a._id,
        topic: a.quiz?.title || 'Archived quiz',
        score: a.percentage,
        totalPoints: 100,
        createdAt: a.updatedAt,
      })),
      frequentWeakTopics: [],
    });
  }),
);
// Account-owned notes sync across devices; no shared browser storage.
const noteData = (n) => ({ ...n.toObject(), id: String(n._id) });
router.get(
  '/notes',
  wrap(async (req, res) =>
    res.json({
      success: true,
      data: (await Note.find({ student: req.user._id }).sort('-createdAt')).map(
        noteData,
      ),
    }),
  ),
);
router.post(
  '/notes',
  wrap(async (req, res) => {
    const title = text(req.body.title, 200),
      content = text(req.body.content, 100000);
    const n = await Note.create({
      student: req.user._id,
      title,
      content,
      style: req.body.style,
      language: req.body.language,
      sourceType: req.body.sourceType,
      wordCount: content.split(/\s+/).length,
    });
    res.status(201).json({ success: true, data: noteData(n) });
  }),
);
router.delete(
  '/notes/:id',
  wrap(async (req, res) => {
    const n = await Note.findOneAndDelete({
      _id: req.params.id,
      student: req.user._id,
    });
    if (!n) throw fail(404, 'Note not found');
    res.json({ success: true });
  }),
);
router.get(
  '/flashcards/due-count',
  wrap(async (req, res) => {
    const q = { student: req.user._id },
      now = new Date(),
      today = new Date(now);
    today.setHours(0, 0, 0, 0);
    send(res, {
      dueCount: await Flashcard.countDocuments({ ...q, dueAt: { $lte: now } }),
      totalCards: await Flashcard.countDocuments(q),
      reviewedToday: await Flashcard.countDocuments({
        ...q,
        reviewedAt: { $gte: today },
      }),
      algorithm: 'SuperMemo-2',
    });
  }),
);
router.get(
  '/flashcards',
  wrap(async (req, res) =>
    res.json({
      success: true,
      data: await Flashcard.find({ student: req.user._id }).sort('dueAt'),
    }),
  ),
);
router.post(
  '/flashcards',
  wrap(async (req, res) => {
    const card = await Flashcard.create({
      student: req.user._id,
      front: text(req.body.front, 2000),
      back: text(req.body.back, 10000),
      subject: text(req.body.subject || 'General', 100),
    });
    res.status(201).json({ success: true, data: card });
  }),
);
router.post(
  '/flashcards/:id/review',
  wrap(async (req, res) => {
    const c = await Flashcard.findOne({
      _id: req.params.id,
      student: req.user._id,
    });
    if (!c) throw fail(404, 'Card not found');
    const quality = Number(req.body.quality);
    if (!Number.isInteger(quality) || quality < 0 || quality > 5)
      throw fail(400, 'Invalid review quality');
    Object.assign(c, require('../services/srs')(c, quality));
    await c.save();
    res.json({ success: true, data: c });
  }),
);
router.post(
  '/resource-hub/:courseId',
  isInstructor,
  wrap(async (req, res) => {
    const c = await Course.findById(req.params.courseId);
    if (!c) throw fail(404, 'Course not found');
    if (!owned(c, req.user)) throw fail(403, 'Course owner required');
    for (const key of [
      'recommendedBooks',
      'recommendedVideos',
      'officialDocs',
    ]) {
      if (!Array.isArray(req.body[key]) || req.body[key].length > 30)
        throw fail(400, 'Resource lists must have at most 30 items');
      for (const item of req.body[key]) {
        text(item.title, 200);
        const url = item.url || item.link;
        if (url) {
          let parsed;
          try {
            parsed = new URL(url);
          } catch {
            throw fail(400, 'Invalid resource URL');
          }
          if (!['https:', 'http:'].includes(parsed.protocol))
            throw fail(400, 'Resources require HTTP(S) URLs');
        }
      }
    }
    c.resourceHub = {
      recommendedBooks: req.body.recommendedBooks,
      recommendedVideos: req.body.recommendedVideos,
      officialDocs: req.body.officialDocs,
    };
    await c.save();
    res.json({ success: true, data: c.resourceHub });
  }),
);
module.exports = router;
