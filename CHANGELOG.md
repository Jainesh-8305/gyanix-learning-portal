# CHANGELOG.md — AI-LMS

All notable changes to this project are documented here.
Format: `## [Version] — YYYY-MM-DD | Phase N: <description>`

---

## [0.3.0] — 2026-08-22 | Phase 3: Living Space-Theme UI/UX, Dynamic Physics & Performance Caching

### 🌌 Living Space-Theme & Interactive Cosmos Engine
- **`SpaceCanvasBackground.tsx`**: Route-aware unified background system supporting `full`, `medium`, `subtle`, and `minimal` intensities.
- **Cursor Light-Source & Gravity Well**: 60 FPS physics canvas where stars/particles react elastically to pointer proximity with depth parallax layers (`z=1` to `z=3`).
- **Floating Study Motifs**: Vector-illustrated astronaut scholar reading on Earth, orbiting Saturn, retro rocket cruiser with exhaust fire, neon pencils, spiral notebooks, and science atoms.
- **`CosmicCursor.tsx`**: Glowing leading stardust cursor with fading comet tail particles (auto-disabled on touch & `prefers-reduced-motion`).
- **`MagneticElement.tsx`**: GPU-accelerated magnetic pull micro-interactions on CTA buttons and cards.
- **AI Thinking Swirl**: Dynamic particle convergence animation dispatched during generative AI quiz workflows.

### ⚡ Performance & Caching
- **`SWRProvider.tsx`**: Global request deduplication (`dedupingInterval: 10000ms`), disabled focus revalidation, and smooth transition caching for sub-millisecond page loads.
- **Canvas CPU Optimization**: Automatic render pausing on tab visibility change with `React.memo` isolation.

### 💬 Real-Time Community & Q&A Hub
- **`Discussion.js` & `discussion.controller.js`**: Course community forum with AI instant answer generation, instructor verification badges, and resolution toggles.
- **`/courses/[id]/community`**: Interactive Q&A discussion board integrated into course lecture player.

---

## [0.2.0] — 2026-08-22 | Phase 2: Bug Fixes & Feature Completion

### Security Fixes
- **`server.js`**: Replaced bare `helmet()` with explicit `Content-Security-Policy` directives.
  Allows `img-src` and `media-src` from Cloudinary. `objectSrc: none`, `frameSrc: none`.
- **`auth.routes.js`**: Added dedicated `loginLimiter` — 10 req / 15 min / IP on `POST /login`,
  tighter than the global 100/15min API limiter. Prevents brute-force attacks.
- **`course.routes.js`**: Added missing `isInstructor` middleware to `DELETE /courses/:id`.
  Previously, any authenticated user could reach the controller's ownership check.

### Bug Fixes
- **`ai.service.js`**: Fixed `generateLearningPath` using API-default temperature (~1.0).
  Now explicitly set to `0.4` for deterministic structured recommendations.
- **`ai.service.js`**: Added `safeParseJSON()` helper — all JSON.parse calls now throw
  informative errors instead of raw SyntaxError if OpenAI returns malformed content.
- **`auth.controller.js`**: Implemented `resetPassword` endpoint. Forgot-password previously
  generated a reset token with no handler to consume it — the flow was broken end-to-end.

### New Features

#### Backend
- **`Certificate.js`** model: Full schema with certificateId, pdfUrl, student/course/enrollment refs.
- **`Assignment.js`** model: Full schema with embedded submissions, AI grading flag, rubric field.
- **`generateCertificate.js`**: PDFKit-based certificate generator with dark space theme.
  Uploads directly to Cloudinary as buffer. Triggered automatically on course completion.
- **Quiz CRUD** (`quiz.controller.js`, `quiz.routes.js`): Full create/read/update/delete + submit.
  Students get answer-stripped quiz data. Server auto-scores multiple-choice.
- **User profile routes** (`user.routes.js`): `GET /api/users/me` and `PUT /api/users/me`
  (safe field whitelist — no role/password changes).

#### Email Notifications (previously missing triggers)
- `sendCourseApproved` — fires when admin approves a course submission (to instructor)
- `sendCourseRejected` — fires when admin rejects a course, with admin feedback (to instructor)
- `sendCertificateIssued` — fires when a student completes a course (to student, with PDF link)
- `sendPaymentReceipt` — fires after successful Stripe webhook (to student, with amount/date)

#### Stripe Payment Flow (previously scaffolded only)
- **`(payment)/checkout/page.tsx`**: Full Stripe Elements integration with CardElement.
  Flow: create-intent → CardElement form → confirmCardPayment → redirect to /learn.
- **`stripe.service.js`**: Added idempotency check in `handlePaymentSuccess` to prevent
  double-enrollment if webhook fires twice. Added receipt email trigger.

#### Frontend
- **`/reset-password`** page: Consumes the token from forgot-password email. Validates with Zod,
  POSTs to `/api/auth/reset-password`, redirects to login on success.

### Documentation Drift Correction
- `ARCHITECTURE.md` created — accurate system diagram and endpoint reference matching actual code.
- `PROMPTS.md` created — centralized prompt registry for all LLM calls.
- RAG pipeline references corrected: the Internship Report described a RAG system that does not
  exist in code. Documented as Phase 4 planned feature in ARCHITECTURE.md.

### Trade-offs & Notes
- Certificate generation is async (fire-and-forget from the progress endpoint) to avoid adding
  latency to the lesson-completion user action. A failure will log but not surface to the student.
- Email triggers all use fire-and-forget to avoid blocking API responses on SMTP latency.
- The `gradeAnswer` endpoint remains gated to `isInstructor` as its primary design intent is
  instructor-initiated AI grading review. Phase 4 will extend this to support student auto-grading.

---

## [0.1.0] — Initial Build | Phase 1 baseline

### What existed at Phase 1 audit
- Auth: register, login, getMe, forgotPassword (reset endpoint missing)
- Courses: full CRUD + thumbnail upload + admin moderation flow
- Enrollments: enroll (free), get my enrollments, update progress
- Admin: dashboard stats, user list/toggle, course approve/reject (no emails)
- AI: generate-quiz, grade-answer (instructor only), recommendations
- Stripe: create-intent + webhook handler (no frontend checkout page)
- Email: welcome + password reset only
- Frontend: login, register, forgot-password, courses list/detail, learn page,
  instructor dashboard + course builder, admin dashboard + courses + users + enrollments
- Missing: reset-password, quiz routes (stub), assignment routes (stub), user routes (stub),
  Certificate model (empty), Assignment model (empty), ForumPost model (empty),
  generateCertificate.js (empty), checkout page (empty), Socket.io (none)
