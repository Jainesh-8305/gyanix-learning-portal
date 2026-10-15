# Gyanix - final audit, improvements and QA report

Date: 15 October 2026. Repository: https://github.com/Jainesh-8305/gyanix-learning-portal.git. Branch: `fix/qa-audit`. Baseline: `177f8a9354f4cfb417075c3bc0f9f2811e5d0181`.

Implementation is local and uncommitted. All 34 original finding groups have code remediation or have been retired by the requested payment removal. Live AI validation is pending a credential file path.

## Verification

115 backend tests pass (0 failed/skipped). Strict lint checks, TypeScript, production build and both npm audits pass; advisory totals are zero as of this run. Latest Docker images build and start as non-root users. Browser evidence covers 19 recorded workflows, including complete free course approval/enrollment and student/instructor grading.

## Requested additions

### Dashboard UI/UX

Shared role navigation, calm navy styling, spacing and hierarchy, accessible tables and empty/error states. Student assignments, submissions, feedback, progress, notes, flashcards, quizzes, calendar and certificates remain reachable. Instructor courses, rosters, gradebook, studios, resource hubs and reviews remain reachable. Admin governance, accounts and enrollment records remain available.

### Remove payments

Deleted gateway SDKs, backend payment routes/services, checkout, pricing forms, receipts and revenue views. Course/enrollment financial fields are rejected or redacted. All published courses enroll free, including legacy-priced courses. Publication, role and membership restrictions still apply. Backed-up local migration preserves learning history.

### Performance and smoothness

Removed site-wide animated canvas/cursor loops and unused frontend packages. Heavy studios and assistant load on demand with local loading states. Role views fetch only needed data; student dashboard uses one bounded aggregate endpoint. Added query indexes, bounded lists, debounce and account-scoped cache reuse with refresh behavior.

### Intelligent multilingual assistant

Configurable OpenAI Responses model gpt-5.4-mini, structured replies, recent server-owned conversation turns and contextual retrieval. Hybrid lexical/embedding ranking uses reviewed role-filtered documentation; current authorized summaries are fetched separately. Supports natural language instructions including Hindi, Gujarati and English. Actual multilingual model quality remains pending credentials.

### Floating assistant UI

Signed-in pages have a small corner launcher. The lazy chat window offers language choice, safe source links, history, new conversation, cancellation, keyboard close/focus handling and private owned conversations. It is no longer a dashboard card.

## Additional issues found and fixed

E01: Unsubmitted assignment projection could omit submissions and crash the new dashboard. Normalize to an empty list; dedicated regression added. E02: Legacy notes and revision screens showed generic success after API errors. Remove fake success and retain a notes source error (UI-14). E03: Gujarati quiz query matched an enrollment article. Added Gujarati quiz concept expansion and retested (UI-02). E04: Protected video redaction looked like missing media. Add safe hasVideo metadata and retain private URLs server-side. E05: Lazy tools replaced the whole workspace during loading. Add local overlay fallbacks, associate form labels and name question-edit controls (UI-12/16/19).

## Assistant access design

# Assistant security boundaries

The assistant is read-only. Backend access checks, not model instructions, decide what can be retrieved.

| Caller | Documentation | Dynamic evidence |
| --- | --- | --- |
| Student | Shared/student workflows | Own published enrollments, own notes and own permitted assignment grades/feedback |
| Instructor | Shared/instructor workflows | Owned course summaries; no private student notes or other instructors' records |
| Admin | Reviewed administrator/shared workflows | Platform totals; no passwords, API keys, reference keys or bulk account emails |
| Anonymous/inactive | None | None |

`protect` verifies the current database account, activation and token version. Course-scoped requests require enrollment/ownership (or admin access). Chat body fields cannot choose a role, owner, URL, document or previous assistant message. Conversation queries include authenticated owner and current role, explicit expiry and a generation lock; account/role changes reset frontend state.

