process.env.NODE_ENV = 'production';
process.env.JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
process.env.FRONTEND_URL = 'http://localhost:3100';
process.env.EMAIL_HOST = '127.0.0.1';
process.env.EMAIL_PORT = '25259';
process.env.MONGODB_URI = `mongodb://127.0.0.1:27028/gyanix_regression_${process.pid}_${Date.now()}`;
process.env.OPENAI_API_KEY = '';
const { test, before, after } = require('node:test'),
  assert = require('node:assert/strict'),
  mongoose = require('mongoose');
let capturedToken;
const mail = require('../src/services/email.service');
mail.sendPasswordReset = async (_email, token) => {
  capturedToken = token;
};
mail.sendWelcomeEmail = async () => {};
const app = require('../server'),
  User = require('../src/models/User'),
  Course = require('../src/models/Course'),
  Enrollment = require('../src/models/Enrollment'),
  Quiz = require('../src/models/Quiz'),
  Attempt = require('../src/models/QuizAttempt'),
  Certificate = require('../src/models/Certificate');
const password = require('crypto').randomBytes(24).toString('hex');
let server, base, s, o, i, i2, a, c, legacy, draft;
async function req(method, path, body, token, headers = {}) {
  const r = await fetch(base + path, {
    method,
    headers: {
      ...(!(body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...headers,
    },
    ...(body !== undefined
      ? {
          body:
            typeof body === 'string' || body instanceof FormData
              ? body
              : JSON.stringify(body),
        }
      : {}),
    signal: AbortSignal.timeout(15000),
  });
  const raw = await r.text();
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { status: r.status, data, headers: r.headers };
}
async function account(role, name) {
  const r = await req('POST', '/auth/register', {
    name,
    email: name + '@example.test',
    password,
    role,
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  return r.data;
}
before(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([
    User.init(),
    Course.init(),
    Enrollment.init(),
    Quiz.init(),
    Attempt.init(),
    Certificate.init(),
  ]);
  server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
  s = await account('student', 'student');
  o = await account('student', 'other');
  i = await account('instructor', 'instructor');
  i2 = await account('instructor', 'outsider');
  await User.create({
    name: 'Admin',
    email: 'admin@example.test',
    password,
    role: 'admin',
  });
  a = (
    await req('POST', '/auth/login', { email: 'admin@example.test', password })
  ).data;
  const payload = {
    title: 'React foundations',
    description: 'Regression curriculum',
    category: 'programming',
    sections: [
      {
        title: 'Module',
        lessons: [
          {
            title: 'Lesson',
            order: 1,
            videoDuration: 1,
            videoUrl: 'https://example.test/video.mp4',
            isFree: false,
          },
        ],
      },
    ],
  };
  c = (await req('POST', '/courses', payload, i.token)).data.data;
  draft = (
    await req('POST', '/courses', { ...payload, title: 'Draft' }, i.token)
  ).data.data;
  legacy = (
    await req(
      'POST',
      '/courses',
      { ...payload, title: 'Legacy curriculum' },
      i.token,
    )
  ).data.data;
  await Course.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(legacy._id) },
    { $set: { price: 49, discountPrice: 29, totalRevenue: 100 } },
  );
});
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test('portal regression', async (t) => {
  const check = (name, fn) => t.test(name, fn);
  const status = (name, method, path, body, token, code) =>
    check(name, async () => {
      const r = await req(method, path, body, token);
      assert.equal(r.status, code, JSON.stringify(r.data));
    });
  await status(
    'Anonymous profile denied',
    'GET',
    '/users/me',
    undefined,
    null,
    401,
  );
  await status(
    'Invalid token denied',
    'GET',
    '/users/me',
    undefined,
    'bad',
    401,
  );
  await status(
    'Student admin denied',
    'GET',
    '/admin/dashboard',
    undefined,
    s.token,
    403,
  );
  await check('No public admin registration', async () =>
    assert.equal((await account('admin', 'selfadmin')).user.role, 'student'),
  );
  await status(
    'Weak password rejected',
    'POST',
    '/auth/register',
    { name: 'Bad', email: 'bad@example.test', password: 'weak' },
    null,
    400,
  );
  await check('Reset response generic and token private', async () => {
    const known = await req('POST', '/auth/forgot-password', {
        email: 'student@example.test',
      }),
      unknown = await req('POST', '/auth/forgot-password', {
        email: 'absent@example.test',
      });
    assert.deepEqual(known.data, unknown.data);
    assert.equal(known.data.resetUrl, undefined);
    assert.ok(capturedToken);
  });
  await check(
    'Email reset consumes token and revokes existing sessions',
    async () => {
      assert.equal(
        (
          await req('POST', '/auth/reset-password', {
            token: capturedToken,
            password,
          })
        ).status,
        200,
      );
      assert.equal(
        (await req('GET', '/users/me', undefined, s.token)).status,
        401,
      );
      assert.equal(
        (
          await req('POST', '/auth/reset-password', {
            token: capturedToken,
            password,
          })
        ).status,
        400,
      );
      s = (
        await req('POST', '/auth/login', {
          email: 'student@example.test',
          password,
        })
      ).data;
    },
  );
  await status('Seed endpoint removed', 'GET', '/seed', undefined, null, 404);
  await status(
    'Payment bypass removed',
    'POST',
    '/payments/simulate-enroll',
    { courseId: legacy._id },
    s.token,
    404,
  );
  await status(
    'Draft hidden',
    'GET',
    '/courses/' + draft._id,
    undefined,
    null,
    404,
  );
  await status(
    'Draft enrollment blocked',
    'POST',
    '/enrollments/' + draft._id,
    {},
    s.token,
    404,
  );
  await check('Owner retains private URLs and totals', async () => {
    const r = await req('GET', '/courses/' + c._id, undefined, i.token);
    assert.equal(
      r.data.data.sections[0].lessons[0].videoUrl,
      'https://example.test/video.mp4',
    );
    assert.equal(r.data.data.totalLessons, 1);
  });
  await status(
    'Other owner edit blocked',
    'PUT',
    '/courses/' + c._id,
    { title: 'Bad' },
    i2.token,
    403,
  );
  await status(
    'Moderation mass assignment blocked',
    'PUT',
    '/courses/' + c._id,
    { status: 'published', adminFeedback: 'forged' },
    i.token,
    400,
  );
  await status(
    'Self publishing blocked',
    'POST',
    '/courses/' + c._id + '/toggle-publish',
    {},
    i.token,
    403,
  );
  await status(
    'Review submission',
    'POST',
    '/courses/' + c._id + '/submit',
    {},
    i.token,
    200,
  );
  for (const course of [c, legacy])
    await status(
      'Admin approval ' + course.title,
      'PUT',
      '/admin/courses/' + course._id + '/approve',
      {},
      a.token,
      200,
    );
  await check('Public private URL and batch code redacted', async () => {
    const r = await req('GET', '/courses/' + c._id);
    assert.equal(r.data.data.sections[0].lessons[0].videoUrl, null);
    assert.equal(r.data.data.classroomCode, undefined);
  });
  for (const q of [
    'page=-1',
    'limit=0',
    'limit=101',
    'limit=abc',
    'sort=invalid',
    'minPrice=-1',
  ])
    await status(
      'Invalid catalog ' + q,
      'GET',
      '/courses?' + q,
      undefined,
      null,
      400,
    );
  await status(
    'Invalid ID returns safe 400',
    'GET',
    '/courses/not-an-id',
    undefined,
    null,
    400,
  );
  await check('Unknown origin has no CORS access', async () =>
    assert.equal(
      (
        await req('GET', '/courses', undefined, null, {
          Origin: 'https://evil.example.test',
        })
      ).headers.get('access-control-allow-origin'),
      null,
    ),
  );
  await status(
    'Free enrollment works',
    'POST',
    '/enrollments/' + c._id,
    {},
    s.token,
    201,
  );
  await status(
    'Duplicate enrollment blocked',
    'POST',
    '/enrollments/' + c._id,
    {},
    s.token,
    400,
  );
  await status(
    'Legacy priced course now enrolls for free',
    'POST',
    '/enrollments/' + legacy._id,
    {},
    s.token,
    201,
  );
  await status(
    'Legacy classroom code now enrolls for free',
    'POST',
    '/courses/join-batch',
    { classroomCode: legacy.classroomCode },
    o.token,
    201,
  );
  await status(
    'Real free batch code works',
    'POST',
    '/courses/join-batch',
    { classroomCode: c.classroomCode },
    o.token,
    201,
  );
  const lid = c.sections[0].lessons[0]._id;
  await status(
    'Invalid lesson rejected',
    'PUT',
    '/enrollments/' + c._id + '/progress',
    {
      lessonId: new mongoose.Types.ObjectId().toString(),
      watchTimeSeconds: 1000,
    },
    s.token,
    400,
  );
  await status(
    'Faked watch time rejected',
    'PUT',
    '/enrollments/' + c._id + '/progress',
    { lessonId: lid, watchTimeSeconds: 1000 },
    s.token,
    400,
  );
  await status(
    'Assessment locked until genuine progress',
    'GET',
    '/ai/course-quiz/' + c._id,
    undefined,
    s.token,
    403,
  );
  await status(
    'Forged unearned certificate blocked',
    'POST',
    '/ai/course-quiz/' + legacy._id + '/submit',
    { questions: [{ correctAnswer: 'yes' }], answers: { 0: 'yes' } },
    s.token,
    400,
  );
  await check(
    'Server watch heartbeat validates completion without issuing certificate',
    async () => {
      await req(
        'POST',
        '/enrollments/' + c._id + '/watch',
        { lessonId: lid },
        s.token,
      );
      const e = await Enrollment.findOne({
        student: s.user._id,
        course: c._id,
      });
      e.watchSessions[0].lastHeartbeatAt = new Date(Date.now() - 2000);
      await e.save();
      await req(
        'POST',
        '/enrollments/' + c._id + '/watch',
        { lessonId: lid },
        s.token,
      );
      const r = await req(
        'PUT',
        '/enrollments/' + c._id + '/progress',
        { lessonId: lid, watchTimeSeconds: 2 },
        s.token,
      );
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert.equal(r.data.data.progressPercentage, 100);
      assert.equal(r.data.data.isCompleted, false);
    },
  );
  let started, cert;
  await check('Assessment stores attempt and strips key', async () => {
    const r = await req('GET', '/ai/course-quiz/' + c._id, undefined, s.token);
    assert.equal(r.status, 200, JSON.stringify(r.data));
    started = r.data.data;
    assert.ok(started.attemptId);
    assert.equal(started.questions.length, 10);
    assert.equal(started.questions[0].correctAnswer, undefined);
  });
  await status(
    'Supplied question key rejected',
    'POST',
    '/ai/course-quiz/' + c._id + '/submit',
    { attemptId: started?.attemptId, questions: [], answers: {} },
    s.token,
    400,
  );
  await check(
    'Server scores stored key and issues backed certificate',
    async () => {
      const q = await Quiz.findOne({ course: c._id, isCertification: true });
      const answers = Object.fromEntries(
        q.questions.map((x) => [String(x._id), x.correctAnswer]),
      );
      const r = await req(
        'POST',
        '/ai/course-quiz/' + c._id + '/submit',
        { attemptId: started.attemptId, answers },
        s.token,
      );
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert.equal(r.data.data.percentage, 100);
      cert = r.data.data.certificateId;
      assert.ok(cert);
    },
  );
  await status(
    'Submitted attempt cannot replay',
    'POST',
    '/ai/course-quiz/' + c._id + '/submit',
    { attemptId: started?.attemptId, answers: {} },
    s.token,
    403,
  );
  await check('Public certificate email private and PDF works', async () => {
    const r = await req('GET', '/users/certificates/' + cert);
    assert.equal(r.status, 200);
    assert.equal(r.data.data.student.email, undefined);
    const pdf = await req('GET', '/users/certificates/' + cert + '/pdf');
    assert.equal(pdf.status, 200);
    assert.ok(pdf.data.startsWith('%PDF'));
  });
  let quiz;
  await check('Create standard quiz', async () => {
    const r = await req(
      'POST',
      '/quizzes',
      {
        courseId: c._id,
        title: 'Test',
        maxAttempts: 1,
        questions: [
          { question: '2+2?', options: ['4', '5'], correctAnswer: '4' },
        ],
      },
      i.token,
    );
    assert.equal(r.status, 201);
    quiz = r.data.data;
  });
  await status(
    'Other teacher quiz read blocked',
    'GET',
    '/quizzes/' + quiz?._id,
    undefined,
    i2.token,
    403,
  );
  await status(
    'Other teacher quiz create blocked',
    'POST',
    '/quizzes',
    { courseId: c._id, title: 'Bad', questions: [] },
    i2.token,
    403,
  );
  await check(
    'Standard attempt scores, persists and enforces maxAttempts',
    async () => {
      const start = await req(
        'GET',
        '/quizzes/' + quiz._id,
        undefined,
        s.token,
      );
      const r = await req(
        'POST',
        '/quizzes/' + quiz._id + '/submit',
        {
          attemptId: start.data.data.attemptId,
          answers: { [quiz.questions[0]._id]: '4' },
        },
        s.token,
      );
      assert.equal(r.data.data.percentage, 100);
      assert.equal(
        (await req('GET', '/quizzes/' + quiz._id, undefined, s.token)).status,
        403,
      );
      assert.equal(
        await Attempt.countDocuments({ quiz: quiz._id, status: 'submitted' }),
        1,
      );
    },
  );
  await check('Expired attempt refused', async () => {
    const q = await Quiz.create({
      course: c._id,
      instructor: i.user._id,
      title: 'Timed',
      questions: quiz.questions,
    });
    const att = await Attempt.create({
      student: s.user._id,
      quiz: q._id,
      course: c._id,
      expiresAt: new Date(Date.now() - 1000),
    });
    assert.equal(
      (
        await req(
          'POST',
          '/quizzes/' + q._id + '/submit',
          { attemptId: att._id, answers: {} },
          s.token,
        )
      ).status,
      403,
    );
  });
  await status(
    'Instructor batch quiz dispatch',
    'POST',
    '/courses/' + c._id + '/batch-quiz',
    { topic: 'React' },
    i.token,
    201,
  );
  await status(
    'Student batch quizzes list',
    'GET',
    '/courses/batch-quizzes',
    undefined,
    s.token,
    200,
  );
  await check('Offline assignment draft explicitly labelled', async () => {
    const r = await req(
      'POST',
      '/assignments/ai-generate',
      { topic: 'React' },
      i.token,
    );
    assert.equal(r.status, 200);
    assert.equal(r.data.data.mode, 'offline');
  });
  let assignment, submission;
  await check('Assignment creation', async () => {
    const r = await req(
      'POST',
      '/assignments',
      {
        courseId: c._id,
        title: 'Assignment',
        description: 'Explain React',
        answerKey: 'private',
        maxScore: 100,
      },
      i.token,
    );
    assert.equal(r.status, 201);
    assignment = r.data.data;
  });
  await status(
    'Assignment other teacher read blocked',
    'GET',
    '/assignments/' + assignment?._id,
    undefined,
    i2.token,
    403,
  );
  await status(
    'Assignment other teacher create blocked',
    'POST',
    '/assignments',
    { courseId: c._id, title: 'Bad', description: 'Bad' },
    i2.token,
    403,
  );
  await check('Student private answer key redacted', async () =>
    assert.equal(
      (await req('GET', '/assignments/' + assignment._id, undefined, s.token))
        .data.data.answerKey,
      undefined,
    ),
  );
  await check('Assignment submission persists', async () => {
    const r = await req(
      'POST',
      '/assignments/' + assignment._id + '/submit',
      { content: 'A valid answer' },
      s.token,
    );
    assert.equal(r.status, 201, JSON.stringify(r.data));
    submission = r.data.data;
  });
  await status(
    'Duplicate submission denied',
    'POST',
    '/assignments/' + assignment?._id + '/submit',
    { content: 'again' },
    s.token,
    400,
  );
  for (const score of [-1, 101, '100', null])
    await status(
      'Invalid grade ' + score,
      'PUT',
      '/assignments/' + assignment?._id + '/grade/' + submission?._id,
      { score },
      i.token,
      400,
    );
  await status(
    'Valid grade saved',
    'PUT',
    '/assignments/' + assignment?._id + '/grade/' + submission?._id,
    { score: 80 },
    i.token,
    200,
  );
  await check('Assignment deadline enforced', async () => {
    const r = await req(
      'POST',
      '/assignments',
      {
        courseId: c._id,
        title: 'Past',
        description: 'Past',
        dueDate: '2020-01-01',
      },
      i.token,
    );
    assert.equal(
      (
        await req(
          'POST',
          '/assignments/' + r.data.data._id + '/submit',
          { content: 'Late' },
          s.token,
        )
      ).status,
      400,
    );
  });
  await status(
    'Instructor gradebook exists',
    'GET',
    '/assignments/instructor/my',
    undefined,
    i.token,
    200,
  );
  await status(
    'Unconfigured live grader fails clearly',
    'POST',
    '/ai/grade-rubric',
    { question: 'React?', studentAnswer: 'Components', maxPoints: 100 },
    i.token,
    503,
  );
  const resources = {
    recommendedBooks: [{ title: 'React docs', link: 'https://react.dev' }],
    recommendedVideos: [],
    officialDocs: [],
  };
  await status(
    'Resource hub other teacher denied',
    'POST',
    '/ai/resource-hub/' + c._id,
    resources,
    i2.token,
    403,
  );
  await status(
    'Resource hub saves',
    'POST',
    '/ai/resource-hub/' + c._id,
    resources,
    i.token,
    200,
  );
  let discussion;
  await check('Discussion membership and course association', async () => {
    const r = await req(
      'POST',
      '/courses/' + c._id + '/discussions',
      { title: 'Question', content: 'React?' },
      s.token,
    );
    assert.equal(r.status, 201);
    discussion = r.data.data;
    assert.equal(
      (
        await req(
          'PUT',
          '/courses/' + c._id + '/discussions/' + discussion._id + '/resolve',
          {},
          o.token,
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await req(
          'POST',
          '/courses/' +
            legacy._id +
            '/discussions/' +
            discussion._id +
            '/reply',
          { content: 'Bad' },
          o.token,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await req(
          'PUT',
          '/courses/' +
            legacy._id +
            '/discussions/' +
            discussion._id +
            '/upvote',
          {},
          i2.token,
        )
      ).status,
      403,
    );
  });
  for (const path of [
    '/ai/generate-quiz',
    '/ai/assistant-chat',
    '/ai/learn-feedback',
    '/ai/learned-insights',
  ])
    await status(
      'AI authentication ' + path,
      path.endsWith('insights') ? 'GET' : 'POST',
      path,
      undefined,
      null,
      401,
    );
  await check('Private feedback, real counts', async () => {
    await req(
      'POST',
      '/ai/learn-feedback',
      { query: 'Private', studentNotesOrCorrection: 'Private note' },
      s.token,
    );
    assert.equal(
      (await req('GET', '/ai/learned-insights', undefined, s.token)).data.data
        .totalLearned,
      1,
    );
    assert.equal(
      (await req('GET', '/ai/learned-insights', undefined, o.token)).data.data
        .totalLearned,
      0,
    );
  });
  for (const count of [3, 5, 10])
    await check('Exact offline quiz count ' + count, async () => {
      const r = await req(
        'POST',
        '/ai/generate-quiz',
        { topic: 'React', count },
        s.token,
      );
      assert.equal(r.status, 200, JSON.stringify(r.data));
      assert.equal(r.data.data.questions.length, count);
      assert.equal(r.data.data.mode, 'offline');
    });
  await check('Chat fallback labelled truthfully', async () => {
    const r = await req(
      'POST',
      '/ai/assistant-chat',
      { query: 'hello' },
      s.token,
    );
    assert.equal(r.data.data.mode, 'retrieval-only');
    assert.ok(!/Claude|Gemini/.test(r.data.data.modelEngine));
  });
  await status(
    'Video source requires transcript',
    'POST',
    '/ai/summarize-notes',
    { videoUrl: 'https://youtube.com/watch?v=abc' },
    s.token,
    400,
  );
  await check('Corrupt PDF rejected', async () => {
    const f = new FormData();
    f.append(
      'files',
      new Blob(['bad'], { type: 'application/pdf' }),
      'bad.pdf',
    );
    assert.equal(
      (await req('POST', '/ai/summarize-notes', f, s.token)).status,
      400,
    );
  });
  await check('Notes generation labelled offline', async () => {
    const r = await req(
      'POST',
      '/ai/summarize-notes',
      {
        text: 'Photosynthesis uses sunlight and carbon dioxide to make glucose.',
        title: 'Biology',
      },
      s.token,
    );
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.data.mode, 'offline');
  });
  await check('Private notes persisted and isolated', async () => {
    const r = await req(
      'POST',
      '/ai/notes',
      { title: 'Private', content: 'My note' },
      s.token,
    );
    assert.equal(r.status, 201);
    assert.equal(
      (await req('GET', '/ai/notes', undefined, o.token)).data.data.length,
      0,
    );
    assert.equal(
      (await req('DELETE', '/ai/notes/' + r.data.data.id, undefined, o.token))
        .status,
      404,
    );
    assert.equal(
      (await req('GET', '/ai/notes', undefined, s.token)).data.data.length,
      1,
    );
  });
  await check('Fresh account history and flashcards are zero', async () => {
    const fresh = await account('student', 'fresh');
    assert.equal(
      (await req('GET', '/ai/flashcards/due-count', undefined, fresh.token))
        .data.data.totalCards,
      0,
    );
    assert.equal(
      (await req('GET', '/ai/quiz-attempts', undefined, fresh.token)).data.data
        .attempts.length,
      0,
    );
  });
  await check('SM-2 reviews persist per student', async () => {
    const r = await req(
      'POST',
      '/ai/flashcards',
      { front: 'Q', back: 'A' },
      s.token,
    );
    assert.equal(r.status, 201);
    const id = r.data.data._id;
    assert.equal(
      (
        await req(
          'POST',
          '/ai/flashcards/' + id + '/review',
          { quality: 4 },
          o.token,
        )
      ).status,
      404,
    );
    const review = await req(
      'POST',
      '/ai/flashcards/' + id + '/review',
      { quality: 4 },
      s.token,
    );
    assert.equal(review.data.data.interval, 1);
    assert.equal(
      (await req('GET', '/ai/flashcards', undefined, s.token)).data.data[0]
        .repetitions,
      1,
    );
  });
  await check(
    'Pricing fields rejected and historical prices not exposed',
    async () => {
      const bad = await req(
        'POST',
        '/courses',
        {
          title: 'No pricing',
          description: 'Policy',
          category: 'programming',
          price: 99,
        },
        i.token,
      );
      assert.equal(bad.status, 400);
      const publicCourse = await req('GET', '/courses/' + legacy._id);
      for (const key of ['price', 'discountPrice', 'totalRevenue'])
        assert.equal(publicCourse.data.data[key], undefined);
      const mine = await req('GET', '/enrollments/my', undefined, s.token);
      for (const enrollment of mine.data.data) {
        assert.equal(enrollment.paymentId, undefined);
        assert.equal(enrollment.amountPaid, undefined);
        assert.equal(enrollment.course.price, undefined);
      }
    },
  );
  for (const path of [
    '/payments/create-intent',
    '/payments/webhook',
    '/payments/simulate-enroll',
  ])
    await status('Removed gateway ' + path, 'POST', path, {}, s.token, 404);
  await check('Archive retains referenced records', async () => {
    assert.equal(
      (await req('DELETE', '/courses/' + c._id, undefined, i.token)).status,
      200,
    );
    assert.equal((await Course.findById(c._id)).status, 'archived');
    assert.ok(
      (await req('GET', '/enrollments/my', undefined, s.token)).data.data.every(
        (e) => e.course,
      ),
    );
    assert.ok(await Quiz.exists({ _id: quiz._id }));
    assert.equal((await req('GET', '/courses/' + c._id)).status, 404);
  });
});
test('SM-2 schedule math and quality validation', () => {
  const schedule = require('../src/services/srs');
  let c = schedule({ repetitions: 0, ease: 2.5, interval: 0 }, 5);
  assert.equal(c.interval, 1);
  c = schedule(c, 5);
  assert.equal(c.interval, 6);
  c = schedule(c, 4);
  assert.ok(c.interval >= 15);
  c = schedule(c, 1);
  assert.equal(c.repetitions, 0);
  assert.equal(c.interval, 1);
  assert.ok(c.ease >= 1.3);
  assert.throws(() => schedule(c, 6));
});
