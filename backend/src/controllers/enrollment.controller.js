const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const { fail, lessons } = require('../utils/http');
const enrollFree = async (req, res, next) => {
  try {
    const c = await Course.findOne({
      _id: req.params.courseId,
      status: 'published',
    });
    if (!c) throw fail(404, 'Course not available');
    if (req.user.role !== 'student')
      throw fail(403, 'Student account required');
    if (await Enrollment.exists({ student: req.user._id, course: c._id }))
      throw fail(400, 'Already enrolled');
    const data = await Enrollment.create({
      student: req.user._id,
      course: c._id,
    });
    await Promise.all([
      Course.updateOne({ _id: c._id }, { $inc: { totalStudents: 1 } }),
      User.updateOne(
        { _id: req.user._id },
        { $addToSet: { enrolledCourses: data._id } },
      ),
    ]);
    res.status(201).json({ success: true, data, course: c });
  } catch (e) {
    next(e);
  }
};
const getMyEnrollments = async (req, res, next) => {
  try {
    const data = await Enrollment.find({ student: req.user._id })
      .select('-paymentId -amountPaid -watchSessions')
      .populate({
        path: 'course',
        select:
          'title shortDescription category level thumbnail instructor totalLessons totalDuration status classroomCode resourceHub sections.title sections.lessons.title sections.lessons._id',
        populate: { path: 'instructor', select: 'name' },
      })
      .populate('certificate', 'pdfUrl certificateId')
      .sort('-lastAccessedAt');
    const safe = data
      .filter((e) => e.course)
      .map((e) => {
        const item = e.toObject();
        if (item.course.status !== 'published') { delete item.course.resourceHub; delete item.course.sections; }
        return item;
      });
    res.json({ success: true, data: safe });
  } catch (e) {
    next(e);
  }
};
const recordWatch = async (req, res, next) => {
  try {
    const e = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId,
    });
    const c = await Course.findOne({
      _id: req.params.courseId,
      status: 'published',
    });
    const lesson =
      c && lessons(c).find((l) => String(l._id) === req.body.lessonId);
    if (!e || !lesson) throw fail(404, 'Enrolled lesson not found');
    const now = new Date();
    const session = e.watchSessions.find(
      (s) => String(s.lessonId) === req.body.lessonId,
    );
    if (!session) {
      e.watchSessions.push({
        lessonId: lesson._id,
        lastHeartbeatAt: now,
        verifiedSeconds: 0,
      });
    } else {
      const elapsed = (now - session.lastHeartbeatAt) / 1000;
      if (elapsed > 0 && elapsed <= 25)
        session.verifiedSeconds += Math.min(elapsed, 12);
      session.lastHeartbeatAt = now;
    }
    await e.save();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
const updateProgress = async (req, res, next) => {
  try {
    const { lessonId, watchTimeSeconds } = req.body;
    if (
      typeof lessonId !== 'string' ||
      !Number.isFinite(watchTimeSeconds) ||
      watchTimeSeconds <= 0
    )
      throw fail(400, 'Valid lesson and positive watch time required');
    const c = await Course.findOne({
      _id: req.params.courseId,
      status: 'published',
    });
    const lesson = c && lessons(c).find((l) => String(l._id) === lessonId);
    if (!lesson)
      throw fail(400, 'Lesson does not belong to this published course');
    const e = await Enrollment.findOne({
      student: req.user._id,
      course: c._id,
    });
    if (!e) throw fail(404, 'Enrollment required');
    const watched =
      e.watchSessions.find((s) => String(s.lessonId) === lessonId)
        ?.verifiedSeconds || 0;
    const minimum = Math.max(1, Math.ceil((lesson.videoDuration || 60) * 0.8));
    if (watchTimeSeconds < minimum || watched < minimum)
      throw fail(400, 'Watch at least 80% of the lesson before completing it');
    if (!e.completedLessons.some((l) => String(l.lessonId) === lessonId))
      e.completedLessons.push({
        lessonId,
        watchTimeSeconds: Math.floor(watched),
        completedAt: new Date(),
      });
    const valid = new Set(lessons(c).map((l) => String(l._id)));
    e.completedLessons = e.completedLessons.filter((l) =>
      valid.has(String(l.lessonId)),
    );
    e.progressPercentage = Math.round(
      (new Set(e.completedLessons.map((l) => String(l.lessonId))).size /
        valid.size) *
        100,
    );
    e.lastAccessedAt = new Date();
    await e.save();
    res.json({ success: true, data: e });
  } catch (error) {
    next(error);
  }
};
module.exports = { enrollFree, getMyEnrollments, updateProgress, recordWatch };
