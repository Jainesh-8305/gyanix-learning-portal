// backend/src/controllers/quiz.controller.js
//
// Quiz CRUD — Create, Read, Submit attempts.
// Quizzes are linked to a Course (and optionally a Lesson).
// Instructors create/manage quizzes; students submit attempts.

const Quiz = require('../models/Quiz');
const Enrollment = require('../models/Enrollment');

// ─── @POST /api/quizzes ───────────────────────────────────────
// Instructor creates a quiz for their course
const createQuiz = async (req, res, next) => {
  try {
    const { title, courseId, lessonId, questions, timeLimit, passingScore, maxAttempts, isAdaptive, isRandomized } = req.body;

    const quiz = await Quiz.create({
      title,
      course: courseId,
      lesson: lessonId || undefined,
      instructor: req.user._id,
      questions: questions || [],
      timeLimit: timeLimit ?? 30,
      passingScore: passingScore ?? 70,
      maxAttempts: maxAttempts ?? 3,
      isAdaptive: isAdaptive ?? false,
      isRandomized: isRandomized ?? true,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/quizzes/course/:courseId ───────────────────────
// Get all quizzes for a course (enrolled students and instructor)
const getQuizzesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify the requester is enrolled or is the instructor
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: courseId,
      });
      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled in this course to access its quizzes.',
        });
      }
    }

    // Exclude correct answers for students (prevent cheating)
    const projection = req.user.role === 'student'
      ? '-questions.correctAnswer -questions.explanation'
      : '';

    const quizzes = await Quiz.find({ course: courseId }).select(projection);
    res.json({ success: true, data: quizzes });
  } catch (error) {
    next(error);
  }
};

// ─── @GET /api/quizzes/:id ────────────────────────────────────
// Get a single quiz (strips answers for students)
const getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (req.user.role === 'student') {
      // Verify enrollment
      const enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: quiz.course,
      });
      if (!enrollment) {
        return res.status(403).json({ success: false, message: 'Enrollment required' });
      }

      // Strip correct answers and explanations before sending
      const quizObj = quiz.toObject();
      quizObj.questions = quizObj.questions.map(q => {
        const { correctAnswer, explanation, ...safe } = q;
        void correctAnswer; void explanation; // suppress linter unused warnings
        return safe;
      });
      return res.json({ success: true, data: quizObj });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

// ─── @PUT /api/quizzes/:id ────────────────────────────────────
// Instructor updates a quiz
const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// ─── @DELETE /api/quizzes/:id ─────────────────────────────────
const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (quiz.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
};

// ─── @POST /api/quizzes/:id/submit ───────────────────────────
// Student submits answers. Server scores multiple-choice; short-answer
// questions are marked for instructor review.
const submitQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'Enrollment required to submit quiz' });
    }

    const { answers } = req.body; // { [questionId]: "student answer string" }

    // Score the attempt
    let earned = 0;
    let possible = 0;
    const results = quiz.questions.map(q => {
      const studentAnswer = answers[q._id.toString()];
      possible += q.points || 1;

      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        const correct = studentAnswer?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
        if (correct) earned += q.points || 1;
        return {
          questionId: q._id,
          question: q.question,
          studentAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          isCorrect: correct,
          pointsEarned: correct ? (q.points || 1) : 0,
          pointsPossible: q.points || 1,
        };
      }

      // Short-answer / coding — mark for human/AI review
      return {
        questionId: q._id,
        question: q.question,
        studentAnswer,
        correctAnswer: null, // Don't expose for open-ended
        isCorrect: null,     // Pending grading
        pointsEarned: null,
        pointsPossible: q.points || 1,
        pendingReview: true,
      };
    });

    const percentage = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);

    res.json({
      success: true,
      data: {
        quizId: quiz._id,
        quizTitle: quiz.title,
        score: earned,
        possible,
        percentage,
        passed,
        passingScore: quiz.passingScore,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuiz, getQuizzesByCourse, getQuiz, updateQuiz, deleteQuiz, submitQuiz };
