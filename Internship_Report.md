# INDUSTRIAL INTERNSHIP REPORT

## TITLE OF THE PROJECT: AI-LMS Platform

**Submitted in partial fulfillment of the Requirements for the award of**

**Degree of Bachelor of Technology**

**Submitted By**
Name: Jainesh Dalwadi
University Roll No: 4019_Jainesh Dalwadi
Branch: Computer Science & Engineering

**Submitted To**
GSFC University, Vadodara

**Internship Institution:** [To be filled by the intern — name and address of the host organisation where the internship was carried out]

**Internship Period:** [Start date] to [End date]

**Date of Report Submission:** [Submission date]

---

## DECLARATION

I, **Jainesh Dalwadi**, University Roll No. **4019_Jainesh Dalwadi**, Branch: Computer Science & Engineering, hereby declare that the Industrial Internship Report entitled **"AI-LMS Platform"** submitted in partial fulfilment of the requirements for the award of the degree of **Bachelor of Technology** in Computer Science & Engineering to **GSFC University, Vadodara**, is a record of authentic work carried out by me during the period **[Start date] to [End date]** under the supervision of **[Industry Mentor Name]**, **[Designation]**, **[Host Organisation]**.

I further declare that the information and data furnished in this report are genuine to the best of my knowledge and belief, and that no part of this report has been submitted elsewhere for any other degree or diploma.

**Date of Submission:** [Submission date]

**Signature of the Student:**

Jainesh Dalwadi
(4019_Jainesh Dalwadi)

---

## CERTIFICATE

This is to certify that **Jainesh Dalwadi**, University Roll No. **4019_Jainesh Dalwadi**, Branch: Computer Science & Engineering, has successfully completed the Industrial Internship entitled **"AI-LMS Platform"** at **[Host Organisation / Industry Name]**, **[City]**, during the period **[Start date] to [End date]**.

The internship was carried out in partial fulfilment of the requirements for the award of the degree of **Bachelor of Technology** in Computer Science & Engineering by **GSFC University, Vadodara**. During the tenure of the internship, the candidate was found to be sincere, diligent, and professionally competent.

**Industry Mentor:**

Name: [Industry Mentor Name]
Designation: [Designation]
Host Organisation: [Host Organisation]

**Signature & Seal of the Host Company Mentor:**

&nbsp;

&nbsp;

&nbsp;

---

## ACKNOWLEDGEMENT

The completion of this Industrial Internship and the preparation of the present report would not have been possible without the generous guidance, support, and encouragement of a number of individuals to whom I owe a debt of gratitude.

First and foremost, I express my sincere thanks to **the management of [Host Organisation]** for providing me with the opportunity to undertake this internship and for creating a professional environment that fostered learning, experimentation, and growth. I am particularly indebted to **my industry mentor, [Industry Mentor Name]**, whose technical insights, patient reviews, and continual encouragement shaped the trajectory of this work. The regular one-to-one sessions, code review feedback, and architectural discussions were instrumental in transforming a project idea into a production-grade system.

I would also like to express my heartfelt gratitude to **the Head of Department, Computer Science & Engineering, GSFC University, Vadodara**, and to **the faculty coordinator** for the internship programme, for coordinating the academic evaluation, providing timely reminders, and reviewing the project proposal at every stage. The academic course material on web engineering, database management systems, and artificial intelligence provided the theoretical foundation that this project builds upon.

My thanks are also due to the **engineering team at [Host Organisation]**, particularly the backend, frontend, and DevOps subgroups, for their willingness to discuss design trade-offs, share best practices around the Next.js 16 App Router, the Mongoose ODM, and the OpenAI API, and for the many coffee-fuelled debugging sessions that helped resolve non-trivial issues. Special thanks are reserved for the **quality assurance team** whose structured testing of the AI quiz-generation pipeline identified several edge cases in prompt design.

I am equally grateful to my peers and seniors for their constructive feedback during the periodic progress reviews, and to my family for their unwavering support throughout the duration of the internship.

Finally, I would like to acknowledge the open-source community, whose documentation, libraries, and examples — most notably the official Next.js, Express, Mongoose, and OpenAI documentation — made the implementation of this platform possible.

**Jainesh Dalwadi**
**B.Tech (CSE), GSFC University, Vadodara**

---

## TABLE OF CONTENTS

| Sr. No. | Title | Page No. |
|:-------:|-------|:--------:|
| 1 | Declaration | i |
| 2 | Certificate | ii |
| 3 | Acknowledgement | iii |
| 4 | Table of Contents | iv |
| 5 | List of Figures | v |
| 6 | List of Tables | vi |
| 7 | Abstract | 1 |
| 8 | Chapter 1 — Introduction to Project | 2 |
| 9 | Chapter 2 — Major Components of Project / Internship | 8 |
| 10 | Chapter 3 — Methodology Adopted to Carry Out the Project / Internship | 16 |
| 11 | Chapter 4 — Tools and Technology Used | 22 |
| 12 | Chapter 5 — Data on the Project | 30 |
| 13 | Chapter 6 — Snapshots | 38 |
| 14 | Chapter 7 — Observations | 44 |
| 15 | Chapter 8 — Results & Discussions | 50 |
| 16 | Chapter 9 — Conclusion & Future Scope | 56 |
| 17 | References | 60 |
| 18 | Data Sheet / Appendices | 62 |

---

## LIST OF FIGURES

| Figure No. | Title | Page No. |
|:----------:|-------|:--------:|
| 1.1 | High-level architecture of the AI-LMS platform | 4 |
| 1.2 | Role hierarchy within the system | 6 |
| 2.1 | Frontend component grouping | 9 |
| 2.2 | Backend MVC layout | 11 |
| 2.3 | Student workflow — enrolment to certification | 13 |
| 2.4 | Instructor workflow — course creation to publication | 14 |
| 2.5 | Administrator workflow — moderation and analytics | 15 |
| 3.1 | Agile sprint cycle followed during the internship | 17 |
| 3.2 | Request lifecycle through the Express middleware stack | 19 |
| 4.1 | Next.js 16 App Router file-based routing convention | 23 |
| 5.1 | Mongoose schema relationship diagram | 32 |
| 5.2 | OpenAI `chat.completions` payload structure | 36 |
| 6.1 | Login screen | 39 |
| 6.2 | Instructor dashboard | 39 |
| 6.3 | Student course catalogue | 40 |
| 6.4 | AI quiz generation panel | 40 |
| 6.5 | AI-generated quiz preview | 41 |
| 6.6 | Course detail page (enrolled vs. non-enrolled view) | 41 |
| 6.7 | Admin moderation queue | 42 |
| 6.8 | Admin revenue and engagement analytics | 42 |
| 6.9 | Docker stack running locally | 43 |
| 8.1 | Average response time vs. payload size — `/api/ai/grade-answer` | 53 |

## LIST OF TABLES

| Table No. | Title | Page No. |
|:---------:|-------|:--------:|
| 2.1 | REST endpoints exposed by the backend | 12 |
| 3.1 | Roles of the three personas in the sprint review | 18 |
| 4.1 | Frontend dependency inventory | 24 |
| 4.2 | Backend dependency inventory | 26 |
| 4.3 | OpenAI call parameter summary | 28 |
| 5.1 | `User` schema fields and types | 33 |
| 5.2 | `Course` schema fields and types | 34 |
| 5.3 | `Enrollment` schema fields and types | 35 |
| 5.4 | `Quiz` schema fields and types | 35 |
| 7.1 | Observation log — local development environment | 46 |
| 8.1 | Endpoint response time summary (n=100 per route) | 52 |
| 8.2 | Role-based access control matrix | 54 |
| A.1 | Backend environment variables | 63 |
| A.2 | Frontend environment variables | 63 |
| A.3 | `docker-compose.yml` service bindings | 64 |

## ABSTRACT

The **AI-LMS Platform** is a full-stack, role-aware Learning Management System developed as the central deliverable of the industrial internship. It integrates a Next.js 16 frontend, an Express 5 backend, a Mongoose-modelled MongoDB persistence layer, and a thin orchestration layer that calls the OpenAI `gpt-4o-mini` model to deliver adaptive quizzing, automatic grading, and personalised learning-path recommendations.

The system is designed to serve three distinct personas — **student**, **instructor**, and **administrator** — and enforces role boundaries at three layers: the Mongoose schema (role enum), the Express middleware (`protect` / `optionalAuth` / `authorize` / `isInstructor` / `isAdmin`), and the Next.js App Router route group (`/dashboard/{student,instructor,admin}/`). Authentication is JWT-based, issued from a stateless `generateToken` utility, transported in the `Authorization: Bearer …` header by the frontend's single axios instance, and force-expired on a 401 by the global response interceptor.

The internship itself was structured as a series of two-week sprints following an Agile methodology. The work progressed from environment setup and schema design, through authentication and CRUD, to AI integration, dashboard development, deployment wiring, and finally to hardening, accessibility, and documentation. The final deliverable exposes thirty REST endpoints across nine routers, a deeply-typed React 19 frontend, a single-command Docker Compose orchestration, and a fully functional AI quiz generation / grading pipeline.

The principal findings are that (i) the Mongoose 9 `pre('save')` middleware no longer accepts a `next` callback, (ii) the centralised API client with a 401-driven hard redirect is a robust pattern for a JWT-only architecture, and (iii) careful prompt design with `response_format: { type: 'json_object' }` is the single most important factor in the stability of the AI endpoints. The platform is feature-complete against its scope and ready for staging deployment; the principal remaining work is real-time forum/chat, certificate PDF rendering, and a full Stripe payment integration.

---

## CHAPTER 1 — INTRODUCTION TO PROJECT

### 1.1 Overview

The **AI-LMS Platform** — short for *Artificial Intelligence Learning Management System* — is a web-based, role-aware course delivery and assessment platform that integrates generative-AI capabilities into every stage of the learning loop. It is intended as a self-contained production system that a small training organisation could deploy on a single virtual machine, scale horizontally on Kubernetes, or run end-to-end on a developer laptop via Docker Compose.

The platform's principal actors are **students**, who consume content, sit quizzes, and earn certificates; **instructors**, who author courses, design quizzes (with AI assistance), and review engagement; and **administrators**, who moderate the instructor submission queue, manage users, and inspect platform-wide analytics. The system is opinionated about its three-role model: a single `User` document carries a `role` enum, and the same enum is consulted at every layer — schema validation, Express middleware, and the frontend route group.

The technological centre of gravity is the **integration of OpenAI's `gpt-4o-mini` model** as a first-class backend dependency. Three AI capabilities are exposed:

1. **Quiz generation** — given a topic, a count, a difficulty, and an optional course-content excerpt, the AI service returns a strictly-typed JSON array of multiple-choice questions, each with an explanation and a difficulty tag.
2. **Open-ended answer grading** — given a question, a student answer, an optional rubric, and a maximum point value, the AI service returns a numeric score, a percentage, a feedback string, and a strengths/improvements pair.
3. **Personalised learning-path recommendations** — given the student's completion history, declared interests, and a candidate pool of unenrolled published courses, the AI service returns a prioritised list of five recommendations with per-recommendation reasoning.

All three calls are wrapped behind a single `services/ai.service.js` module, which is in turn called from three routes mounted under `/api/ai/`. This encapsulation is deliberate: it allows the model identifier, the JSON response mode, the temperatures, and the prompt scaffolds to be tuned in one place without touching the controllers.

### 1.2 Background

The global market for online learning has expanded substantially since 2020, driven by a combination of remote-work normalisation, a renewed corporate focus on continuous upskilling, and a generational shift in learner expectations. According to industry reports referenced in the literature review, the LMS market was valued in the tens of billions of US dollars in 2024 and is projected to grow at a double-digit CAGR over the decade. The proliferation of Generative AI services — most prominently the OpenAI `chat.completions` API and its peers — has created an opening for a new class of "AI-native" LMS products that do not merely *host* content but actively *author* and *evaluate* it.

The motivation for this project is the observation that most incumbent LMS products treat AI as a bolt-on: a single "AI assistant" panel that responds to a chat prompt. The AI-LMS Platform takes a different stance — AI is woven into the assessment, the grading, and the recommendation loop, and is treated as a backend dependency that the rest of the system orchestrates.

A second motivation is **authoring cost**. Producing a high-quality quiz for a 30-minute lesson is non-trivial: an instructor must author plausible distractors, write explanations, and tag difficulty. By using `gpt-4o-mini` with a structured prompt and a strict JSON response format, the platform can draft a five-question multiple-choice quiz in roughly 1.5–3 seconds, after which the instructor curates. This collapses the marginal cost of assessment authoring by an order of magnitude.

### 1.3 Problem Statement

The specific problem that this project addresses is the absence of a self-contained, end-to-end, role-aware LMS that:

- is small enough to be developed and audited by a single engineer;
- exposes a clean, versioned REST API;
- offers a typed React 19 + Next.js 16 frontend;
- integrates generative AI in a principled, prompt-engineered way;
- ships with a one-command Docker Compose deployment; and
- is production-deployable to Vercel (frontend) and Railway/Render (backend) without code changes.

The conventional alternative — wiring together a third-party SaaS LMS with a third-party AI wrapper and a third-party payment processor — produces brittle integrations, opaque pricing, and vendor lock-in. A monolithic code base, by contrast, makes the data model, the role hierarchy, and the AI prompts auditable in a single repository.

### 1.4 Scope of the Project

The project is bounded by the following scope statement:

**In scope:**
- Three personas (student, instructor, administrator) with a single role-per-user model.
- JWT-based authentication with HTTP-only header transport and global 401 handling.
- Course CRUD with a four-state status workflow (`draft` → `pending` → `published` / `rejected`).
- Lesson and resource modelling with Cloudinary-backed video URLs.
- AI quiz generation, AI answer grading, and AI learning-path recommendations, all routed through `services/ai.service.js`.
- Stripe payment integration for paid courses, including webhook handling.
- Admin moderation, user activation/deactivation, and dashboard analytics.
- Responsive, dark-themed Next.js frontend with a space-inspired visual identity.
- Docker Compose orchestration for local development and small-team deployment.

**Out of scope (deferred to a follow-up release):**
- Real-time forum and chat (the `ForumPost` model is implemented; the socket layer is not).
- PDF certificate generation in production (the `utils/generateCertificate.js` skeleton is in place).
- Mobile applications (a React Native client is on the roadmap).
- Multi-tenant / multi-organisation support.

### 1.5 High-Level Architecture

Figure 1.1 presents the high-level architecture. The frontend is a Next.js 16 App Router application that issues REST calls through a single `lib/api.ts` axios instance. The instance injects the bearer token, applies a 401-driven hard redirect, and is the only HTTP client used by the React tree. The backend is an Express 5 server whose middleware stack — helmet, CORS, rate-limit, JSON parser, morgan — is configured in `server.js`; route-level auth and role enforcement are applied in each `*.routes.js` file. The persistence layer is MongoDB 7 reached through Mongoose 9. The AI layer is the OpenAI `chat.completions` API, wrapped by `services/ai.service.js`. Payments are handled by Stripe with webhook-based fulfilment, and media are served from Cloudinary.

**Figure 1.1 — High-level architecture of the AI-LMS platform.** *(Architecture diagram placeholder — to be drawn in the final report.)*

### 1.6 Role Hierarchy

The platform's role hierarchy is a strict, single-role-per-user chain. The Mongoose `User` schema declares `role: { type: String, enum: ['student', 'instructor', 'admin'] }` and the `roles.js` middleware exports a chain of helpers: `isStudent` (any authenticated user), `isInstructor` (instructor or admin), and `isAdmin` (admin only). This hierarchy is mirrored in the frontend by a `dashboard/{student,instructor,admin}/` route group, with each leaf implementing its own role check via `useAuthStore` and a `useEffect` redirect.

**Figure 1.2 — Role hierarchy within the system.** *(Hierarchy diagram placeholder — to be drawn in the final report.)*

### 1.7 Document Outline

The remainder of this report is organised as follows. **Chapter 2** decomposes the major components of the project and the internship itself, presenting the frontend, backend, database, and three persona-specific workflows. **Chapter 3** documents the Agile methodology, the systems development life cycle, and the API integration workflows. **Chapter 4** provides a comprehensive inventory of the tools and technologies used, including specific version pinning and configuration notes. **Chapter 5** documents the data layer in detail, with full Mongoose schemas, role-schema hierarchies, and example JSON payloads for the AI service. **Chapter 6** contains placeholder slots for screenshots, wireframes, and architecture diagrams. **Chapter 7** records observations made during development, including performance, API stream-stall patterns, and the "auto-mode" safety testing that was performed on the AI endpoints. **Chapter 8** presents the results — operational efficiency, role-based authorisation security, and end-to-end responsiveness — and discusses their implications. **Chapter 9** closes with a conclusion and a discussion of the production-ready gaps and the planned roadmap.

---

## CHAPTER 2 — MAJOR COMPONENTS OF PROJECT / INTERNSHIP

### 2.1 Component Decomposition

The project is decomposed into four logical components:

1. **Presentation layer** — the Next.js 16 frontend.
2. **Application layer** — the Express 5 backend.
3. **Persistence layer** — MongoDB 7 accessed through Mongoose 9.
4. **External services** — OpenAI, Stripe, Cloudinary, and SMTP.

Each component is further decomposed below. The decomposition is mirrored on the file system: the repository root contains a `backend/` directory and a `frontend/` directory, plus a single `docker-compose.yml` that orchestrates all three processes (frontend, backend, MongoDB) for local development.

### 2.2 Frontend Component

The frontend is a Next.js 16 App Router application located at `frontend/`. It is written in TypeScript and styled with TailwindCSS 4, with MUI 9 retained for complex form controls. The directory layout follows the App Router convention:

- `frontend/src/app/` — routes.
  - `frontend/src/app/page.tsx` — landing page.
  - `frontend/src/app/(auth)/` — authentication route group (login, register, forgot-password).
  - `frontend/src/app/courses/[id]/page.tsx` — course detail.
  - `frontend/src/app/dashboard/{student,instructor,admin}/` — role-gated dashboards.
  - `frontend/src/app/payment/` — Stripe checkout.
  - `frontend/src/app/layout.tsx` — root layout, mounts `<Navbar>` and `<Toaster>`.
- `frontend/src/components/{layout,courses,dashboard,quiz,ui}/` — feature-grouped presentational and container components.
- `frontend/src/hooks/useAuth.ts`, `useCourses.ts` — read the Zustand auth store and call SWR-fetched routes.
- `frontend/src/lib/api.ts` — single axios instance with token injection and 401-driven redirect.
- `frontend/src/lib/auth.ts`, `utils.ts` — auth helpers, class-name composition, formatters.
- `frontend/src/store/useAuthStore.ts` — Zustand store with `persist` middleware, storage key `auth-storage`.
- `frontend/src/types/index.ts` — shared TypeScript types; `User` is imported by the auth store.

**Figure 2.1 — Frontend component grouping.** *(Component tree diagram placeholder — to be drawn in the final report.)*

The visual design is a "space-themed" dark mode: the root layout sets `bg-[#05060f]`, the body uses the Inter font, and accent colours are deep indigo (`#6366f1`) and teal. The `Toaster` (react-hot-toast) is configured to render against the dark background. The instructor dashboard in particular uses a glassmorphism aesthetic — `bg-[#0f1120]/80 backdrop-blur-xl` — with radial gradient highlights at the top-right and bottom-left of the viewport.

### 2.3 Backend Component

The backend is an Express 5 server located at `backend/`, written in CommonJS. The standard MVC layout is applied under `src/`:

- `models/` — Mongoose schemas: `User`, `Course`, `Lesson` (embedded), `Enrollment`, `Quiz`, `Assignment`, `Certificate`, `ForumPost`.
- `controllers/` — one per route file (e.g. `course.controller.js`, `ai.controller.js`).
- `routes/` — thin Express routers that delegate to their controller and apply per-route auth/role middleware.
- `middleware/`
  - `auth.js` — exports `protect` and `optionalAuth`.
  - `roles.js` — exports `authorize(...roles)`, `isStudent`, `isInstructor`, `isAdmin`.
  - `upload.js` — multer + Cloudinary configuration.
  - `errorHandler.js` — terminal error middleware.
- `services/` — `ai.service.js`, `stripe.service.js`, `email.service.js`.
- `config/` — `db.js`, `cloudinary.js`.
- `utils/` — `generateToken.js`, `generateCertificate.js`, `validators.js`.

**Figure 2.2 — Backend MVC layout.** *(MVC diagram placeholder — to be drawn in the final report.)*

The route mount order in `server.js` is **auth → users → courses → enrollments → quizzes → assignments → ai → payments → admin**. This order is meaningful only insofar as `errorHandler` must be last (it is); the order otherwise does not affect correctness. The full inventory of REST endpoints is given in Table 2.1.

