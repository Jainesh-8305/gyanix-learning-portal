const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { fail } = require("../utils/http");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const Attempt = require("../models/QuizAttempt");
const Certificate = require("../models/Certificate");
const Flashcard = require("../models/Flashcard");
router.use(protect);
router.get("/student", async (req, res, next) => {
  try {
    if (req.user.role !== "student")
      throw fail(403, "Student account required");
    const enrollments = await Enrollment.find({ student: req.user._id })
      .select(
        "course progressPercentage completedLessons isCompleted certificate lastAccessedAt createdAt",
      )
      .populate({
        path: "course",
        select:
          "title category level thumbnail totalLessons totalDuration status classroomCode instructor",
        populate: { path: "instructor", select: "name" },
      })
      .sort("-lastAccessedAt")
      .limit(100)
      .lean();
    const available = enrollments.filter((e) => e.course);
    const ids = available
      .filter((e) => e.course.status === "published")
      .map((e) => e.course._id);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [
      assignments,
      quizzes,
      attempts,
      certificates,
      cards,
      due,
      reviewed,
      assessmentCount,
      certificateCount,
    ] = await Promise.all([
      Assignment.find({ course: { $in: ids } })
        .select({
          title: 1,
          course: 1,
          dueDate: 1,
          maxScore: 1,
          submissions: { $elemMatch: { student: req.user._id } },
        })
        .populate("course", "title")
        .sort("-createdAt")
        .limit(100)
        .lean(),
      Quiz.find({ course: { $in: ids }, isCertification: false })
        .select("title course timeLimit maxAttempts dueDate generationMode")
        .populate("course", "title")
        .sort("-createdAt")
        .limit(100)
        .lean(),
      Attempt.find({ student: req.user._id, status: "submitted" })
        .select("quiz percentage updatedAt")
        .populate("quiz", "title")
        .sort("-updatedAt")
        .limit(30)
        .lean(),
      Certificate.find({
        student: req.user._id,
        assessmentAttempt: { $ne: null },
      })
        .select("certificateId courseTitle completedAt pdfUrl")
        .sort("-completedAt")
        .limit(100)
        .lean(),
      Flashcard.countDocuments({ student: req.user._id }),
      Flashcard.countDocuments({
        student: req.user._id,
        dueAt: { $lte: new Date() },
      }),
      Flashcard.countDocuments({
        student: req.user._id,
        reviewedAt: { $gte: today },
      }),
      Attempt.countDocuments({ student: req.user._id, status: "submitted" }),
      Certificate.countDocuments({
        student: req.user._id,
        assessmentAttempt: { $ne: null },
      }),
    ]);
    const completions = available.flatMap((e) => e.completedLessons || []);
    const days = new Set(
      completions
        .filter((l) => l.completedAt)
        .map((l) => new Date(l.completedAt).toISOString().slice(0, 10)),
    );
    let streak = 0;
    const day = new Date(today);
    if (!days.has(day.toISOString().slice(0, 10)))
      day.setUTCDate(day.getUTCDate() - 1);
    while (days.has(day.toISOString().slice(0, 10))) {
      streak++;
      day.setUTCDate(day.getUTCDate() - 1);
    }
    res.json({
      success: true,
      data: {
        enrollments: available,
        assignments: assignments.map((a) => ({
          ...a,
          submissions: (a.submissions || []).map((s) => ({
            student: s.student,
            score: s.score,
            submittedAt: s.submittedAt,
          })),
        })),
        quizzes,
        attempts,
        certificates,
        stats: {
          assessmentCount,
          certificateCount,
          enrolled: available.length,
          completed: available.filter((e) => e.isCompleted).length,
          lessonsCompleted: completions.length,
          totalLessons: available.reduce(
            (n, e) => n + (e.course.totalLessons || 0),
            0,
          ),
          lessonsToday: completions.filter(
            (l) => new Date(l.completedAt) >= today,
          ).length,
          streak,
          averageProgress: available.length
            ? Math.round(
                available.reduce((n, e) => n + e.progressPercentage, 0) /
                  available.length,
              )
            : 0,
          flashcards: cards,
          flashcardsDue: due,
          reviewedToday: reviewed,
        },
      },
    });
  } catch (e) {
    next(e);
  }
});
module.exports = router;