The reviewed static corpus has explicit role attributes. It is filtered before keyword or embedding search. Private context queries always include `student`/`instructor` ownership or an allowed course ID set; no cross-user private index exists. Student assignment projection selects only the current student's submission, and context serialization excludes answer text/reference keys. Cache keys for documentation include role/model; no generated answer cache is shared between users.

LLM inputs include only selected source chunks and recent turns from the owned conversation. Source text is treated as untrusted data. The model has no browser, network tools, arbitrary-file access or account mutation tools. Returned citation IDs are intersected with selected source IDs. Responses render as React text with safe internal source links; model output cannot inject HTML into the page. Semantic retrieval can fall back to local keyword retrieval during provider failure. Provider failures never masquerade as live responses.

Limits: 4,000-character input, bounded private queries, five ranked chunks plus at most one permitted summary, 20 messages/minute/account, 100 retained conversations/account, 40 messages/conversation, 30-day expiry, generation lock, and provider timeouts without automatic retries. Keys remain server-only and are not accepted from browsers. `Cache-Control: no-store` applies to API responses.

Tests use separate local fixture accounts and canaries to verify negative access, student grade isolation, hidden reference keys, role spoofing, foreign/expired/current-role conversations, live-provider input assembly, citation filtering, server-owned history, provider outages, Hindi/Gujarati retrieval and per-user quotas. No prompt-based technique alone can guarantee perfect factuality or eliminate every model attack. Live language quality and grounding require provider-backed evaluation alongside these deterministic authorization tests.

