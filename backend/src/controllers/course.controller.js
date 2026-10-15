const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { fail, owned, pagination } = require('../utils/http');
const editable = [
  'title',
  'description',
  'shortDescription',
  'category',
  'level',
  'language',
  'thumbnail',
  'previewVideo',
  'sections',
  'tags',
  'requirements',
  'learningOutcomes',
  'targetAudience',
];
const fields = (body) => {
  if (
    ['price', 'discountPrice', 'paymentId', 'amountPaid'].some(
      (key) => key in body,
    )
  )
    throw fail(
      400,
      'Courses are free. Pricing and payment fields are not supported.',
    );
  return Object.fromEntries(
    editable.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]),
  );
};
const getCourses = async (req, res, next) => {
  try {
    const { page, limit } = pagination(req.query);
    if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined)
      throw fail(
        400,
        'Pricing filters are not supported; all courses are free.',
      );
    const { search, category, level, status, sort = '-createdAt' } = req.query;
    if (!['-createdAt', '-rating', '-totalStudents'].includes(sort))
      throw fail(400, 'Unsupported sort');
    const filter =
      req.user?.role === 'admin'
        ? status
          ? { status }
          : {}
        : { status: 'published' };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) {
      if (typeof search !== 'string' || search.length > 200)
        throw fail(400, 'Search is too long');
      filter.$text = { $search: search };
    }
    const total = await Course.countDocuments(filter);
    const data = await Course.find(filter)
      .populate('instructor', 'name avatar rating')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        '-sections -resourceHub -classroomCode -adminFeedback -price -discountPrice -totalRevenue',
      );
    res.json({
      success: true,
      data,
      pagination: { total, page, pages: Math.ceil(total / limit), limit },
    });
  } catch (e) {
    next(e);
  }
};
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'instructor',
      'name avatar bio rating',
    );
    if (
      !course ||
      (course.status !== 'published' && (!req.user || !owned(course, req.user)))
    )
      throw fail(404, 'Course not found');
    const enrollment = req.user
      ? await Enrollment.exists({ student: req.user._id, course: course._id })
      : null;
    const data = course.toObject();
    delete data.price;
    delete data.discountPrice;
    delete data.totalRevenue;
    const editor = req.user && owned(course, req.user);
    if (!enrollment && !editor) {
      data.sections = data.sections.map((s) => ({
        ...s,
        lessons: s.lessons.map((l) => ({
          ...l,
          hasVideo: Boolean(l.videoUrl),
          videoUrl: l.isFree ? l.videoUrl : null,
          resources: [],
        })),
      }));
      delete data.resourceHub;
      delete data.classroomCode;
    }
    if (!editor) delete data.adminFeedback;
    res.json({ success: true, data, isEnrolled: !!enrollment });
  } catch (e) {
    next(e);
  }
};
const createCourse = async (req, res, next) => {
  try {
    const data = await Course.create({
      ...fields(req.body),
      instructor: req.user._id,
      status: 'draft',
    });
    res.status(201).json({ success: true, data });
  } catch (e) {
    next(e);
  }
};
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) throw fail(404, 'Course not found');
    if (!owned(course, req.user)) throw fail(403, 'Not authorized');
    if (
      [
        'status',
        'adminFeedback',
        'instructor',
        'totalStudents',
        'totalRevenue',
        'rating',
        'publishedAt',
        'classroomCode',
      ].some((k) => k in req.body)
    )
      throw fail(400, 'Protected course fields cannot be updated here');
    Object.assign(course, fields(req.body));
    if (req.user.role !== 'admin' && course.status === 'published')
      course.status = 'draft';
    await course.save();
    res.json({ success: true, data: course });
  } catch (e) {
    next(e);
  }
};
const submitCourseForReview = async (req, res, next) => {
  try {
    const c = await Course.findById(req.params.id);
    if (!c) throw fail(404, 'Course not found');
    if (!owned(c, req.user)) throw fail(403, 'Not authorized');
    if (
      !c.sections.length ||
      c.sections.some(
        (s) => !s.lessons.length || s.lessons.some((l) => !l.videoUrl),
      )
    )
      throw fail(400, 'Add a video URL for every lesson before review');
    c.status = 'pending';
    await c.save();
    res.json({ success: true, data: c, message: 'Submitted for review' });
  } catch (e) {
    next(e);
  }
};
const deleteCourse = async (req, res, next) => {
  try {
    const c = await Course.findById(req.params.id);
    if (!c) throw fail(404, 'Course not found');
    if (!owned(c, req.user)) throw fail(403, 'Not authorized');
    c.status = 'archived';
    await c.save();
    res.json({
      success: true,
      message: 'Course archived; learning records retained',
    });
  } catch (e) {
    next(e);
  }
};
module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  submitCourseForReview,
  deleteCourse,
};
