process.env.NODE_ENV = "production";
process.env.JWT_SECRET = require("crypto").randomBytes(32).toString("hex");
process.env.OPENAI_API_KEY = "";
process.env.CHAT_SEMANTIC_SEARCH = "false";
process.env.EMAIL_HOST = "127.0.0.1";
process.env.EMAIL_PORT = "25259";
process.env.MONGODB_URI = `mongodb://127.0.0.1:27028/gyanix_chat_regression_${process.pid}_${Date.now()}`;
const { test, before, after } = require("node:test"),
  assert = require("node:assert/strict"),
  mongoose = require("mongoose");
const mail = require("../src/services/email.service");
mail.sendWelcomeEmail = async () => {};
const app = require("../server"),
  User = require("../src/models/User"),
  Course = require("../src/models/Course"),
  Enrollment = require("../src/models/Enrollment"),
  Assignment = require("../src/models/Assignment"),
  Note = require("../src/models/StudyNote"),
  Conversation = require("../src/models/ChatConversation");
const knowledge = require("../src/services/knowledge.service"),
  provider = require("../src/services/chat-provider");
const password = require("crypto").randomBytes(24).toString("hex");
let server, base, s1, s2, i1, i2, admin, spam, c1, c2, thread;
async function req(method, path, body, token) {
  const r = await fetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: r.status, data: await r.json(), headers: r.headers };
}
async function account(role, name) {
  const r = await req("POST", "/auth/register", {
    name,
    email: name + "@example.test",
    password,
    role,
  });
  assert.equal(r.status, 201);
  return r.data;
}
before(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([
    User.init(),
    Course.init(),
    Enrollment.init(),
    Assignment.init(),
    Note.init(),
    Conversation.init(),
  ]);
  server = app.listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}/api`;
  s1 = await account("student", "learner-one");
  s2 = await account("student", "learner-two");
  spam = await account("student", "quota-test");
  i1 = await account("instructor", "teacher-one");
  i2 = await account("instructor", "teacher-two");
  const a = await User.create({
    name: "Admin",
    email: "chat-admin@example.test",
    password,
    role: "admin",
  });
  admin = (await req("POST", "/auth/login", { email: a.email, password })).data;
  for (const [instructor, title] of [
    [i1, "Physics fundamentals"],
    [i2, "Biology fundamentals"],
  ]) {
    const r = await req(
      "POST",
      "/courses",
      {
        title,
        description: "Learning curriculum",
        category: "programming",
        sections: [
          {
            title: "Lectures",
            lessons: [
              {
                title: "Intro",
                videoUrl: "https://example.test/intro.mp4",
                videoDuration: 60,
                order: 1,
              },
            ],
          },
        ],
      },
      instructor.token,
    );
    assert.equal(r.status, 201);
    await Course.updateOne(
      { _id: r.data.data._id },
      { $set: { status: "published" } },
    );
    if (instructor === i1) c1 = r.data.data;
    else c2 = r.data.data;
  }
  for (const [s, c] of [
    [s1, c1],
    [s2, c1],
    [s2, c2],
  ])
    assert.equal(
      (await req("POST", "/enrollments/" + c._id, {}, s.token)).status,
      201,
    );
  await Note.create({
    student: s1.user._id,
    title: "My physics note",
    content: "OWN_NOTE_CANARY: momentum is mass times velocity.",
  });
  await Note.create({
    student: s2.user._id,
    title: "Private second learner",
    content: "FOREIGN_NOTE_CANARY confidential note.",
  });
  await Assignment.create({
    title: "Physics worksheet",
    description: "Explain momentum",
    instructor: i1.user._id,
    course: c1._id,
    answerKey: "REFERENCE_KEY_CANARY",
    maxScore: 100,
    submissions: [
      {
        student: s1.user._id,
        content: "My own answer",
        score: 77,
        feedback: "OWN_GRADE_CANARY clear explanation",
      },
      {
        student: s2.user._id,
        content: "FOREIGN_SUBMISSION_CANARY",
        score: 99,
        feedback: "FOREIGN_FEEDBACK_CANARY",
      },
    ],
  });
  await Assignment.create({
    title: "FOREIGN_ASSIGNMENT_CANARY",
    description: "Biology worksheet",
    instructor: i2.user._id,
    course: c2._id,
    answerKey: "FOREIGN_REFERENCE_CANARY",
    maxScore: 100,
  });
});
after(async () => {
  if (server) await new Promise((r) => server.close(r));
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});
test("Assistant and dashboard privacy regression", async (t) => {
  await t.test("Chat and knowledge require authentication", async () => {
    for (const path of [
      "/ai/chat/status",
      "/ai/chat/knowledge",
      "/ai/chat/threads",
    ])
      assert.equal((await req("GET", path)).status, 401);
    assert.equal(
      (await req("POST", "/ai/chat", { message: "hello" })).status,
      401,
    );
  });
  await t.test(
    "Students cannot retrieve admin or instructor help articles",
    async () => {
      const r = await req("GET", "/ai/chat/knowledge", undefined, s1.token);
      assert.equal(r.status, 200);
      assert.ok(
        r.data.data.every(
          (d) => !d.id.startsWith("admin-") && !d.id.startsWith("instructor-"),
        ),
      );
      assert.equal(r.headers.get("cache-control"), "no-store");
    },
  );
  await t.test(
    "Instructors cannot retrieve administrator articles",
    async () => {
      const r = await req("GET", "/ai/chat/knowledge", undefined, i1.token);
      assert.equal(r.status, 200);
      assert.ok(r.data.data.every((d) => !d.id.startsWith("admin-")));
      assert.ok(r.data.data.some((d) => d.id === "instructor-assignments"));
    },
  );
  await t.test("Administrators receive administrator workflows", async () => {
    const r = await req("GET", "/ai/chat/knowledge", undefined, admin.token);
    assert.ok(r.data.data.some((d) => d.id === "admin-moderation"));
  });
  await t.test(
    "Private student context excludes every other learner and answer key",
    async () => {
      const chunks = await knowledge.privateContext(s1.user);
      const raw = JSON.stringify(chunks);
      assert.match(raw, /OWN_NOTE_CANARY/);
      assert.match(raw, /OWN_GRADE_CANARY/);
      for (const secret of [
        "FOREIGN_NOTE_CANARY",
        "FOREIGN_SUBMISSION_CANARY",
        "FOREIGN_FEEDBACK_CANARY",
        "FOREIGN_ASSIGNMENT_CANARY",
        "REFERENCE_KEY_CANARY",
        "FOREIGN_REFERENCE_CANARY",
      ])
        assert.ok(!raw.includes(secret), secret);
    },
  );
  await t.test(
    "Private instructor context is limited to owned course summaries",
    async () => {
      const raw = JSON.stringify(await knowledge.privateContext(i1.user));
      assert.match(raw, /Physics fundamentals/);
      assert.ok(!raw.includes("Biology fundamentals"));
      assert.ok(!raw.includes("FOREIGN_NOTE_CANARY"));
      assert.ok(!raw.includes("REFERENCE_KEY_CANARY"));
    },
  );
  await t.test(
    "Student dashboard exposes only own submissions and no financial fields",
    async () => {
      const r = await req("GET", "/dashboard/student", undefined, s1.token);
      assert.equal(r.status, 200);
      assert.equal(r.data.data.enrollments.length, 1);
      assert.equal(r.data.data.assignments[0].submissions.length, 1);
      assert.equal(
        String(r.data.data.assignments[0].submissions[0].student),
        s1.user._id,
      );
      assert.ok(!JSON.stringify(r.data).includes("FOREIGN_"));
      assert.ok(!JSON.stringify(r.data).includes("REFERENCE_KEY_CANARY"));
      assert.equal(r.data.data.enrollments[0].course.sections, undefined);
      assert.ok(!JSON.stringify(r.data).includes("My own answer"));
      assert.equal(r.data.data.stats.assessmentCount, 0);
    },
  );
  await t.test(
    "Unsubmitted assignments return an empty submission list",
    async () => {
      const draft = await Assignment.create({
        title: "Not submitted",
        description: "Pending work",
        course: c1._id,
        instructor: i1.user._id,
        maxScore: 100,
      });
      const r = await req("GET", "/dashboard/student", undefined, s1.token);
      assert.equal(r.status, 200);
      const item = r.data.data.assignments.find(
        (a) => a._id === String(draft._id),
      );
      assert.deepEqual(item.submissions, []);
      await Assignment.deleteOne({ _id: draft._id });
    },
  );
  await t.test("Instructor cannot request student dashboard data", async () =>
    assert.equal(
      (await req("GET", "/dashboard/student", undefined, i1.token)).status,
      403,
    ),
  );
  await t.test("Multilingual lexical retrieval finds the relevant help", () => {
    for (const [role, q, id] of [
      ["student", "મને નોંધો અને પીડીએફ સારાંશ બનાવવો છે", "notes"],
      ["student", "प्रमाणपत्र कैसे मिलेगा?", "certificates"],
      ["student", "flashcards spaced repetition", "flashcards"],
      ["instructor", "assignment gradebook rubric", "instructor-assignments"],
      ["instructor", "વર્ગ માટે ક્વિઝ કેવી રીતે બનાવું?", "instructor-quizzes"],
    ]) {
      const results = knowledge.lexical(q, knowledge.documents({ role }));
      assert.ok(
        results.slice(0, 2).some((r) => r.doc.id === id),
        JSON.stringify(results.slice(0, 2).map((r) => r.doc.id)),
      );
    }
  });
  await t.test(
    "No-key Hindi answer is retrieved help with an honest mode",
    async () => {
      const r = await req(
        "POST",
        "/ai/chat",
        { message: "प्रमाणपत्र कैसे मिलेगा?" },
        s1.token,
      );
      assert.equal(r.status, 200);
      assert.equal(r.data.data.mode, "retrieval-only");
      assert.equal(r.data.data.language, "hi");
      assert.match(r.data.data.answer, /प्रमाणपत्र/);
      thread = r.data.data.threadId;
      assert.ok(r.data.data.sources.every((s) => !s.id.startsWith("admin-")));
    },
  );
  await t.test("No-key Gujarati answer uses Gujarati help", async () => {
    const r = await req(
      "POST",
      "/ai/chat",
      { message: "નોંધો કેવી રીતે બનાવું?" },
      s2.token,
    );
    assert.equal(r.status, 200);
    assert.equal(r.data.data.language, "gu");
    assert.match(r.data.data.answer, /નોંધો/);
  });
  await t.test(
    "Another student cannot read or continue a conversation",
    async () => {
      assert.equal(
        (await req("GET", "/ai/chat/threads/" + thread, undefined, s2.token))
          .status,
        404,
      );
      assert.equal(
        (
          await req(
            "POST",
            "/ai/chat",
            { message: "Continue", threadId: thread },
            s2.token,
          )
        ).status,
        404,
      );
    },
  );
  await t.test("Another role cannot read a learner conversation", async () =>
    assert.equal(
      (await req("GET", "/ai/chat/threads/" + thread, undefined, i1.token))
        .status,
      404,
    ),
  );
  await t.test(
    "Role spoofing, client history, user IDs and arbitrary URLs rejected",
    async () => {
      for (const field of [
        "role",
        "userId",
        "context",
        "conversationHistory",
        "documentIds",
        "url",
      ]) {
        const r = await req(
          "POST",
          "/ai/chat",
          { message: "hello", [field]: "admin" },
          spam.token,
        );
        assert.equal(r.status, 400, field);
      }
    },
  );
  await t.test(
    "Invalid messages, IDs and language codes rejected",
    async () => {
      for (const body of [
        { message: "" },
        { message: "x".repeat(4001) },
        { message: "hi", threadId: "bad" },
        { message: "hi", language: "ignore policy" },
      ])
        assert.equal(
          (await req("POST", "/ai/chat", body, spam.token)).status,
          400,
        );
    },
  );
  await t.test(
    "Course context cannot cross enrollment or ownership boundaries",
    async () => {
      assert.equal(
        (
          await req(
            "POST",
            "/ai/chat",
            { message: "Explain this course", courseId: c2._id },
            s1.token,
          )
        ).status,
        403,
      );
      assert.equal(
        (
          await req(
            "POST",
            "/ai/chat",
            { message: "Show course roster", courseId: c2._id },
            i1.token,
          )
        ).status,
        403,
      );
    },
  );
  await t.test(
    "Conversation history is owned, persisted and expires",
    async () => {
      const r = await req(
        "GET",
        "/ai/chat/threads/" + thread,
        undefined,
        s1.token,
      );
      assert.equal(r.status, 200);
      assert.equal(r.data.data.messages.length, 2);
      const list = await req("GET", "/ai/chat/threads", undefined, s2.token);
      assert.ok(!list.data.data.some((x) => x._id === thread));
      await Conversation.updateOne(
        { _id: thread },
        { $set: { expiresAt: new Date(Date.now() - 1000) } },
      );
      assert.equal(
        (await req("GET", "/ai/chat/threads/" + thread, undefined, s1.token))
          .status,
        404,
      );
    },
  );
  await t.test(
    "Live provider receives server-filtered retrieval and genuine follow-up history",
    async () => {
      const savedConfigured = provider.configured,
        savedGenerate = provider.generate;
      let captured,
        calls = 0;
      provider.configured = () => true;
      provider.generate = async (input) => {
        captured = input;
        calls++;
        return {
          answer:
            calls === 1
              ? "आपके पाठ्यक्रम के लिए यह अगला चरण है।"
              : "પહેલા જવાબ પછી આ વધારાની માહિતી છે.",
          sourceIds: ["enrollment", "admin-accounts", "unknown-source"],
          language: calls === 1 ? "hi" : "gu",
        };
      };
      try {
        const first = await req(
          "POST",
          "/ai/chat",
          { message: "मेरे पाठ्यक्रम में कैसे जुड़ूँ?", language: "hi" },
          s1.token,
        );
        assert.equal(first.status, 200);
        assert.equal(first.data.data.mode, "live");
        assert.equal(first.data.data.language, "hi");
        assert.ok(first.data.data.sources.every((s) => s.id === "enrollment"));
        assert.match(captured.instructions, /Authenticated role: student/);
        assert.ok(!captured.instructions.includes("FOREIGN_NOTE_CANARY"));
        assert.ok(!captured.instructions.includes("REFERENCE_KEY_CANARY"));
        const follow = await req(
          "POST",
          "/ai/chat",
          {
            message: "હવે ગુજરાતી ભાષામાં આગળનું પગલું સમજાવો.",
            threadId: first.data.data.threadId,
            language: "gu",
          },
          s1.token,
        );
        assert.equal(follow.status, 200);
        assert.equal(captured.messages.length, 3);
        assert.equal(captured.messages[1].role, "assistant");
        assert.equal(captured.messages[1].content, first.data.data.answer);
        assert.equal(follow.data.data.language, "gu");
      } finally {
        provider.configured = savedConfigured;
        provider.generate = savedGenerate;
      }
    },
  );
  await t.test(
    "Model outage returns retrieved help without fabricated live status",
    async () => {
      const original = provider.configured,
        generate = provider.generate;
      provider.configured = () => true;
      provider.generate = async () => {
        throw Error("private-provider-detail");
      };
      try {
        const r = await req(
          "POST",
          "/ai/chat",
          { message: "How do flashcards work?" },
          s2.token,
        );
        assert.equal(r.status, 200);
        assert.equal(r.data.data.mode, "retrieval-only");
        assert.equal(r.data.data.reason, "provider-unavailable");
        assert.ok(!JSON.stringify(r.data).includes("private-provider-detail"));
      } finally {
        provider.configured = original;
        provider.generate = generate;
      }
    },
  );
  await t.test(
    "Role changes invalidate access to old-role conversations",
    async () => {
      const old = await Conversation.create({
        owner: s1.user._id,
        ownerRole: "instructor",
        messages: [{ role: "assistant", content: "OLD_ROLE_PRIVATE_CANARY" }],
      });
      assert.equal(
        (await req("GET", "/ai/chat/threads/" + old._id, undefined, s1.token))
          .status,
        404,
      );
    },
  );
  await t.test(
    "Concurrent generation lock refuses duplicate sends",
    async () => {
      const locked = await Conversation.create({
        owner: s2.user._id,
        ownerRole: "student",
        busyUntil: new Date(Date.now() + 30000),
      });
      assert.equal(
        (
          await req(
            "POST",
            "/ai/chat",
            { message: "Follow up", threadId: String(locked._id) },
            s2.token,
          )
        ).status,
        409,
      );
    },
  );
  await t.test(
    "Inactive account cannot retrieve chat or knowledge",
    async () => {
      await User.updateOne({ _id: i2.user._id }, { $set: { isActive: false } });
      assert.equal(
        (await req("GET", "/ai/chat/knowledge", undefined, i2.token)).status,
        401,
      );
    },
  );
  await t.test(
    "Chat status contains availability, never credentials",
    async () => {
      const r = await req("GET", "/ai/chat/status", undefined, s1.token);
      assert.equal(r.status, 200);
      assert.equal(r.data.data.configured, false);
      assert.equal(r.data.data.retentionDays, 30);
      assert.equal(r.data.data.apiKey, undefined);
    },
  );
  await t.test("Per-account quota is enforced", async () => {
    let limited = false;
    for (let n = 0; n < 22; n++) {
      const r = await req(
        "POST",
        "/ai/chat",
        { message: "", role: "admin" },
        spam.token,
      );
      if (r.status === 429) {
        limited = true;
        break;
      }
    }
    assert.ok(limited);
  });
});
