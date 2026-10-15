// Only this reviewed documentation corpus is globally indexed. Private records are
// fetched afresh with authenticated ownership predicates; they are never cached or embedded.
const corpus = require('../knowledge/portal.json');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Assignment = require('../models/Assignment');
const Note = require('../models/StudyNote');
const User = require('../models/User');
const provider = require('./chat-provider');
const { fail } = require('../utils/http');
const mongoose = require('mongoose');
const vectors = new Map();
const loading = new Map();
const roles = new Set(['student', 'instructor', 'admin']);
const documents = (user) => {
  if (!roles.has(user.role)) throw fail(403, 'Unsupported account role');
  return corpus.filter((doc) => doc.roles.includes(user.role));
};
const tokenize = (text) =>
  String(text)
    .normalize('NFKC')
    .toLowerCase()
    .match(/[\p{L}\p{M}\p{N}]+/gu) || [];
const concepts = [
  [/क्विज़|क्विज|ક્વિઝ|quiz/iu, 'quiz quizzes questions practice'],
  [
    /नामांकन|दाखिला|जुड़|कक्षा|भुगतान|पैसे|मुफ्त|નોંધણી|જોડા|વર્ગ|ચુકવણી|મફત|enrol|classroom|batch|payment/iu,
    'enrollment enroll classroom free',
  ],
  [
    /प्रमाणपत्र|परीक्षा|પ્રમાણપત્ર|પરીક્ષા|certificate|assessment/iu,
    'certificates certificate assessment exam',
  ],
  [
    /असाइनमेंट|जमा|अंक|અસાઇનમેન્ટ|જવાબ|ગુણ|assignment|grade|submit/iu,
    'assignments assignment submit grades',
  ],
  [
    /नोट्स|सारांश|पीडीएफ|નોંધો|સારાંશ|પીડીએફ|notes|pdf|summar/iu,
    'notes notes pdf transcript',
  ],
  [
    /फ्लैश|याद|कार्ड|ફ્લેશ|યાદ|કાર્ડ|flash|spaced|srs/iu,
    'flashcards flashcards srs review',
  ],
  [
    /वीडियो|पाठ|प्रगति|વિડિયો|પાઠ|પ્રગતિ|video|lesson|progress/iu,
    'learning lesson video progress',
  ],
  [
    /बनाए|प्रकाशित|शिक्षक|સમીક્ષા|પ્રકાશિત|શિક્ષક|instructor|publish|create course/iu,
    'instructor courses create review publish',
  ],
  [
    /एडमिन|उपयोगकर्ता|વ્યવસ્થાપક|એડમિન|ખાતાં|admin|governance|deactivate/iu,
    'admin users moderation governance',
  ],
  [
    /पासवर्ड|खाता|प्रवेश|પાસવર્ડ|ખાતું|પ્રવેશ|password|login|profile/iu,
    'profile password account',
  ],
];
function expanded(query) {
  return (
    query +
    ' ' +
    concepts
      .filter(([re]) => re.test(query))
      .map(([, words]) => words)
      .join(' ')
  );
}
function lexical(query, docs) {
  const terms = [...new Set(tokenize(expanded(query)))];
  const tokenLists = docs.map((d) =>
    tokenize(
      [
        d.title,
        d.id,
        d.keywords,
        d.text,
        ...Object.values(d.translations || {}),
      ].join(' '),
    ),
  );
  const avg =
    tokenLists.reduce((sum, t) => sum + t.length, 0) / Math.max(1, docs.length);
  return docs
    .map((doc, index) => {
      const tokens = tokenLists[index];
      let score = 0;
      for (const term of terms) {
        const tf = tokens.filter((t) => t === term).length;
        if (!tf) continue;
        const df = tokenLists.filter((list) => list.includes(term)).length;
        score +=
          (Math.log(1 + (docs.length - df + 0.5) / (df + 0.5)) * tf * 2.2) /
          (tf + 1.2 * (0.25 + (0.75 * tokens.length) / avg));
        if (tokenize(doc.title + ' ' + doc.id).includes(term)) score += 2;
      }
      return { doc, score };
    })
    .sort((a, b) => b.score - a.score);
}
const dot = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
async function semantic(user, query, docs, signal) {
  const key = user.role + ':' + provider.embeddingModel();
  if (!vectors.has(key)) {
    if (!loading.has(key))
      loading.set(
        key,
        provider
          .embed(
            docs.map((d) => `${d.title}\n${d.keywords}\n${d.text}`),
            signal,
          )
          .then((data) => {
            vectors.set(key, data);
            return data;
          })
          .finally(() => loading.delete(key)),
      );
    await loading.get(key);
  }
  const [queryVector] = await provider.embed([query], signal);
  return docs
    .map((doc, index) => ({
      doc,
      score: dot(vectors.get(key)[index], queryVector),
    }))
    .sort((a, b) => b.score - a.score);
}
function item(id, title, url, text) {
  return { id, title, url, text, private: true };
}
async function privateContext(user, courseId) {
  if (courseId && !mongoose.isObjectIdOrHexString(courseId))
    throw fail(400, 'Invalid course identifier');
  if (user.role === 'student') {
    const enrollments = await Enrollment.find({ student: user._id })
      .select('course progressPercentage isCompleted')
      .populate('course', 'title status')
      .limit(100)
      .lean();
    const courses = enrollments.filter((e) => e.course?.status === 'published');
    if (courseId && !courses.some((e) => String(e.course._id) === courseId))
      throw fail(403, 'Enrolled published course required for course chat');
    const ids = courses.map((e) => e.course._id);
    const [assignments, notes] = await Promise.all([
      Assignment.find({ course: { $in: ids } })
        .select({
          title: 1,
          course: 1,
          dueDate: 1,
          maxScore: 1,
          submissions: { $elemMatch: { student: user._id } },
        })
        .sort('-createdAt')
        .limit(20)
        .lean(),
      Note.find({ student: user._id })
        .select('title content')
        .sort('-updatedAt')
        .limit(12)
        .lean(),
    ]);
    return [
      item(
        'my-progress',
        'Your course progress',
        '/dashboard/student?tab=courses',
        JSON.stringify(
          courses.map((e) => ({
            title: e.course.title,
            courseId: String(e.course._id),
            progress: e.progressPercentage,
            completed: e.isCompleted,
          })),
        ),
      ),
      ...assignments.map((a) =>
        item(
          'my-assignment-' + a._id,
          a.title,
          '/dashboard/student?tab=assignments',
          'My assignment grade, score and feedback: ' +
            JSON.stringify({
              title: a.title,
              dueDate: a.dueDate,
              maxScore: a.maxScore,
              submission: a.submissions?.[0]
                ? {
                    score: a.submissions[0].score,
                    submittedAt: a.submissions[0].submittedAt,
                    feedback: a.submissions[0].feedback?.slice(0, 1000),
                  }
                : 'not submitted',
            }),
        ),
      ),
      ...notes.map((n) =>
        item(
          'my-note-' + n._id,
          n.title,
          '/dashboard/student/notes',
          n.content.slice(0, 1800),
        ),
      ),
    ];
  }
  if (user.role === 'instructor') {
    const courses = await Course.find({ instructor: user._id })
      .select('title status totalLessons totalStudents')
      .sort('-updatedAt')
      .limit(100)
      .lean();
    if (courseId && !courses.some((c) => String(c._id) === courseId))
      throw fail(403, 'Course ownership required for course chat');
    return [
      item(
        'my-teaching',
        'Your teaching courses',
        '/dashboard/instructor/courses',
        JSON.stringify(
          courses.map((c) => ({
            title: c.title,
            status: c.status,
            lessons: c.totalLessons,
            enrolled: c.totalStudents,
          })),
        ),
      ),
    ];
  }
  if (user.role === 'admin') {
    if (courseId && !(await Course.exists({ _id: courseId })))
      throw fail(404, 'Course not found');
    const [users, courses, enrollments, pending] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Enrollment.countDocuments(),
      Course.countDocuments({ status: 'pending' }),
    ]);
    return [
      item(
        'platform-overview',
        'Platform totals',
        '/dashboard/admin',
        JSON.stringify({ users, courses, enrollments, pending }),
      ),
    ];
  }
  throw fail(403, 'Unsupported account role');
}
async function retrieve(user, query, courseId, signal) {
  const allowed = documents(user);
  const owned = await privateContext(user, courseId);
  let ranked = lexical(query, [...allowed, ...owned]);
  let method = 'bm25';
  if (provider.configured() && process.env.CHAT_SEMANTIC_SEARCH !== 'false') {
    try {
      const similar = await semantic(user, query, allowed, signal);
      const scores = new Map();
      ranked.forEach((r, i) => {
        if (r.score > 0) scores.set(r.doc.id, 1 / (40 + i));
      });
      similar.forEach((r, i) => {
        if (r.score > 0.2)
          scores.set(r.doc.id, (scores.get(r.doc.id) || 0) + 1 / (40 + i));
      });
      ranked = ranked
        .map((r) => ({ ...r, score: scores.get(r.doc.id) || 0 }))
        .sort((a, b) => b.score - a.score);
      method = 'hybrid-bm25-embeddings';
    } catch {
      if (signal?.aborted)
        throw fail(
          499,
          'Request cancelled',
        ); /* Local retrieval remains available during provider outages. */
    }
  }
  const selected = ranked
    .filter((r) => r.score > 0)
    .slice(0, 5)
    .map((r) => r.doc);
  if (!selected.length)
    selected.push(allowed.find((d) => d.id === 'navigation'));
  // A bounded server-filtered summary supports follow-ups without caching another account's data.
  const summary = owned.find((d) =>
    ['my-progress', 'my-teaching', 'platform-overview'].includes(d.id),
  );
  if (
    summary &&
    !selected.some((d) => d.id === summary.id) &&
    /my|mine|मेरे|मेरी|मेरा|મારા|મારી|મારું|progress|grade|course|classroom|प्रगति|પ્રગતિ/iu.test(
      query,
    )
  )
    selected.push(summary);
  return { chunks: selected, method };
}
module.exports = { documents, privateContext, retrieve, lexical, tokenize };