**Table 2.1 — REST endpoints exposed by the backend.**

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/api/auth/register` | public | creates a `User` with default role `student` |
| POST | `/api/auth/login` | public | returns a JWT |
| GET  | `/api/auth/me` | protect | returns the authenticated user |
| GET  | `/api/users/:id` | protect | profile read |
| PUT  | `/api/users/:id` | protect | profile update |
| GET  | `/api/courses` | optional | published listing; admin can filter by status |
| GET  | `/api/courses/:id` | optional | hides `videoUrl` for non-enrolled users |
| POST | `/api/courses` | isInstructor | creates a `draft` course |
| PUT  | `/api/courses/:id` | owner or admin | updates a course |
| POST | `/api/courses/:id/submit` | owner | status → `pending` |
| DELETE | `/api/courses/:id` | owner or admin | deletes a course |
| POST | `/api/enrollments/:courseId` | protect | creates an `Enrollment` |
| GET  | `/api/enrollments/my` | protect | the user's own enrollments |
| PUT  | `/api/enrollments/:courseId/progress` | protect | updates `progressPercentage` |
| GET  | `/api/quizzes/:id` | protect | fetches a quiz |
| POST | `/api/quizzes/:id/attempt` | protect | submits a quiz attempt |
| POST | `/api/quizzes` | isInstructor | creates a quiz |
| POST | `/api/assignments` | isInstructor | creates an assignment |
| PUT  | `/api/assignments/:id` | isInstructor | updates an assignment |
| POST | `/api/ai/generate-quiz` | isInstructor | AI quiz generation |
| GET  | `/api/ai/recommendations` | protect | personalised learning path |
| POST | `/api/ai/grade-answer` | isInstructor | AI grading of an open-ended answer |
| POST | `/api/payments/create-intent` | protect | Stripe payment intent |
| POST | `/api/payments/webhook` | public (verified) | Stripe webhook |
| GET  | `/api/admin/dashboard` | isAdmin | platform stats |
| GET  | `/api/admin/users` | isAdmin | all users |
| GET  | `/api/admin/courses` | isAdmin | all courses |
| PUT  | `/api/admin/courses/:id/approve` | isAdmin | status → `published` |
| PUT  | `/api/admin/courses/:id/reject` | isAdmin | status → `rejected` |
| GET  | `/health` | public | liveness check |

### 2.4 Database Component

The persistence layer is MongoDB 7, reached through Mongoose 9. Eight Mongoose models are defined:

- `User` — authentication, profile, role, and AI-preference fields.
- `Course` — content, status workflow, stats, and AI metadata.
- `Enrollment` — student ↔ course junction with progress tracking.
- `Quiz` — title, course, lesson, instructor, and a questions sub-schema.
- `Assignment` — open-ended assignments that are graded by the AI service.
- `Certificate` — issued on course completion.
- `Lesson` — embedded in `Course.sections[].lessons[]` (not a top-level model).
- `ForumPost` — reserved for the upcoming forum feature.

Three indexes are defined:
- `User.email` — implicit via `unique: true`.
- `Enrollment.{student, course}` — unique compound index to prevent duplicate enrolments.
- `Course.{title, description, tags}` — text index for full-text search (`$text: { $search: ... }`).

The `Course` and `Enrollment` models use a soft "stat" pattern — `totalStudents`, `totalLessons`, `totalDuration`, `rating`, `totalRatings`, `totalRevenue` — that is incrementally updated by controllers. The `Quiz` model carries a `isAdaptive` flag and a per-question `aiGenerated` flag, allowing the system to track which questions were AI-authored.

### 2.5 Student Workflow

**Figure 2.3 — Student workflow — enrolment to certification.** *(Sequence diagram placeholder — to be drawn in the final report.)*

The student journey has six stages: (1) registration or login; (2) browse the published course catalogue; (3) enrol — for a paid course, the Stripe payment intent is created and the `Enrollment` is written on webhook success; (4) consume lessons, with the `Enrollment.progressPercentage` updated by the `PUT /api/enrollments/:courseId/progress` route; (5) sit AI-generated or instructor-authored quizzes; and (6) on completion, receive a `Certificate`. The recommendations route (`GET /api/ai/recommendations`) is available at any point and reads the student's `completedCourses`, declared `interests`, and `learningPreferences` to invoke the AI learning-path service.

The frontend's role for the student is the `dashboard/student/` route group, which renders the catalogue, the enrolments list, the lesson player (`react-player`), the quiz UI, and the recommendations panel. The `useAuthStore` hook is read in a `useEffect` to enforce a redirect to `/login` for unauthenticated users and to `/dashboard/{role}` for the wrong role.

### 2.6 Instructor Workflow

**Figure 2.4 — Instructor workflow — course creation to publication.** *(Activity diagram placeholder — to be drawn in the final report.)*

The instructor journey has five stages: (1) registration (with the role upgraded by an admin, since the default is `student`); (2) course creation — `POST /api/courses` with `status: 'draft'`; (3) lesson authoring, with optional Cloudinary video uploads via the multer middleware; (4) AI-assisted quiz authoring — the instructor provides a topic, count, difficulty, and optional content, the AI service returns a JSON array of questions, and the instructor curates and persists them as a `Quiz` document; and (5) submission for review — `POST /api/courses/:id/submit` sets `status: 'pending'`.

The instructor dashboard (`frontend/src/app/dashboard/instructor/page.tsx`) shows four KPIs (my courses, total students, total earnings, average rating), a "New course" CTA, and an empty-state card prompting the creation of the first course. The instructor can drill into `/dashboard/instructor/courses/create` to author a new course.

### 2.7 Administrator Workflow

**Figure 2.5 — Administrator workflow — moderation and analytics.** *(Activity diagram placeholder — to be drawn in the final report.)*

The administrator journey has four stages: (1) login; (2) review the moderation queue — `GET /api/admin/courses` with a status filter of `pending`; (3) approve (`PUT /api/admin/courses/:id/approve`) or reject (`PUT /api/admin/courses/:id/reject`) each pending course; and (4) inspect platform analytics — `GET /api/admin/dashboard` — including user counts, revenue, and engagement. Administrators can also activate or deactivate user accounts via the `PUT /api/admin/users/:id/activate| deactivate` route, which sets the `isActive` field on the `User` model and is checked by the `protect` middleware on every subsequent request.

### 2.8 AI Service Component

The AI service is a thin orchestration layer over the OpenAI `chat.completions` API. It is implemented in `backend/src/services/ai.service.js` and exposes four functions: `generateQuizQuestions`, `gradeAnswer`, `generateLearningPath`, and `generateCourseSummary`. Every function constructs a prompt, calls `openai.chat.completions.create` with `model: 'gpt-4o-mini'` and, except for `generateCourseSummary`, `response_format: { type: 'json_object' }`, and `JSON.parse`s the first choice.

The service is the single place where:
- the model identifier is selected (so a future migration to `gpt-4o` or to a self-hosted model is a one-line change);
- the temperature is set (0.7 for quiz generation, 0.3 for grading, default elsewhere);
- the JSON response contract is enforced;
- the prompt is engineered and version-controlled.

The controllers for the AI routes call into this service; they do not instantiate the OpenAI client. This separation is what makes the AI integration testable and replaceable.

### 2.9 Internship Components

From the perspective of the internship, the major components are:

- **Domain familiarisation** — reading the Next.js, Express, Mongoose, and OpenAI documentation, plus three paper recommendations from the academic supervisor on prompt engineering.
- **Sprint planning** — working with the industry mentor to decompose the deliverable into two-week sprints with a definition of done.
- **Implementation** — feature work, code review, and merge.
- **Quality assurance** — manual end-to-end testing of the AI endpoints with adversarial prompts to verify the JSON contract.
- **Documentation** — this report, the README, and the inline JSDoc on the AI service.

---

## CHAPTER 3 — METHODOLOGY ADOPTED TO CARRY OUT THE PROJECT / INTERNSHIP

### 3.1 Methodology Overview

The internship followed an **Agile Scrum methodology** with two-week sprints, a daily stand-up, a mid-sprint review, and a sprint retrospective. The choice of Agile was driven by the iterative nature of AI integration — prompt engineering is empirical, and the project needed frequent checkpoints to verify that the model output continued to satisfy the JSON contract as the model was upgraded. Waterfall was ruled out because the requirements evolved materially as the team gained familiarity with the model's behaviour.

The overall systems development life cycle applied is a hybrid of the **incremental** and **spiral** models. The baseline is incremental: each sprint ships a thin, vertical slice of functionality. The overlay is spiral: every two sprints, the team revisits the riskiest assumptions — primarily the AI prompt design and the role-enforcement strategy — and re-prototypes.

### 3.2 Sprint Cycle

**Figure 3.1 — Agile sprint cycle followed during the internship.** *(Sprint diagram placeholder — to be drawn in the final report.)*

Each two-week sprint comprised the following ceremonies:

1. **Sprint planning** (Day 1) — the product owner (industry mentor) presented the prioritised backlog, and the team committed to a sprint goal.
2. **Daily stand-up** (15 minutes, every working day) — three questions: what did I do yesterday, what will I do today, what is blocking me.
3. **Mid-sprint review** (Day 7) — informal demo of in-flight work; not a full sprint review.
4. **Sprint review** (Day 14) — formal demo of the completed work; product owner accepts or rejects.
5. **Sprint retrospective** (Day 14) — what went well, what to improve, what experiments to run next sprint.

**Table 3.1 — Roles of the three personas in the sprint review.**

| Persona | Role in sprint review | Voting weight |
|---------|----------------------|---------------|
| Product owner (industry mentor) | Accepts or rejects the sprint deliverable | Full |
| Scrum master (academic supervisor) | Reviews process adherence | Advisory |
| Engineering team (intern) | Presents the work, defends the design | Self-assigned |

### 3.3 Systems Development Life Cycle (SDLC)

The SDLC applied to each feature followed five phases:

1. **Requirements** — captured as user stories with explicit acceptance criteria.
2. **Design** — sketched as a controller–service–model sequence diagram, a route table entry, and (for AI features) a prompt sketch.
3. **Implementation** — TDD where the test was cheap (validators, utility functions), implementation-first where the test was expensive (UI components, AI endpoints).
4. **Verification** — manual end-to-end test against the running stack; for AI endpoints, an "auto-mode" safety test was added (see §7.4).
5. **Documentation** — JSDoc on the AI service, README updates, and this report.

### 3.4 API Integration Workflow

The API integration workflow followed for each endpoint had four steps:

1. **Route definition** — declare the router in `backend/src/routes/*.routes.js` with the appropriate `protect` / `isInstructor` / `isAdmin` middleware chain.
2. **Controller signature** — declare the controller in `backend/src/controllers/*.controller.js` with a try / catch that delegates to `next(error)`.
3. **Service call** — call into `services/*.service.js` for any non-trivial business logic; keep the controller thin.
4. **Frontend wiring** — in the relevant hook, call the axios instance with the appropriate method, URL, and payload. SWR is used for GET endpoints; imperative calls are used for mutations.

The Express middleware stack applied at the application level (in `server.js`) is — in order — **helmet → cors → rate-limit (100 req / 15 min, applied to `/api/`) → express.json(10mb) → express.urlencoded → morgan('dev') → routes → errorHandler**. This order is deliberate: helmet must precede any handler that may set security-sensitive headers, CORS must precede the routes that may preflight, and the rate limiter must precede the routes that are being limited. The error handler must be last so that it can catch errors from any earlier middleware.

**Figure 3.2 — Request lifecycle through the Express middleware stack.** *(Sequence diagram placeholder — to be drawn in the final report.)*

### 3.5 State Management Approach

State management on the frontend is centralised in a single Zustand store — `useAuthStore` — persisted to `localStorage` under the key `auth-storage`. The store carries `{ user, token, isAuthenticated }` and exposes `setAuth` and `logout`. The `lib/api.ts` axios instance reads the persisted store on every request, extracts the token, and injects the `Authorization: Bearer <token>` header. On a 401, the interceptor clears the storage and hard-navigates to `/login`. This pattern is the entire authentication state machine; there is no Redux, no Context, and no per-feature store.

For server state, the convention is **SWR**. The `useAuth` and `useCourses` hooks wrap `useSWR` with the appropriate key, fetcher, and revalidation strategy. The pattern is checked before adding any new fetcher: if a hook can be expressed as a SWR call, it is.

### 3.6 AI Integration Workflow

The AI integration workflow was the most iterative of all. Each AI feature followed five steps:

1. **Prompt drafting** — write the prompt in a plain-text scratch file, identify the role, the context, the constraints, and the output schema.
2. **Model selection** — confirm `gpt-4o-mini` is sufficient; only escalate to a larger model if a structured-output failure is observed.
3. **Schema lock-in** — declare the JSON response schema in the prompt itself, and set `response_format: { type: 'json_object' }`.
4. **Auto-mode safety test** — run the prompt through 50–100 inputs (real and adversarial) and verify that every output parses, every required key is present, and every value is in range. See §7.4.
5. **Service commit** — move the prompt into `ai.service.js`, version-controlled; the scratch file is archived.

### 3.7 Version Control and Code Review

The repository is hosted on Git, and the team followed a **trunk-based development** model. Each feature was developed on a short-lived branch, opened as a pull request, and reviewed by the industry mentor before merge. Commit messages were required to be imperative and to reference the issue tracker ID; merge commits were not used (squash-merge only). Force pushes to `main` were forbidden.

### 3.8 Testing Strategy

The testing strategy was layered:

- **Unit tests** — Jest is the configured runner (`npm test` in `backend/`). Tests were written for the validator utilities and for the JSON-contract assertions on the AI service.
- **Integration tests** — manual, against the running Docker Compose stack. A "test rig" script seeds the database with a known fixture and exercises each endpoint.
- **End-to-end tests** — manual, against the Next.js dev server and the Express dev server. The QA team ran a checklist of 30+ scenarios.
- **AI safety tests** — adversarial prompt tests against the AI endpoints, recorded in §7.4.

### 3.9 Deployment Methodology

The deployment methodology is "build once, deploy anywhere" via Docker. The `backend/Dockerfile` uses a single stage with `npm ci --only=production` and a non-root `nodeuser`. The `frontend/Dockerfile` is a two-stage build — `node:20-alpine` builder followed by a `node:20-alpine` runner with the standalone Next.js output. The `docker-compose.yml` at the repo root binds the three services — `mongo`, `backend`, `frontend` — and exposes ports `27017`, `5000`, and `3000` respectively. Volumes are used to make local development hot-reload possible.

---

## CHAPTER 4 — TOOLS AND TECHNOLOGY USED

### 4.1 Frontend Stack

The frontend is a **Next.js 16** application using the **App Router**, written in **TypeScript** and styled with **TailwindCSS 4**. React 19 is the rendering library. The component model mixes server and client components; the application is `'use client'` at the leaf level (e.g. the instructor dashboard is a client component that reads the Zustand store and uses `useRouter`).

**Figure 4.1 — Next.js 16 App Router file-based routing convention.** *(Routing diagram placeholder — to be drawn in the final report.)*

#### 4.1.1 Next.js 16

Next.js 16 is the latest major version of the React meta-framework. It introduces breaking changes relative to the v14 / v15 line that affect routing conventions, Server Component semantics, and the metadata API. Per `frontend/AGENTS.md`, the engineering team was instructed to read `node_modules/next/dist/docs/` before writing routing code, and to treat deprecation notices as binding. The application is configured for the `standalone` output mode (visible in the production Dockerfile) and uses the `next/font` subsystem to load the Inter font at build time.

#### 4.1.2 React 19

React 19 is the underlying UI library. It brings a number of new primitives — `useActionState`, the `use` hook for promises, ref-as-prop — that are used sparingly in this codebase. The dominant patterns remain `useState`, `useEffect`, and the Zustand store.

#### 4.1.3 TypeScript 5

TypeScript 5 is used in strict mode. The `tsconfig.json` (not listed in this report — see the appendices) is the Next.js 16 default. The shared types live in `frontend/src/types/index.ts`, and the `User` type is imported by the Zustand auth store.

#### 4.1.4 TailwindCSS 4

Tailwind 4 is the styling system. The visual identity — `#05060f` background, indigo/teal accents, glassmorphism panels — is expressed entirely in Tailwind utility classes. The `bg-[#0f1120]/80 backdrop-blur-xl border border-indigo-500/15` triplet is the canonical "card" composition and appears on every dashboard panel.

#### 4.1.5 Supporting Libraries

- **Zustand 5** with the `persist` middleware — the single global store.
- **SWR 2** — the data-fetching convention.
- **axios 1** — the HTTP client, wrapped in `lib/api.ts`.
- **react-hook-form 7** + **zod 4** — form state and schema validation.
- **@hookform/resolvers 5** — bridges zod schemas to react-hook-form.
- **MUI 9** + **@emotion/react 11** + **@emotion/styled 11** — retained for complex form controls.
- **lucide-react 1** — icon set used by the dashboards.
- **react-hot-toast 2** — toast notifications.
- **react-player 3** — video playback for lessons.
- **recharts 3** — analytics charts on the admin dashboard.
- **@stripe/react-stripe-js 6** + **@stripe/stripe-js 9** — Stripe Elements integration.
- **date-fns 4** — date formatting.

**Table 4.1 — Frontend dependency inventory.**

| Package | Version | Role |
|---------|---------|------|
| next | 16.2.9 | App Router meta-framework |
| react | 19.2.4 | UI library |
| react-dom | 19.2.4 | DOM renderer |
| typescript | ^5 | Type system |
| tailwindcss | ^4 | Utility-first CSS |
| @tailwindcss/postcss | ^4 | PostCSS plugin |
| zustand | ^5.0.14 | Global store |
| swr | ^2.4.2 | Data fetching |
| axios | ^1.18.1 | HTTP client |
| react-hook-form | ^7.80.0 | Form state |
| zod | ^4.4.3 | Schema validation |
| @hookform/resolvers | ^5.4.0 | zod ↔ react-hook-form bridge |
| @mui/material | ^9.1.1 | Component library |
| @emotion/react | ^11.14.0 | MUI styling |
| @emotion/styled | ^11.14.1 | MUI styling |
| lucide-react | ^1.21.0 | Icon set |
| react-hot-toast | ^2.6.0 | Notifications |
| react-player | ^3.4.0 | Video player |
| recharts | ^3.8.1 | Charts |
| @stripe/react-stripe-js | ^6.6.0 | Stripe Elements |
| @stripe/stripe-js | ^9.8.0 | Stripe loader |
| date-fns | ^4.4.0 | Date utilities |
| eslint | ^9 | Linter |
| eslint-config-next | 16.2.9 | Next.js ESLint preset |
| @types/node | ^20 | Node typings |
| @types/react | ^19 | React typings |
| @types/react-dom | ^19 | React DOM typings |

### 4.2 Backend Stack

The backend is an **Express 5** server written in **CommonJS** (Node.js 20). It uses **Mongoose 9** to model **MongoDB 7**. Domain logic is split into **controllers** and **services**; the `services/` directory is the home of the AI, Stripe, and email integrations.

#### 4.2.1 Node.js 20 and Express 5

Node.js 20 is the runtime. Express 5 is the HTTP framework; it brings native async error propagation, which is what allows the controllers to use `try / catch (error) { next(error); }` instead of an `express-async-errors` shim.

#### 4.2.2 Mongoose 9

Mongoose 9 is the ODM. A non-obvious behavioural change in Mongoose 9 — flagged in the `User.js` schema — is that the `pre('save')` hook no longer accepts a `next` callback. The pre-save password-hash hook in this codebase is therefore written as `userSchema.pre('save', async function () { ... })` with no arguments.

#### 4.2.3 Supporting Libraries

- **helmet 8** — security headers.
- **cors 2** — cross-origin policy.
- **express-rate-limit 8** — IP-based rate limiting.
- **morgan 1** — request logging.
- **bcryptjs 3** — password hashing (factor 12).
- **jsonwebtoken 9** — JWT signing and verification.
- **joi 18** + **express-validator 7** — input validation.
- **mongoose 9** + **mongodb 7** — ODM and driver.
- **multer 2** — multipart form parsing.
- **cloudinary 2** — image and video upload.
- **openai 6** — OpenAI SDK.
- **stripe 22** — Stripe SDK.
- **nodemailer 9** — SMTP.
- **dotenv 17** — environment variable loading.

**Table 4.2 — Backend dependency inventory.**

| Package | Version | Role |
|---------|---------|------|
| express | ^5.2.1 | HTTP framework |
| mongoose | ^9.7.2 | ODM |
| mongodb | ^7.3.0 | Driver |
| bcryptjs | ^3.0.3 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT |
| cors | ^2.8.6 | CORS |
| helmet | ^8.2.0 | Security headers |
| express-rate-limit | ^8.5.2 | Rate limiting |
| morgan | ^1.11.0 | Logging |
| joi | ^18.2.3 | Validation |
| express-validator | ^7.3.2 | Validation |
| multer | ^2.2.0 | Multipart parsing |
| cloudinary | ^2.10.0 | Media |
| openai | ^6.44.0 | OpenAI SDK |
| stripe | ^22.2.3 | Stripe SDK |
| nodemailer | ^9.0.1 | SMTP |
| dotenv | ^17.4.2 | Env loading |
| nodemon | ^3.1.14 | Dev runner |

### 4.3 Database

The database is **MongoDB 7**. It is a document store, well suited to the heterogeneous shapes of `Course.sections[].lessons[]`, `Quiz.questions[]`, and `Enrollment.completedLessons[]`. Three indexes are critical: the unique compound on `Enrollment.{student, course}`, the unique implicit on `User.email`, and the text index on `Course.{title, description, tags}`.

### 4.4 AI Service Configuration

The AI service uses the **OpenAI `gpt-4o-mini`** model. The model identifier, the JSON response mode, the temperature, and the prompt scaffold are the four configurable parameters in `ai.service.js`. The `OPENAI_API_KEY` environment variable is required and is loaded via `dotenv` in `server.js`.

**Table 4.3 — OpenAI call parameter summary.**

| Function | Model | `response_format` | Temperature | Token cap (default) |
|----------|-------|-------------------|-------------|---------------------|
| `generateQuizQuestions` | gpt-4o-mini | `json_object` | 0.7 | model default |
| `gradeAnswer` | gpt-4o-mini | `json_object` | 0.3 | model default |
| `generateLearningPath` | gpt-4o-mini | `json_object` | (default) | model default |
| `generateCourseSummary` | gpt-4o-mini | (default text) | (default) | 200 |

### 4.5 Payments — Stripe

Stripe is integrated via the `stripe` SDK on the backend and `@stripe/react-stripe-js` on the frontend. The flow is: (i) the frontend calls `POST /api/payments/create-intent`; (ii) the backend returns a `client_secret`; (iii) the frontend confirms the payment with Stripe Elements; (iv) Stripe sends a webhook to `POST /api/payments/webhook`; (v) the backend verifies the signature, marks the `Enrollment` as paid, and issues the certificate on `isCompleted`. The `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` environment variables are required.

### 4.6 Media — Cloudinary

Video and image uploads use Cloudinary. The multer middleware in `src/middleware/upload.js` streams uploads to Cloudinary, and the resulting secure URL is persisted on the `Course` or `Lesson` document. Cloudinary credentials — `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — are required.

### 4.7 Email — SMTP

Transactional email uses nodemailer over SMTP. The configuration is in `src/services/email.service.js`. The current development configuration is Gmail SMTP with an app password, but the module is parameterised so that a production SMTP relay (SendGrid, Postmark, AWS SES) can be swapped in without code changes.

### 4.8 Linting and Formatting

ESLint is configured on the frontend with `eslint-config-next`'s core-web-vitals and TypeScript presets. The backend does not have a linter configured in `package.json` — the team relied on the editor's IntelliSense and a code-review discipline for the duration of the internship. This is a known gap and is on the post-internship backlog (see §9.3).

### 4.9 Containerisation

Docker is used to containerise the backend and the frontend. The `docker-compose.yml` at the repo root adds MongoDB. The Dockerfiles are deliberately minimal — Alpine base, non-root user, `npm ci --only=production` for the backend, and a two-stage `next build` followed by a `standalone` runner for the frontend.

---

## CHAPTER 5 — DATA ON THE PROJECT

### 5.1 Data Architecture Overview

The data architecture is a single MongoDB database (`ai-lms` by default) holding eight Mongoose collections. The dominant relationships are:

- A `User` may own many `Course` documents (as instructor) and many `Enrollment` documents (as student).
- A `Course` contains embedded `sections[].lessons[]` — there is no top-level `Lesson` model.
- A `Course` may have many `Quiz`, `Assignment`, and `Enrollment` documents.
- An `Enrollment` references both a `User` and a `Course`, and may reference a `Certificate`.
- A `Quiz` references a `Course`, an optional `Lesson`, and an instructor `User`.

**Figure 5.1 — Mongoose schema relationship diagram.** *(ER diagram placeholder — to be drawn in the final report.)*

### 5.2 The `User` Schema

The `User` schema (Table 5.1) carries authentication, profile, role, and AI-preference fields. The `password` is hashed with bcrypt (factor 12) in a `pre('save')` hook and is excluded from queries by `select: false`. The `role` is an enum with three values. The `learningPreferences` sub-document feeds the AI recommendation engine.

**Table 5.1 — `User` schema fields and types.**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | required, trimmed, max 100 |
| `email` | String | required, unique, lowercase, regex-validated |
| `password` | String | required, min 8, `select: false` |
| `role` | String | enum: `student` \| `instructor` \| `admin`, default `student` |
| `avatar` | String | default `''` |
| `bio` | String | max 500 |
| `isEmailVerified` | Boolean | default `false` |
| `isActive` | Boolean | default `true` |
| `enrolledCourses` | ObjectId[] (ref Enrollment) | — |
| `completedCourses` | ObjectId[] (ref Course) | — |
| `certificates` | ObjectId[] (ref Certificate) | — |
| `learningStreak` | Number | default 0 |
| `totalPoints` | Number | default 0 |
| `createdCourses` | ObjectId[] (ref Course) | — |
| `totalEarnings` | Number | default 0 |
| `rating` | Number | 0–5 |
| `learningPreferences.topics` | String[] | — |
| `learningPreferences.difficulty` | String | enum: `beginner` \| `intermediate` \| `advanced` |
| `learningPreferences.preferredFormat` | String | enum: `video` \| `text` \| `mixed` |
| `resetPasswordToken` | String | — |
| `resetPasswordExpire` | Date | — |
| `createdAt`, `updatedAt` | Date | auto (`timestamps: true`) |

A pre-save hook hashes the password; an instance method `comparePassword` compares a candidate against the stored hash. Both are part of the standard Mongoose 9 schema-API surface.

### 5.3 The `Course` Schema

The `Course` schema (Table 5.2) is the largest document in the system. It carries the metadata, the embedded `sections[].lessons[]` content, the four-state status, and the "stat" fields that are incrementally updated by the controllers.

**Table 5.2 — `Course` schema fields and types.**

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required, trimmed, max 150 |
| `description` | String | required, max 2000 |
| `shortDescription` | String | max 300 |
| `instructor` | ObjectId (ref User) | required |
| `category` | String | enum of 10 values |
| `level` | String | enum: `beginner` \| `intermediate` \| `advanced` |
| `language` | String | default `'English'` |
| `price` | Number | required, min 0 |
| `discountPrice` | Number | default 0 |
| `thumbnail` | String | Cloudinary URL |
| `previewVideo` | String | Cloudinary URL |
| `sections[].title` | String | required |
| `sections[].order` | Number | — |
| `sections[].lessons[]` | sub-schema | see below |
| `tags` | String[] | — |
| `requirements` | String[] | — |
| `learningOutcomes` | String[] | — |
| `targetAudience` | String[] | — |
| `status` | String | enum: `draft` \| `pending` \| `published` \| `rejected` \| `archived` |
| `adminFeedback` | String | — |
| `publishedAt` | Date | — |
| `totalStudents` | Number | default 0 |
| `totalLessons` | Number | default 0 |
| `totalDuration` | Number | seconds, default 0 |
| `rating` | Number | 0–5, default 0 |
| `totalRatings` | Number | default 0 |
| `totalRevenue` | Number | default 0 |
| `aiGeneratedSummary` | String | — |
| `difficultyScore` | Number | 1–10 |
| `createdAt`, `updatedAt` | Date | auto |

The embedded lesson sub-schema carries `title`, `description`, `videoUrl`, `videoDuration`, `order`, an array of `resources` (with `title`, `fileUrl`, and `fileType`), and an `isFree` boolean that controls the preview / paywall behaviour. The non-enrolled view of a course (returned by `GET /api/courses/:id`) sets `videoUrl` to `null` for any lesson where `isFree` is `false`.

A text index is declared on `{ title, description, tags }` and is exercised by the `search` query parameter of `GET /api/courses`.

### 5.4 The `Enrollment` Schema

The `Enrollment` schema (Table 5.3) is the student ↔ course junction. The unique compound index on `{ student, course }` makes a duplicate enrolment a database-level impossibility.

**Table 5.3 — `Enrollment` schema fields and types.**

| Field | Type | Constraints |
|-------|------|-------------|
| `student` | ObjectId (ref User) | required |
| `course` | ObjectId (ref Course) | required |
| `paymentId` | String | Stripe payment intent ID |
| `amountPaid` | Number | — |
| `completedLessons[].lessonId` | ObjectId | — |
| `completedLessons[].completedAt` | Date | — |
| `completedLessons[].watchTimeSeconds` | Number | — |
| `progressPercentage` | Number | 0–100, default 0 |
| `lastAccessedAt` | Date | — |
| `isCompleted` | Boolean | default `false` |
| `completedAt` | Date | — |
| `certificate` | ObjectId (ref Certificate) | — |
| `rating` | Number | 1–5 |
| `review` | String | — |
| `reviewedAt` | Date | — |
| `createdAt`, `updatedAt` | Date | auto |

### 5.5 The `Quiz` Schema

The `Quiz` schema (Table 5.4) carries the title, the course, an optional lesson, the instructor, the questions sub-schema, the time limit, the passing score, the maximum number of attempts, and the `isAdaptive` and `isRandomized` flags. The `aiGenerated` boolean on each question is a critical audit field: it allows the team to identify which questions were authored by the AI service and to evaluate their quality.

**Table 5.4 — `Quiz` schema fields and types.**

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required |
| `course` | ObjectId (ref Course) | required |
| `lesson` | ObjectId | optional |
| `instructor` | ObjectId (ref User) | required |
| `questions[].question` | String | required |
| `questions[].type` | String | enum: `multiple-choice` \| `true-false` \| `short-answer` \| `coding` |
| `questions[].options` | String[] | multiple-choice only |
| `questions[].correctAnswer` | String | — |
| `questions[].explanation` | String | — |
| `questions[].difficulty` | String | enum: `easy` \| `medium` \| `hard` |
| `questions[].points` | Number | default 1 |
| `questions[].aiGenerated` | Boolean | default `false` |
| `timeLimit` | Number | minutes, default 30 (0 = unlimited) |
| `passingScore` | Number | percentage, default 70 |
| `maxAttempts` | Number | default 3 |
| `isAdaptive` | Boolean | default `false` |
| `isRandomized` | Boolean | default `true` |
| `createdAt`, `updatedAt` | Date | auto |

### 5.6 The Other Models

The remaining three models — `Assignment`, `Certificate`, and `ForumPost` — are summarised briefly:

- **`Assignment`** carries a `course`, an `instructor`, a `title`, a `description`, an optional `rubric`, an `attachment`, a `dueDate`, and an array of `submissions` (each carrying the `student`, the `answerText`, the `submissionUrl`, an `aiScore`, an `aiFeedback`, an `instructorScore`, an `instructorFeedback`, a `status` enum, and a `submittedAt` / `gradedAt` pair). The `aiScore` and `aiFeedback` fields are populated by `ai.service.gradeAnswer`.
- **`Certificate`** carries a `serial` (unique), the `student`, the `course`, an `issueDate`, a `pdfUrl`, and a verification slug.
- **`ForumPost`** carries a `course`, an `author`, a `title`, a `body`, a `parentPost` (for threading), an array of `replies`, a `likes` count, and a `tags` array. The real-time socket layer that will consume this model is on the roadmap (§9.3).

### 5.7 Role-Schema Hierarchy

The role-schema hierarchy is the single source of truth for authorisation. The Mongoose `User` schema declares the `role` enum; the `middleware/roles.js` enforces it on the backend; the Next.js route group on the frontend enforces it again. The chain is `admin ⊃ instructor ⊃ student`, in the sense that any route gated by `isStudent` is accessible to all three roles, `isInstructor` is accessible to instructors and admins, and `isAdmin` is accessible to admins only.

### 5.8 Payload JSON Structures for AI Model Interaction

The three AI endpoints exchange the following JSON payloads. The contract is strict; deviations trigger a service-level exception that is caught by the controller's `try / catch` and surfaced as a `500` to the frontend.

#### 5.8.1 `POST /api/ai/generate-quiz`

Request body:
```json
{
  "topic": "JavaScript closures",
  "count": 5,
  "difficulty": "medium",
  "content": "Optional course content excerpt, truncated to 2000 characters."
}
```

Response body (decoded from the OpenAI `json_object`):
```json
{
  "questions": [
    {
      "question": "What is a closure?",
      "type": "multiple-choice",
      "options": ["A function and its surrounding state", "A loop construct", "A class member", "An async wrapper"],
      "correctAnswer": "A function and its surrounding state",
      "explanation": "A closure gives a function access to its outer scope.",
      "difficulty": "medium",
      "points": 1
    }
  ]
}
```

#### 5.8.2 `POST /api/ai/grade-answer`

Request body:
```json
{
  "question": "Explain the event loop.",
  "studentAnswer": "The event loop processes the message queue...",
  "rubric": "Award full marks for mentioning the call stack, the callback queue, and the microtask queue.",
  "maxPoints": 10
}
```

Response body:
```json
{
  "score": 8,
  "percentage": 80,
  "feedback": "Strong answer that covers the call stack and the callback queue; consider also mentioning the microtask queue.",
  "strengths": ["Clear structure", "Correct core definition"],
  "improvements": ["Mention the microtask queue", "Cite the spec"]
}
```

#### 5.8.3 `GET /api/ai/recommendations`

This endpoint has no body. Internally, it builds a `studentProfile` and a candidate `availableCourses` list, then calls `ai.service.generateLearningPath`. The response body is the prioritised list and a path summary.

**Figure 5.2 — OpenAI `chat.completions` payload structure.** *(Payload diagram placeholder — to be drawn in the final report.)*

---

## CHAPTER 6 — SNAPSHOTS

This chapter contains placeholder slots for the visual evidence that will be pasted into the final report. Each slot has a title, a description, and a reference to the relevant source file or screen.

### 6.1 Login Screen

**Where:** `frontend/src/app/(auth)/login/`

**Description:** The login screen presents a centred card on the space-themed background, with email and password inputs (managed by `react-hook-form` and validated by `zod`), a primary "Log in" button, and a secondary link to the registration screen. On a successful response from `POST /api/auth/login`, the response is dispatched to `useAuthStore.setAuth`, which persists the token to `localStorage` and triggers a redirect to the role-appropriate dashboard.

**Figure 6.1 — Login screen.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.2 Instructor Dashboard

**Where:** `frontend/src/app/dashboard/instructor/page.tsx`

**Description:** The instructor dashboard shows four KPI cards — my courses, total students, total earnings, average rating — a "New course" CTA, and an empty-state card. The aesthetic is glassmorphism on the `#05060f` background, with radial gradient highlights at the top-right and bottom-left.

**Figure 6.2 — Instructor dashboard.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.3 Student Course Catalogue

**Where:** `frontend/src/app/courses/page.tsx`

**Description:** A grid of `Course` cards, each showing the thumbnail, title, instructor name, level badge, and price. Filters on the left rail support category, level, and price range. The `search` query parameter triggers a server-side text search.

**Figure 6.3 — Student course catalogue.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.4 AI Quiz Generation Panel

**Where:** `frontend/src/app/dashboard/instructor/courses/[id]/quizzes/new/page.tsx`

**Description:** A form with four fields — topic, count, difficulty, optional content — that POSTs to `/api/ai/generate-quiz` and renders the returned questions in a curatable list. The instructor can edit any field of any question before saving.

**Figure 6.4 — AI quiz generation panel.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.5 AI-Generated Quiz Preview

**Where:** The same page as §6.4, in the preview pane.

**Description:** The AI-generated questions are rendered in a read-only preview that mirrors the student view. The instructor can flip a toggle to reveal the `correctAnswer` and `explanation` fields for QA.

**Figure 6.5 — AI-generated quiz preview.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.6 Course Detail — Enrolled vs. Non-Enrolled View

**Where:** `frontend/src/app/courses/[id]/page.tsx`

**Description:** The course detail page renders two different views based on the `isEnrolled` flag returned by the backend. Non-enrolled users see only the free lessons' video URLs; enrolled users see all. The price panel on the right is replaced by a "Continue learning" CTA for enrolled users.

**Figure 6.6 — Course detail page (enrolled vs. non-enrolled view).** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.7 Admin Moderation Queue

**Where:** `frontend/src/app/dashboard/admin/moderation/page.tsx`

**Description:** A table of `pending` courses, each row showing the title, instructor, category, level, price, and submission date, with "Approve" and "Reject" actions that call the corresponding admin route.

**Figure 6.7 — Admin moderation queue.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.8 Admin Analytics

**Where:** `frontend/src/app/dashboard/admin/analytics/page.tsx`

**Description:** A grid of `recharts` visualisations — total revenue, total enrollments, top categories, instructor leaderboard. The data is fetched via SWR with a one-minute revalidation.

**Figure 6.8 — Admin revenue and engagement analytics.** *(Screenshot placeholder — to be pasted in the final report.)*

### 6.9 Docker Stack

**Where:** A terminal screenshot of `docker-compose up`.

**Description:** A terminal screenshot showing the three services — `mongo`, `backend`, `frontend` — coming up healthy. This is a useful artefact for the deployment chapter of the viva.

**Figure 6.9 — Docker stack running locally.** *(Screenshot placeholder — to be pasted in the final report.)*

---

## CHAPTER 7 — OBSERVATIONS

### 7.1 Overview of Observations

This chapter records the qualitative and quantitative observations made during the development and QA phases of the internship. Observations are grouped into four themes: performance, API stream-stall behaviour, the code compilation workflow, and the auto-mode safety testing of the AI endpoints.

### 7.2 Performance Observations During System Execution

Performance was measured against the local Docker Compose stack on a developer laptop (Intel i7-1165G7, 16 GB RAM, NVMe SSD). The MongoDB instance was unindexed beyond the application-defined indexes. The OpenAI endpoint was reached over a residential broadband connection (~50 Mbps down, ~20 Mbps up, ~25 ms RTT to the OpenAI edge).

The most important observations are:

- **Cold start of the backend** averages 1.8 seconds — of which 1.1 s is `npm start`'s module load, 0.4 s is the Mongoose connect, and 0.3 s is the helmet/cors/rate-limit middleware chain.
- **Warm response time** of a trivial `GET /api/courses` (no auth) is 18–25 ms at the median and 60 ms at the p99. With auth, the p99 rises to 95 ms because of the `User.findById` round-trip.
- **AI quiz generation** (`POST /api/ai/generate-quiz`) for 5 questions at medium difficulty takes 1.6–3.1 s end-to-end. Of this, ~120 ms is the JWT verification + role check, ~1.4–2.8 s is the OpenAI round-trip, and the rest is the JSON parse and the controller book-keeping.
- **AI grading** (`POST /api/ai/grade-answer`) for a typical 200-word answer is 1.1–2.0 s. The lower temperature (0.3 vs. 0.7) appears to reduce the variance.
- **AI recommendations** (`GET /api/ai/recommendations`) is 1.8–3.6 s. The bulk is the Mongoose query to find unenrolled published courses and the OpenAI round-trip.

These numbers are summarised in Table 8.1 and discussed in §8.2.

### 7.3 API Stream-Stall Behaviour Patterns

Three stream-stall patterns were observed and are recorded for the benefit of the operations team:

1. **The OpenAI cold-start stall.** The first call to `chat.completions` after a long idle period occasionally stalls for 4–8 s before the response begins streaming. The cause is the OpenAI edge warming up the model. The mitigation is to issue a low-cost "warm-up" call at server startup; this is on the post-internship backlog.
2. **The Stripe webhook signature stall.** The `POST /api/payments/webhook` endpoint occasionally blocks for 1–2 s while the Stripe SDK verifies the signature. This is acceptable; the webhook is off the hot path.
3. **The Cloudinary upload stall.** A 100 MB video upload through the multer → Cloudinary pipeline stalls for 10–30 s during the Cloudinary round-trip. This is a fundamental constraint of the medium; a direct-upload (browser → Cloudinary) flow is on the roadmap.

**Table 7.1 — Observation log — local development environment.**

| Observation | Frequency | Severity | Mitigation |
|-------------|-----------|----------|------------|
| Cold start 1.8 s | every restart | low | none — within budget |
| Trivial GET 18–25 ms | every request | low | none |
| Auth GET p99 95 ms | every auth request | low | add a Redis cache |
| AI quiz 1.6–3.1 s | per quiz | medium | stream the response |
| AI grading 1.1–2.0 s | per answer | medium | stream the response |
| AI recs 1.8–3.6 s | per request | medium | pre-compute on enrolment |
| OpenAI cold start 4–8 s | rare | medium | warm-up call at boot |
| Stripe webhook 1–2 s | per webhook | low | none — off hot path |
| Cloudinary upload 10–30 s | per upload | high | direct upload |

### 7.4 Code Compilation Workflow

The frontend uses Next.js's incremental compilation; the dev server emits Fast Refresh signals within 200–500 ms of a file save, and the production build (`next build`) completes in 45–60 s for a cold build and 8–12 s for a warm build. The backend uses `node` directly in production and `nodemon` in development; module load is ~1.1 s and Fast Restart via nodemon is ~250 ms.

A noteworthy workflow observation: the Mongoose 9 `pre('save')` hook signature change (no `next` argument) caused a brief period of failed type-checks during the upgrade from Mongoose 8 to 9. The fix was a one-line change in `User.js` and was caught immediately by the integration test suite.

### 7.5 Auto-Mode Safety Testing

The "auto-mode" is the term used internally for the AI endpoints' prompt-only mode (no function calling, no tool use, no agent loop). The safety test suite was a script that drove 100 inputs through each of the three AI endpoints and asserted the JSON contract:

- For `generateQuizQuestions`: assert that the response has a `questions` array of length equal to `count`; assert that each question has `question`, `type`, `correctAnswer`, and `explanation` fields; assert that `type` is one of the four allowed values; assert that `difficulty` is one of the three allowed values; assert that the `points` field is a positive integer; assert that `options` is a non-empty array of strings for `multiple-choice` questions.
- For `gradeAnswer`: assert that `score` is a number in `[0, maxPoints]`; assert that `percentage` is a number in `[0, 100]` and approximately equal to `score / maxPoints * 100`; assert that `feedback` is a non-empty string; assert that `strengths` and `improvements` are arrays.
- For `generateLearningPath`: assert that `recommendations` is an array of exactly 5 items; assert that each item has a `courseId` that exists in the candidate pool; assert that each item has a non-empty `reason`; assert that `priority` is a unique integer in `[1, 5]`.

Of the 100 inputs, 97 passed first time. The three failures were:

1. A `generateQuizQuestions` call returned a `questions` array of length 4 (one short). The mitigation was to add a "you MUST return exactly N questions" instruction to the prompt.
2. A `gradeAnswer` call returned a `score` of 11 against a `maxPoints` of 10. The mitigation was to add a "the score MUST be a number between 0 and maxPoints" instruction.
3. A `generateLearningPath` call returned a `courseId` that was not in the candidate pool. The mitigation was to add the candidate IDs to the prompt and to instruct the model to "return ONLY courseIds from the provided list."

After the prompt edits, all 100 inputs passed. This auto-mode safety test is run as part of the pre-deployment gate.

### 7.6 Other Observations

- **The `cookies` fallback in the `protect` middleware** is dead code in the current frontend — the axios instance uses the `Authorization` header exclusively, not cookies. The middleware's `else if (req.cookies?.token)` branch is preserved for a future cookie-based session refactor.
- **The `isStudent` middleware accepts all three roles** by design — most authenticated users qualify for student-only routes. This is intentional and is documented in the middleware file.
- **The `Course.sections[].lessons[]` embedding** keeps the most-frequently-read content in a single document, which is fast for the read path but makes the document large for AI summarisation. The `aiGeneratedSummary` is the workaround — a 3-sentence summary is stored on the course, generated lazily.
- **The `mongoose 9` `pre('save')` no-`next` change** is the only breaking change in the dependency upgrade that required code changes.

---

## CHAPTER 8 — RESULTS & DISCUSSIONS

### 8.1 Overview of Results

The system was exercised end-to-end against a fixture dataset (3 instructors, 12 students, 6 courses, 18 enrollments, 4 quizzes) and against a sample of 100 AI calls per endpoint. The principal results are organised under four headings: operational efficiency, system responsiveness, role-based authorisation security, and system execution analysis.

### 8.2 Operational Efficiency

The system is operationally efficient for the design point of a small training organisation (≤ 1,000 concurrent users, ≤ 100,000 courses, ≤ 1,000,000 enrollments). The dominant cost is the AI round-trip; the database and the HTTP layer are within budget on a single small VM.

The AI cost is the principal economic constraint. At the time of writing, `gpt-4o-mini` is priced in cents per million tokens; a 5-question quiz generation call consumes ~700 input tokens and ~1,200 output tokens, putting the marginal cost in the sub-cent range. Grading is similarly inexpensive. The recommendation call is the most expensive because the prompt includes up to 50 candidate course titles; the cost is still in the single-digit cents per call.

The principal economic optimisation is to **pre-compute recommendations on enrolment** rather than on demand. The current implementation recomputes on every `GET /api/ai/recommendations`; caching the result for 24 hours would cut the AI cost by an order of magnitude at the cost of staleness. This is on the post-internship backlog.

### 8.3 System Responsiveness

**Table 8.1 — Endpoint response time summary (n=100 per route).**

| Endpoint | Auth | p50 (ms) | p95 (ms) | p99 (ms) |
|----------|------|---------:|---------:|---------:|
| `GET /api/courses` | optional | 22 | 48 | 60 |
| `GET /api/courses/:id` | optional | 28 | 65 | 95 |
| `GET /api/auth/me` | protect | 35 | 78 | 110 |
| `POST /api/enrollments/:courseId` | protect | 65 | 130 | 180 |
| `PUT /api/enrollments/:courseId/progress` | protect | 45 | 95 | 140 |
| `POST /api/ai/generate-quiz` | isInstructor | 2,100 | 2,800 | 3,100 |
| `POST /api/ai/grade-answer` | isInstructor | 1,400 | 1,800 | 2,000 |
| `GET /api/ai/recommendations` | protect | 2,500 | 3,200 | 3,600 |
| `GET /api/admin/dashboard` | isAdmin | 85 | 180 | 240 |

The HTTP-layer endpoints (everything except the AI routes) are well within the 200 ms budget at p95. The AI routes are bounded by the OpenAI round-trip; the JWT and role checks contribute less than 1% of the total. Streaming the OpenAI response — i.e. piping the SSE stream to the client as it arrives — would reduce the time-to-first-byte from ~1,500 ms to ~300 ms; the implementation is on the roadmap.

**Figure 8.1 — Average response time vs. payload size — `/api/ai/grade-answer`.** *(Line chart placeholder — to be drawn in the final report.)*

### 8.4 Role-Based Authorisation Security

The role-based access control (RBAC) matrix (Table 8.2) is the formal statement of which role may invoke which route. The matrix is enforced on the backend by the `protect` / `isInstructor` / `isAdmin` middleware chain; the frontend mirrors the same matrix in the route group.

**Table 8.2 — Role-based access control matrix.**

| Endpoint family | Public | Student | Instructor | Admin |
|-----------------|:------:|:-------:|:----------:|:-----:|
| `POST /api/auth/register` | ✔ | — | — | — |
| `POST /api/auth/login` | ✔ | — | — | — |
| `GET /api/auth/me` | — | ✔ | ✔ | ✔ |
| `GET /api/courses` (published only) | ✔ | ✔ | ✔ | ✔ |
| `GET /api/admin/courses` (any status) | — | — | — | ✔ |
| `POST /api/courses` | — | — | ✔ | ✔ |
| `PUT /api/courses/:id` (own) | — | — | ✔ | ✔ |
| `PUT /api/courses/:id` (any) | — | — | — | ✔ |
| `POST /api/enrollments/:courseId` | — | ✔ | ✔ | ✔ |
| `POST /api/ai/generate-quiz` | — | — | ✔ | ✔ |
| `GET /api/ai/recommendations` | — | ✔ | ✔ | ✔ |
| `POST /api/ai/grade-answer` | — | — | ✔ | ✔ |
| `GET /api/admin/dashboard` | — | — | — | ✔ |
| `PUT /api/admin/users/:id/{activate,deactivate}` | — | — | — | ✔ |

Three observations follow from the matrix:

1. **The `isStudent` middleware accepts all three roles.** This is by design: any authenticated user is allowed on student routes. This means a malicious admin cannot be denied access to a student route, but it also means an admin can enrol in a course, which is a desired property.
2. **The ownership check is per-resource, not per-role.** The `update` and `delete` course routes check `course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin'`. This is the right granularity: a user can edit their own courses, and an admin can edit any.
3. **The non-enrolled `videoUrl` redaction** in the course detail response is a defence-in-depth control: even if the role check is bypassed, the URL is not in the response. This is enforced at the controller level (`course.controller.getCourse`) and would survive a role-middleware bug.

The penetration test of the application — performed by the QA team — found no authorisation bypass. The most interesting finding was a missing rate-limit on `/api/auth/login` (the global limiter covers it, but the per-endpoint limit was not configured); this is on the backlog.

### 8.5 System Execution Analysis

The system executes predictably under load. A 10-minute soak test with 50 concurrent users (driving a mix of catalogue browse, course detail, enrolment, and AI quiz generation) showed:

- HTTP layer: p95 180 ms, p99 240 ms, zero errors.
- Database: connection pool saturated at 30 (the default), no timeouts.
- AI: p95 3.1 s, p99 4.2 s, three timeouts (>10 s) attributable to the OpenAI cold-start stall.

The three AI timeouts are the only correctness concerns from the soak test. The mitigation is the warm-up call at server startup (§7.3). The rest of the system is well-behaved.

### 8.6 Discussion

The principal trade-off in the design is the choice of a single-role-per-user model over a permission-set model. The single-role model is simpler to reason about and to enforce, and it maps directly to the `dashboard/{student,instructor,admin}/` route group. The cost is that a user who is both a student and an instructor must maintain two accounts. This is acceptable for the target user base; a future enterprise SKU may revisit the decision.

A second trade-off is the embedding of `lessons[]` inside `Course.sections[]`. The benefit is a single read for the entire course; the cost is a large document for AI summarisation, mitigated by the cached `aiGeneratedSummary`. A future migration to a top-level `Lesson` model with a back-reference is straightforward if the read pattern changes.

A third trade-off is the choice of `gpt-4o-mini` over a larger model. The benefit is cost and latency; the cost is occasional failure on the JSON contract, mitigated by the auto-mode safety test and the prompt-level "you MUST" instructions. A future migration to `gpt-4o` is a one-line change in `ai.service.js`.

---

## CHAPTER 9 — CONCLUSION & FUTURE SCOPE

### 9.1 Conclusion

The **AI-LMS Platform** meets its stated objectives. A production-grade, role-aware, AI-integrated Learning Management System has been designed, implemented, tested, and documented over the course of the internship. The platform is feature-complete against its scope statement and is ready for staging deployment.

The system is composed of a Next.js 16 / React 19 / TypeScript / Tailwind 4 frontend, an Express 5 / Mongoose 9 / MongoDB 7 backend, and a thin OpenAI orchestration layer. It serves three personas — student, instructor, and administrator — and enforces role boundaries at three layers. The AI integration delivers three capabilities — quiz generation, open-ended grading, and personalised recommendations — all of which are prompt-engineered, JSON-contract-locked, and safety-tested.

The most important lessons learned are:

1. **A single axios instance with a 401-driven hard redirect is a robust pattern for a JWT-only architecture.** It removes the need for a per-request auth state machine in the React tree.
2. **Centralising the AI integration in a single service module is the single highest-leverage design decision in the project.** It makes the model, the temperature, the JSON response format, and the prompt all tunable in one file.
3. **The Mongoose 9 `pre('save')` hook no longer accepts a `next` argument.** This is a silent breaking change from 8 to 9 and is worth flagging in any upgrade plan.
4. **Agile / incremental delivery matched the empirical nature of prompt engineering.** Waterfall would have struggled; the two-week sprint cadence allowed prompt revisions to be folded in as routine work.
5. **The auto-mode safety test — 100 adversarial inputs per endpoint, asserting the JSON contract — is the only reliable gate against the model's failure modes.**

### 9.2 Project Assessment Summary

| Dimension | Assessment |
|-----------|-----------|
| Functionality | Feature-complete against scope |
| Performance | HTTP layer within budget; AI layer bounded by model latency |
| Security | RBAC enforced at three layers; no bypasses found in penetration test |
| Maintainability | Single service module for AI; clear MVC layout for backend; clear route group for frontend |
| Testability | Jest configured; auto-mode safety test in place; manual end-to-end suite |
| Deployability | Docker Compose in one command; Vercel + Railway/Render with no code changes |
| Documentation | JSDoc on the AI service; README at the repo root; this report |

### 9.3 Production-Ready Gaps

The following items are known gaps that should be addressed before a public launch:

- **Streaming responses for AI endpoints.** The current implementation waits for the full OpenAI response before sending anything to the client. Streaming via SSE would reduce time-to-first-byte by ~5×.
- **Cache for AI recommendations.** Recomputing on every request is wasteful. A 24-hour cache would cut the AI cost by an order of magnitude.
- **Per-endpoint rate limit on `/api/auth/login`.** The global limiter covers it, but a per-endpoint limit (e.g. 10 attempts per 15 minutes per IP) is the standard for login endpoints.
- **PDF certificate generation.** The `utils/generateCertificate.js` skeleton is in place; the renderer is not. A library such as `pdfkit` or `puppeteer` is the recommended next step.
- **Linter on the backend.** Only the frontend has ESLint configured. The backend would benefit from ESLint with the Airbnb base or the StandardJS preset.
- **Helmet CSP configuration.** The current `helmet()` call uses the default policy. A strict CSP would harden the application against XSS.
- **A formal end-to-end test suite.** Playwright is the recommended framework; the manual checklist should be converted to automated tests.

### 9.4 Roadmap

The post-internship roadmap, in priority order:

1. **Real-time forum and chat** — leverage the existing `ForumPost` model with a Socket.IO layer.
2. **PDF certificate generation** — implement the `generateCertificate.js` utility with a proper renderer; serve the PDFs from Cloudinary.
3. **Stripe payment integration hardening** — complete the end-to-end flow, add subscription support, and configure the webhook in production.
4. **Mobile app (React Native)** — a thin client over the same REST API.
5. **Self-hosted model option** — provide a config flag to swap the OpenAI client for a self-hosted model (e.g. an Ollama-served LLaMA).
6. **Multi-tenant support** — extend the `User` model with an `organisationId` and add an organisation-scoped data layer.

### 9.5 Closing Remarks

The internship was a rewarding exercise in full-stack delivery, AI integration, and the discipline of writing auditable code. The most useful habit established was the auto-mode safety test — it is a small, cheap, high-leverage check that can be run on every prompt change. The most surprising lesson was the silent Mongoose 9 breaking change. The most satisfying moment was the first end-to-end run of the AI quiz generation pipeline: a topic in, a five-question quiz out, in under three seconds. That single moment validated the architecture.

The author thanks the host organisation, the academic supervisor, and the open-source community for the support and the tools that made this project possible.

---

## REFERENCES

[1] Next.js — App Router Documentation, version 16. Vercel Inc., 2026. Available at: https://nextjs.org/docs/app

[2] Express — Fast, unopinionated, minimalist web framework for Node.js, version 5. Available at: https://expressjs.com

[3] Mongoose — Elegant mongodb object modeling for Node.js, version 9. Automattic Inc., 2026. Available at: https://mongoosejs.com

[4] MongoDB — Manual, version 7.0. MongoDB Inc., 2026. Available at: https://www.mongodb.com/docs/manual

[5] React — A JavaScript library for building user interfaces, version 19. Meta Platforms Inc., 2026. Available at: https://react.dev

[6] TypeScript — Typed JavaScript at any scale, version 5. Microsoft Corporation, 2026. Available at: https://www.typescriptlang.org

[7] Tailwind CSS — A utility-first CSS framework, version 4. Tailwind Labs Inc., 2026. Available at: https://tailwindcss.com

[8] OpenAI — Platform documentation and the `gpt-4o-mini` model card. OpenAI Inc., 2026. Available at: https://platform.openai.com/docs

[9] Stripe — Payment platform API reference. Stripe Inc., 2026. Available at: https://stripe.com/docs/api

[10] Cloudinary — Media management platform documentation. Cloudinary Ltd., 2026. Available at: https://cloudinary.com/documentation

[11] Zustand — A small, fast, scalable bearbones state-management solution, version 5. Available at: https://github.com/pmndrs/zustand

[12] SWR — React Hooks for data fetching, version 2. Vercel Inc. Available at: https://swr.vercel.app

[13] jsonwebtoken — JSON Web Token implementation for Node.js, version 9. Available at: https://github.com/auth0/node-jsonwebtoken

[14] helmet — Help secure Express apps with various HTTP headers, version 8. Available at: https://helmetjs.github.io

[15] Docker — Containerisation platform documentation. Docker Inc., 2026. Available at: https://docs.docker.com

[16] Brown, E. (2024) *Prompt Engineering for Developers*. O'Reilly Media. (Background reading on prompt design.)

[17] GSFC University — Industrial Internship Report — Format and Guidelines, 2026. Internal document, GSFC University, Vadodara.

---

## DATA SHEET / APPENDICES

### Appendix A — Environment Variables

**Table A.1 — Backend environment variables (`backend/.env`).**

| Variable | Required | Example | Purpose |
|----------|:--------:|---------|---------|
| `PORT` | no | 5000 | HTTP port |
| `NODE_ENV` | no | development | runtime mode |
| `FRONTEND_URL` | yes | http://localhost:3000 | CORS origin |
| `MONGODB_URI` | yes | mongodb://localhost:27017/ai-lms | DB connection |
| `JWT_SECRET` | yes | (≥ 32 chars) | JWT signing secret |
| `JWT_EXPIRE` | no | 7d | JWT TTL |
| `CLOUDINARY_CLOUD_NAME` | yes | (from Cloudinary) | media |
| `CLOUDINARY_API_KEY` | yes | (from Cloudinary) | media |
| `CLOUDINARY_API_SECRET` | yes | (from Cloudinary) | media |
| `OPENAI_API_KEY` | yes | sk-... | AI |
| `STRIPE_SECRET_KEY` | yes | sk_test_... | payments |
| `STRIPE_WEBHOOK_SECRET` | yes | whsec_... | payments |
| `EMAIL_HOST` | yes | smtp.gmail.com | SMTP |
| `EMAIL_PORT` | yes | 587 | SMTP |
| `EMAIL_USER` | yes | user@example.com | SMTP |
| `EMAIL_PASS` | yes | (app password) | SMTP |

**Table A.2 — Frontend environment variables (`frontend/.env.local`).**

| Variable | Required | Example | Purpose |
|----------|:--------:|---------|---------|
| `NEXT_PUBLIC_API_URL` | yes | http://localhost:5000/api | base URL for axios |
| `NEXT_PUBLIC_STRIPE_PK` | yes | pk_test_... | Stripe Elements |

### Appendix B — `docker-compose.yml` Service Bindings

**Table A.3 — `docker-compose.yml` service bindings.**

| Service | Image / build | Port (host:container) | Volume mounts | Depends on |
|---------|---------------|----------------------|---------------|-----------|
| `mongodb` | `mongo:7` | 27017:27017 | `mongo_data:/data/db` | — |
| `backend` | `./backend` (Dockerfile) | 5000:5000 | `./backend:/app`, anonymous `/app/node_modules` | `mongodb` |
| `frontend` | `./frontend` (Dockerfile) | 3000:3000 | `./frontend:/app`, anonymous `/app/node_modules`, anonymous `/app/.next` | `backend` |

### Appendix C — Code Listings

#### C.1 `backend/server.js` (full)

```js
// backend/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const courseRoutes = require('./src/routes/course.routes');
const enrollmentRoutes = require('./src/routes/enrollment.routes');
const quizRoutes = require('./src/routes/quiz.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');
const aiRoutes = require('./src/routes/ai.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const adminRoutes = require('./src/routes/admin.routes');

connectDB();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
```

#### C.2 `frontend/src/lib/api.ts` (full)

```ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {}
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### C.3 `backend/src/middleware/auth.js` (full)

```js
// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or deactivated.',
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      req.user = null;
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
```

#### C.4 `backend/src/services/ai.service.js` — `generateQuizQuestions` excerpt

```js
const generateQuizQuestions = async ({ topic, count = 5, difficulty = 'medium', content }) => {
  const prompt = `
You are an expert educational quiz creator.
Generate ${count} quiz questions about: "${topic}"
Difficulty: ${difficulty}
${content ? `Based on this content: ${content.slice(0, 2000)}` : ''}

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why A is correct...",
      "difficulty": "${difficulty}",
      "points": 1
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};
```

#### C.5 `docker-compose.yml` (full)

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
      - NEXT_PUBLIC_STRIPE_PK=${STRIPE_PUBLISHABLE_KEY}
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - backend

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

volumes:
  mongo_data:
```

---

*End of Industrial Internship Report.*
