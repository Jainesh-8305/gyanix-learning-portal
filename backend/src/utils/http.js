const mongoose = require('mongoose');
const fail = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });
const owned = (course, user) =>
  user.role === 'admin' ||
  String(course.instructor?._id || course.instructor) === String(user._id);
const lessons = (course) =>
  (course.sections || []).flatMap((s) => s.lessons || []);
const completed = (course, enrollment) => {
  const ids = new Set(
    (enrollment?.completedLessons || [])
      .filter((l) => l.watchTimeSeconds > 0)
      .map((l) => String(l.lessonId)),
  );
  return (
    lessons(course).length > 0 &&
    lessons(course).every((l) => ids.has(String(l._id)))
  );
};
const literalSearch = (value) => {
  if (typeof value !== 'string' || value.length > 100)
    throw fail(400, 'Search must be text up to 100 characters');
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
const pagination = (query) => {
  const page = Number(query.page ?? 1),
    limit = Number(query.limit ?? 12);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw fail(
      400,
      'Page must be positive and limit must be between 1 and 100',
    );
  return { page, limit };
};
const objectIds = (req, res, next) => {
  if (
    Object.entries(req.params).some(
      ([key, value]) =>
        /(^id$|Id$)/.test(key) && !mongoose.isObjectIdOrHexString(value),
    )
  )
    return res
      .status(400)
      .json({ success: false, message: 'Invalid identifier' });
  next();
};
module.exports = {
  fail,
  owned,
  lessons,
  completed,
  pagination,
  literalSearch,
  objectIds,
};