Reference implementation guidance: [OpenAI embeddings](https://developers.openai.com/api/docs/guides/embeddings), [Responses API](https://developers.openai.com/api/docs/guides/text), [safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices).


## Performance evidence

Initial route JavaScript bytes are uncompressed HTML-referenced script totals, not authenticated LCP/INP measurements. Same local machine and measurement method; test data grew between snapshots. API timings use 12 local requests and tiny fixtures; latency improvements are not established.

- Student: initial JS 817,308 -> 705,018 bytes (13.7% smaller). Current overview API /dashboard/student: median 7.19 ms; maximum 21.34 ms; 2,395 response bytes.

- Instructor: initial JS 786,547 -> 702,844 bytes (10.6% smaller). Current overview API /courses/my-courses: median 1.99 ms; maximum 3.30 ms; 1,875 response bytes.

- Admin: initial JS 693,680 -> 690,923 bytes (0.4% smaller). Current overview API /admin/dashboard: median 2.15 ms; maximum 3.61 ms; 97 response bytes.

## Browser verification

- UI-01 / PASS: Instructor dashboard shows all teaching features in a clear sidebar and no payment or revenue controls.

- UI-02 / PASS: Floating assistant opens as a non-modal window; Gujarati question retrieves the correct batch-quiz guide and explicitly identifies retrieval-only mode.

- UI-03 / PASS: Instructor course-creation form contains no price, discount or gateway fields.

- UI-04 / PASS: Created a course in the UI, added a private video and duration, saved and reloaded; both persisted correctly.

- UI-05 / PASS: Instructor roster loads owned course enrollments and actual completion progress.

- UI-06 / PASS: Student submitted HTTP assignment; persisted receipt and awaiting-review status visible.

- UI-07 / PASS: Student completed 3-question instructor quiz via UI. Backend result 3/3, 100%, persisted assessment.

- UI-08 / PASS: Instructor read real submitted answer and saved manual grade 85/100 with feedback through gradebook.

- UI-09 / PASS: Admin approved pending course; published list verified. User search, deactivation/reactivation of synthetic second student, and enrollment table worked without finance fields.

- UI-10 / PASS: Student reopened submission after instructor review; own 85/100 score and exact feedback visible.

- UI-11 / PASS: New course: instructor create/edit/submit -> admin publish -> student free enrollment -> lesson opened directly, no checkout.

- UI-12 / PASS: 390px student dashboard and floating Hindi assistant: scrollWidth=clientWidth=390. Correct role-filtered assignment article in Hindi. Final lazy assignment modal retains workspace shell.

- UI-13 / PASS: Private notes generated from pasted HTTP text with explicit offline template label; saved note appears in private library. Unsupported video URL did not produce generated output.

- UI-14 / PASS: Final production notes screen shows persistent transcript-required error and no generated output for a video URL without text.

- UI-15 / PASS: Revision quiz lists both real enrolled courses and lesson scope. Selecting 3 produces exactly 3 questions, labelled offline template and practice only.

- UI-16 / PASS: 390px instructor workspace has no page overflow. Lazy quiz tool keeps shell visible; form fields labelled; 3-question draft count correct and offline review notice visible.

- UI-17 / PASS: All three role dashboards fit 390px and 1440px without page overflow. Mobile admin overview shows real totals and all governance links.

- UI-18 / PASS: Latest standalone Docker frontend renders catalog against isolated empty QA database; empty-state UI works without console errors.

- UI-19 / PASS: Final build: instructor 1440px width equals scrollWidth. Quiz question edit/save/remove controls have accessible names; edited text persists in draft. Instructor login ignored an admin return URL and reached instructor workspace.

## Original findings and recommended fixes

Historical payment recommendations are superseded by the explicit decision to remove payments. Prior fix-phase browser references remain historical; backend regression tests were rerun for this delivery.

### F01 - Password reset permits account takeover

Critical / Implemented locally

Original recommended fix: Return one generic response for known/unknown emails. Deliver tokens only through email; remove direct links and token logs in every environment exposed to users. Rate-limit reset requests.

Delivered: Reset replies are identical for known/unknown addresses. Tokens only go to email, are single-use, expire, and reset requests are rate-limited. UI no longer exposes a reset link.

Verification: Reset response generic and token private; Email reset consumes token and revokes existing sessions

Primary source: `backend/src/controllers/auth.controller.js`.

Remaining validation/limit: SMTP inbox delivery still needs configured credentials.

### F02 - Public seeding restores known administrator credentials

Critical / Implemented locally

Original recommended fix: Remove the HTTP seed route and automatic production seeding. Provide an explicit local-only seed command with generated test accounts; never update an existing account password during seeding.

Delivered: Removed public HTTP seeding and startup seeding. Explicit loopback-only seed command creates random local credentials and preserves existing users/passwords.

Verification: Seed endpoint removed; seed-local.js inspection

Primary source: `backend/src/utils/seed-local.js`.

Remaining validation/limit: Existing installations must rotate/remove historical demo accounts before exposure.

### F03 - Production test-purchase route bypasses payment

Critical / Retired by payment removal

Original recommended fix: Remove this route from production. Use Stripe test mode and a verified payment-success event for test purchases, with explicitly separated demo accounting.

Delivered: Removed payment routes, handlers, gateway SDKs, checkout page, receipts, financial UI and pricing fields. Published courses enroll for free. Legacy financial fields are redacted and the backed-up local database was migrated without deleting learning records.

Verification: 115-test regression suite: legacy-priced courses enroll for free, financial payloads rejected, legacy fields redacted, removed gateway URLs return 404; UI-11 free classroom lifecycle.

Primary source: `backend/src/controllers/enrollment.controller.js`.

Remaining validation/limit: No payment provider integration remains; historical order collections are retained offline in the database and are not exposed by the app.

### F04 - Client-forged quiz earns a paid-course certificate

Critical / Implemented locally

Original recommended fix: Store a server-created assessment attempt and answer key. Accept only attempt ID and student answers. Recheck enrollment, course status, valid lesson completion, time/attempt limits and role before grading or issuing a certificate.

Delivered: Certification uses server-stored keys, enrollment, published status, validated lessons and owned timed attempts. Client question/key payloads are rejected. Verification requires a passed stored attempt.

Verification: Forged paid certificate blocked; Supplied question key rejected; Server scores stored key and issues backed certificate

Primary source: `backend/src/services/assessment.service.js`.

Remaining validation/limit: Offline question templates remain generic practice content, not an academic accreditation.

### F05 - Course editor silently loses private video URLs

High / Implemented locally

Original recommended fix: Return full edit content to the owning instructor and admin through an ownership-protected endpoint. Ensure read redaction cannot be saved back as destructive updates.

Delivered: Owners/admins retain private lesson media when editing. Public responses redact protected media. Editor persists the correct videoDuration field and stops review submission after a save failure.

Verification: Owner retains private URLs and totals; Prior fix-phase browser FIX-UI-09

Primary source: `backend/src/controllers/course.controller.js`.

Remaining validation/limit: Cloudinary upload delivery requires real service credentials; direct lesson URLs were tested.

### F06 - Invented lesson IDs complete a course

High / Implemented locally

Original recommended fix: Validate lesson existence in that course, unique completion, finite nonnegative watch time, and the intended completion policy. Calculate progress from valid curriculum IDs only.

Delivered: Completion rejects nonexistent lessons and invented watch time. Bounded server heartbeats credit elapsed sessions; valid saved curriculum determines progress. Progress alone does not issue a certificate.

Verification: Invalid lesson rejected; Faked watch time rejected; Server watch heartbeat validates completion without issuing certificate; Prior fix-phase browser FIX-UI-01

Primary source: `backend/src/controllers/enrollment.controller.js`.

Remaining validation/limit: Heartbeats are a practical progress gate, not tamper-proof evidence of human attention.

### F07 - Instructor boundaries fail for quizzes and assignments

High / Implemented locally

Original recommended fix: Resolve the course owner for every read/create operation; permit only that owner, admin, or enrolled students with redacted responses.

Delivered: Quiz/assignment reads and creation require course ownership or permitted enrollment. Students cannot read reference keys; other instructors cannot manage these records.

Verification: Other teacher quiz read/create blocked; Assignment other teacher read/create blocked; Student private answer key redacted

Primary source: `backend/src/controllers/quiz.controller.js`.

### F08 - Instructor updates bypass moderation

High / Implemented locally

Original recommended fix: Whitelist editable course fields and implement explicit role-based status transitions. Reserve moderation fields and published state for admin or a documented approved-revision workflow.

Delivered: Whitelisted instructor updates reject moderation/system fields. Editing a published course returns it to draft. Only administrators publish; review validates lecture media.

Verification: Moderation mass assignment blocked; Self publishing blocked; Review submission; browser instructor review flow

Primary source: `backend/src/controllers/course.controller.js`.

### F09 - Advertised classroom and AI studio APIs are missing

High / Implemented locally

Original recommended fix: Implement and test the intended backend contracts and persistence, or clearly disable/label these features as planned. Add a frontend/backend route contract check.

Delivered: Implemented batch join, persisted batch quizzes, assignment drafting, instructor gradebook and owner-controlled resource hubs. Validated batch deadlines and HTTP(S) resource links.

Verification: Instructor batch quiz dispatch; Instructor gradebook exists; Resource hub saves; Prior fix-phase browser FIX-UI-07/08

Primary source: `backend/src/routes/course.routes.js`.

Remaining validation/limit: Drafts from offline templates need instructor review; optional live AI calls were not verified.

### F10 - Discussion authorization can be bypassed

High / Implemented locally

Original recommended fix: Authorize against discussion.course, enforce path course equality, and restrict resolve to author, course instructor or admin.

Delivered: Discussion course association and enrollment are checked on replies/votes. Resolution is limited to author, course owner or admin.

Verification: Discussion membership and course association

Primary source: `backend/src/controllers/discussion.controller.js`.

### F11 - AI memory feedback and notes are public

High / Implemented locally

Original recommended fix: Require authentication and per-user scoping for memory. Return aggregate metrics without notes/names to public callers. Add per-user quotas and strict input sizes for AI calls.

Delivered: AI routes require authentication and per-account quotas. Feedback and insights are scoped to the signed-in account and derived from actual saved records.

Verification: AI authentication cases; Private feedback, real counts

Primary source: `backend/src/routes/ai.routes.js`.

### F12 - Saved notes leak between accounts on one browser

High / Implemented locally

Original recommended fix: Store notes in an authenticated per-user backend library; at minimum use user-scoped local keys and clear in-memory state on logout.

Delivered: Saved notes use account-owned API storage. Removed shared browser-note storage and starter-note claims; account changes clear the SWR cache boundary.

Verification: Private notes persisted and isolated; SWRProvider inspection

Primary source: `frontend/src/components/providers/SWRProvider.tsx`.

Remaining validation/limit: Old shared localStorage notes are deliberately not imported into an arbitrary account.

### F13 - Valid Stripe webhook is rejected before enrollment

High / Retired by payment removal

Original recommended fix: Register the raw-body webhook before global JSON parsing, then validate signature and implement durable idempotency/error handling. Stripe's official documentation requires unmodified raw bytes.

Delivered: Removed payment routes, handlers, gateway SDKs, checkout page, receipts, financial UI and pricing fields. Published courses enroll for free. Legacy financial fields are redacted and the backed-up local database was migrated without deleting learning records.

Verification: 115-test regression suite: legacy-priced courses enroll for free, financial payloads rejected, legacy fields redacted, removed gateway URLs return 404; UI-11 free classroom lifecycle.

Primary source: `backend/src/controllers/enrollment.controller.js`.

Remaining validation/limit: No payment provider integration remains; historical order collections are retained offline in the database and are not exposed by the app.

### F14 - Default mobile lesson layout clips the video

High / Implemented locally

Original recommended fix: Use a closed-by-default drawer/overlay on narrow screens and preserve a full-width video; label the toggle and check viewport changes.

Delivered: Lesson navigation starts closed and overlays rather than shrinks the player. Mobile overlay has a visible close button below the navbar; hidden content is inert.

Verification: Prior fix-phase browser FIX-UI-04; 390px viewport, scrollWidth=clientWidth=390

Primary source: `frontend/src/app/courses/[id]/learn/page.tsx`.

### F15 - Deleting courses leaves broken database references

High / Implemented locally

Original recommended fix: Prefer archive/soft-delete for courses with learning records. Define dependent-record retention/cascade policy and make frontend handling of removed courses explicit.

Delivered: Course deletion archives the course instead of breaking enrollment/quiz/assignment references; enrollment list also tolerates missing historical records.

Verification: Archive retains referenced records

Primary source: `backend/src/controllers/course.controller.js`.

Remaining validation/limit: Historical corruption should be reconciled using a backup before any deployment.

### F16 - Dependency audits report vulnerable production packages

High / Implemented locally

Original recommended fix: Review each recorded advisory and reachable feature; upgrade to patched compatible releases and retest. Do not blindly use npm audit fix --force: suggested resolutions include major downgrades for some development packages.

Delivered: Updated application and development dependencies and lockfiles. Replaced the vulnerable Next lint dependency tree with direct ESLint, TypeScript, Hooks, accessibility and unused-import rules.

Verification: backend-audit.json and frontend-audit.json: total=0

Primary source: `frontend/eslint.config.mjs`.

Remaining validation/limit: Audit results are a dated advisory snapshot, not a guarantee that future advisories will remain zero.

### F17 - Password reset leaves old sessions valid

Medium / Implemented locally

Original recommended fix: Add session/token version or passwordChangedAt validation and revoke sessions on reset; define logout/session expiry behavior.

Delivered: JWT tokenVersion is checked against the current account. Password reset increments it and rejects all previously issued sessions.

Verification: Email reset consumes token and revokes existing sessions

Primary source: `backend/src/middleware/auth.js`.

### F18 - Role navigation and hydration guards are inconsistent

Medium / Implemented locally

Original recommended fix: Centralize hydrated authentication and role guards, add an admin dashboard mapping, and honor a validated same-origin return path after login.

Delivered: Central session boundary waits for persisted-auth hydration and server session validation before private content renders. Role dashboards, safe return paths and user-scoped caches are consistent.

Verification: Prior fix-phase browser FIX-UI-06; administrator login/direct-load/reload checks

Primary source: `frontend/src/components/providers/AuthBoundary.tsx`.

### F19 - Draft/unpublished course access is not enforced

Medium / Implemented locally

Original recommended fix: Restrict unpublished details to the course owner/admin and permit enrollments only for published, available courses.

Delivered: Unpublished course details are owner/admin only. Enrollment, student material and assessments require published status and permitted membership. Every published course is free; legacy price fields do not restrict enrollment.

Verification: Draft read/enrollment denial tests; legacy free enrollment and classroom-code tests; UI-11.

Primary source: `backend/src/controllers/course.controller.js`.

### F20 - Quiz attempts and time limits lack server enforcement

Medium / Implemented locally

Original recommended fix: Persist per-student attempts with start/end timestamps, immutable scoring, maximum-attempt checks and review release policy.

Delivered: Persisted immutable attempts enforce ownership, expiry, attempt count and replay protection. Keys are hidden until submission. Both quiz timers use the server deadline.

Verification: Standard attempt scores, persists and enforces maxAttempts; Expired attempt refused; Submitted attempt cannot replay

Primary source: `backend/src/services/assessment.service.js`.

### F21 - Assignment deadlines and grade range are not validated

Medium / Implemented locally

Original recommended fix: Validate finite score in [0,maxScore], deadline policy, required answer content and any late-submission exceptions.

Delivered: Assignment submissions validate role, deadline, required answer and duplicates. Grades must be finite numbers within the assignment range; unavailable AI grading stays pending.

Verification: Assignment deadline enforced; Invalid grade cases; Valid grade saved; Unconfigured live grader fails clearly

Primary source: `backend/src/controllers/assignment.controller.js`.

Remaining validation/limit: Live OpenAI grading quality still requires service credentials and human review.

### F22 - Flashcards are a temporary demo, not persisted SM-2

Medium / Implemented locally

Original recommended fix: Label the current deck as a demo or implement per-user cards, repetition/ease/interval/due fields, durable ratings and documented keyboard controls.

Delivered: Implemented per-account cards, SM-2 repetition/ease/interval/due fields and persistent reviews. Space reveals cards; 1-4 rate them, including when controls have keyboard focus.

Verification: SM-2 reviews persist per student; SM-2 schedule math; Prior fix-phase browser FIX-UI-02/03/05

Primary source: `frontend/src/app/dashboard/student/flashcards/page.tsx`.

### F23 - Displayed history, counts and ratings are fabricated

Medium / Implemented locally

Original recommended fix: Derive metrics from real user records and show honest empty states. Mark illustrative demo values clearly and recompute course lesson/duration totals when saving.

Delivered: History, activity, feedback counts, streaks, lesson totals and SRS metrics derive from stored records. Empty ratings show zero/no ratings. Homepage sample grades are labelled illustrative.

Verification: Fresh account history and flashcards are zero; Owner retains private URLs and totals; final instructor screenshot

Primary source: `frontend/src/app/dashboard/student/page.tsx`.

Remaining validation/limit: Sample curricula are draft examples; a short synthetic video exists only in the ignored local browser fixture.

### F24 - AI provider and self-learning claims exceed the implementation

Medium / Implemented locally

Original recommended fix: Show actual provider/model and fallback status. Describe stored feedback accurately. Only advertise transcript ingestion, RAG or training after implementing and verifying it.

Delivered: Assistant now uses configurable OpenAI Responses, owned server history and role-filtered hybrid RAG. A floating window shows sources and truthful provider mode. Unsupported source errors no longer produce generic success output. Offline templates remain labelled; they do not self-train a model.

Verification: Backend chat/provider-input/privacy regression; Hindi/Gujarati retrieval UI; history persistence; live-provider quality pending.

Primary source: `backend/src/services/chat.service.js`.

Remaining validation/limit: Actual OpenAI generation, embeddings and multilingual follow-up quality require the exact local credential file path. No real provider success is claimed.

### F25 - Three-question selection generates five questions

Medium / Implemented locally

Original recommended fix: Agree one count contract across UI and backend; validate allowed counts and enforce the exact requested length for generated and fallback quizzes.

Delivered: API accepts only 3, 5 or 10 and enforces the exact requested length in offline and provider processing. Generated question enum fields match the quiz persistence contract.

Verification: Exact offline quiz count 3/5/10

Primary source: `backend/src/routes/ai.routes.js`.

Remaining validation/limit: Provider failure/fallback handling is covered locally; real provider output remains unverified.

### F26 - Catalog inputs return server errors or unbounded results

Medium / Implemented locally

Original recommended fix: Validate IDs, positive integer page, capped limit, category/level and sort allowlists. Return stable 400/404 errors without database details.

Delivered: Route IDs, page/limit bounds and supported sorts are validated. Removed price filters are rejected; production errors return safe messages without database stack traces.

Verification: Invalid catalog inputs and ID tests; removed min/max pricing filters rejected.

Primary source: `backend/src/utils/http.js`.

### F27 - Unreadable PDFs produce successful generic notes

Medium / Implemented locally

Original recommended fix: Require extracted text or explicitly disclose unreadable/scanned documents and OCR needs; validate file types/count/aggregate size and separate video-link-only behavior.

Delivered: Notes accept text PDFs or pasted transcripts, reject corrupt/no-text PDFs and video URLs without transcripts, and limit file count, per-file size and total uploaded bytes. The notes screen retains an inline source error instead of showing fabricated generated content.

Verification: Corrupt PDF rejected; Video source requires transcript; Notes generation labelled offline; UI-14 persistent transcript-required error with no generated notes.

Primary source: `backend/src/routes/ai.routes.js`.

Remaining validation/limit: Scanned documents require OCR outside this implementation.

### F28 - Discount price and payment amount disagree

Medium / Retired by payment removal

Original recommended fix: Define one server-side effective-price/currency calculation and use it for catalog, checkout, payment validation, accounting and receipts.

Delivered: Removed payment routes, handlers, gateway SDKs, checkout page, receipts, financial UI and pricing fields. Published courses enroll for free. Legacy financial fields are redacted and the backed-up local database was migrated without deleting learning records.

Verification: 115-test regression suite: legacy-priced courses enroll for free, financial payloads rejected, legacy fields redacted, removed gateway URLs return 404; UI-11 free classroom lifecycle.

Primary source: `backend/src/controllers/enrollment.controller.js`.

Remaining validation/limit: No payment provider integration remains; historical order collections are retained offline in the database and are not exposed by the app.

### F29 - Accessibility semantics are incomplete

Medium / Implemented locally

Original recommended fix: Connect label/htmlFor/id, add error associations, name icon controls, use real buttons for cards, and provide modal focus entry/trap/restore with Escape dismissal.

Delivered: Login has associated labels/error references. Named modal dialogs support focus entry/trapping/restoration and Escape. Cards are buttons; icon and sidebar controls have accessible names. Added shared workspace navigation, active states, skip link, associated legacy form labels, named quiz controls, floating assistant language controls and reduced-motion styling.

Verification: Accessible browser login; assignment modal Escape restores focus; flashcard Space/numeric controls; mobile close control; 390/1440px dashboard overflow checks; final quiz form labels and shell-preserving lazy loading.

Primary source: `frontend/src/hooks/useDialogFocus.ts`.

Remaining validation/limit: Keyboard/browser checks are targeted; no formal assistive-technology certification is claimed.

### F30 - Quality checks and regression suite are not ready

Medium / Implemented locally

Original recommended fix: Resolve meaningful lint failures, install/configure a real test runner, remove pass-with-no-tests as the only test expectation, and add regression cases for confirmed defects plus CI.

Delivered: Real Node integration suite replaces the missing Jest command. Added CI for Mongo-backed tests, both lint checks, types, build and audits; meaningful lint failures are corrected.

Verification: 115 backend tests pass; strict frontend/backend lint, TypeScript and production build pass. CI definition added; no hosted GitHub run claimed.

Primary source: `backend/test/portal.test.js`.

Remaining validation/limit: CI workflow is added locally; no GitHub run is claimed because changes were not pushed.

### F31 - Docker recipe expects a missing production artifact

Medium / Implemented locally

Original recommended fix: Choose a consistent development or production compose workflow; enable standalone for that runner, supply public variables at build time and remove incompatible production source mounts.

Delivered: Enabled standalone Next output. Docker uses non-root runners, build-time public API variables and no source mounts hiding artifacts. Both images build and run against local Mongo.

Verification: docker-build.txt; docker-runtime.json; browser Docker catalog verification

Primary source: `docker-compose.yml`.

Remaining validation/limit: Docker smoke uses isolated loopback ports and a separate empty QA database; no public deployment occurred.

### F32 - CORS allows every origin with credentials

Medium / Implemented locally

Original recommended fix: Use an exact configured origin allowlist and reject unknown origins. Keep authenticated endpoint permissions as the primary security control.

Delivered: CORS allows only exact configured frontend origins and denies untrusted origins. Permission checks remain mandatory on authenticated endpoints.

Verification: Unknown origin has no CORS access

Primary source: `backend/server.js`.

### F33 - Public certificate lookup exposes email addresses

Medium / Implemented locally

Original recommended fix: Return only fields needed for verification, and define recipient consent and revocation behavior.

Delivered: Public certificate verification returns only recipient display fields and credential data. Email is excluded; invalid/unbacked credentials are rejected. Direct PDF downloads work.

Verification: Public certificate email private and PDF works

Primary source: `backend/src/routes/user.routes.js`.

### F34 - Quick-start and public claims are inconsistent

Low / Implemented locally

Original recommended fix: Update setup to tested versions/env names, label sample curricula clearly, align free/paid wording and feature status, and read URL filters into state.

Delivered: Rewrote README, architecture and internship documentation for the payment-free app, optional server-side AI, role-filtered RAG and secure local setup. Public content, offline labels and notes export copy describe actual behavior.

Verification: Source/documentation review; local production build, Docker startup, classroom lifecycle and dashboard browser checks.

Primary source: `README.md`.

Remaining validation/limit: Real SMTP delivery, Cloudinary uploads, OpenAI quality, second-machine setup and public hosting are not validated in this local run.

## Remaining validation and handover

- Live OpenAI generation and semantic embeddings were not exercised: a credential file was selected, but its exact local path has not been supplied. Controlled provider mocks validate input assembly, history, failure and citation behavior; these do not validate model quality.

- SMTP inbox delivery and Cloudinary upload delivery still require real configured service credentials. Reset token lifecycle is covered using a local captured-email fixture. No external emails were sent by this QA run.

- No public deployment, push, hosted CI run, second-machine installation, cross-browser matrix, production-scale load test or formal WCAG certification is claimed.

- Offline study/quiz templates are generic examples that require instructor review. Seed curricula are labelled samples. The five-second QA video is a synthetic fixture, not course content. Project completion certificates are not academic accreditation.

- Watch-time heartbeats reduce trivial progress forgery but do not prove human attention. LLM output still needs factual review; permissions are enforced by database predicates rather than trusting model obedience.

- Before exposing any existing installation, rotate historical demo accounts and previously exposed secrets, use HTTPS and a private/authenticated database, back up and validate the free-access migration. These deployment-specific checks cannot be completed against an unknown live installation.

## Reproduce and run

See README.md for Node 22.22+, separate npm installs, MongoDB, server-only configuration and random local seed accounts. Run `npm test --prefix backend`, strict lint for both packages, frontend typecheck/build and both npm audits. `docker compose config` requires a fresh JWT_SECRET. Do not put provider keys into NEXT_PUBLIC variables.

The local application uses frontend http://localhost:3100 and API http://localhost:5100. The private QA MongoDB listens on 127.0.0.1:27028. Test credentials and backups remain in ignored `.audit-runtime/`; they are excluded from delivery archives. The archive contains source, locks, reviewed documentation, report and redacted evidence; dependencies/build outputs are excluded.

## Provider references

- https://developers.openai.com/api/docs/guides/embeddings

- https://developers.openai.com/api/docs/guides/text

- https://developers.openai.com/api/docs/guides/safety-best-practices

- https://developers.openai.com/api/docs/models/gpt-5.4-mini
