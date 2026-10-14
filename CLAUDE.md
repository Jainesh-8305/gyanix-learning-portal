# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`ai-lms` — a full-stack AI-powered Learning Management System. Monorepo with two services:

- `backend/` — Node.js + Express 5 + Mongoose 9 (CommonJS, Jest configured)
- `frontend/` — Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4

External services: MongoDB 7, OpenAI (`gpt-4o-mini`), Stripe, Cloudinary, SMTP (nodemailer). Auth is JWT in `Authorization: Bearer …` headers, issued from `backend/src/utils/generateToken.js` and read in `backend/src/middleware/auth.js`. The frontend persists the token via Zustand (`frontend/src/store/useAuthStore.ts`, storage key `auth-storage`); `frontend/src/lib/api.ts` reads it on every request and force-redirects to `/login` on 401.

## Commands

Run from the repo root unless noted. There is **no** `package.json` at the repo root — install and run each service from its own directory.

**Backend** (`backend/`):

```bash
npm install
npm run dev        # nodemon server.js, port 5000
npm start          # node server.js
npm test           # jest
```

**Frontend** (`frontend/`):

```bash
npm install
npm run dev        # next dev, port 3000
npm run build      # next build
npm start          # next start
npm run lint       # eslint (eslint-config-next core-web-vitals + typescript)
```

**Full stack (Docker)** — from repo root:

```bash
docker-compose up --build    # mongo + backend (5000) + frontend (3000)
docker-compose down
```

### Environment files

- `backend/.env` — `PORT`, `NODE_ENV`, `MONGODB_URI`, `JWT_SECRET` (min 32 chars), `JWT_EXPIRE`, `FRONTEND_URL`, `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLOUDINARY_*`, `EMAIL_*` (`HOST`/`PORT`/`USER`/`PASS`/`FROM`). See `backend/.env.example` for the full list.
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (default `http://localhost:5000/api`), `NEXT_PUBLIC_STRIPE_PK`.

Without these the server will crash on boot (Mongoose needs `MONGODB_URI`; auth middleware needs `JWT_SECRET`; AI routes need `OPENAI_API_KEY`). `cookie-parser` is **not** installed even though `auth.js` reads `req.cookies.token` — if you need cookie auth, install it and wire it up.

## Architecture

### Backend (`backend/`)

Entry point: `server.js` → mounts routes under `/api/*` in this order: `auth`, `users`, `courses`, `enrollments`, `quizzes`, `assignments`, `ai`, `payments`, `admin`. Middleware stack (helmet → cors → rate-limit 100/15min on `/api/` → json(10mb) + urlencoded → morgan `dev`) is applied in `server.js`; route-level auth lives in `src/middleware/`. A `/health` endpoint returns `{ status: 'OK', timestamp }`.

> **Stripe webhook gotcha:** `server.js` applies `express.json()` globally before the route mounts, so the Stripe webhook route in `payment.routes.js` will not receive a raw body. The webhook handler must be mounted before the JSON body parser (or use `express.raw({ type: 'application/json' })` on that specific route) for `stripe.webhooks.constructEvent` to verify signatures correctly.

Standard MVC layout under `src/`:

- `models/` — Mongoose schemas. `User.js` is the only fully populated one; the others are present as files but may be empty stubs — verify before relying on a field.
  - `User` carries a `role` enum (`student` | `instructor` | `admin`), bcrypt-hashed `password` (`select: false`), `isActive` flag (deactivated users are blocked by `protect`), arrays for `enrolledCourses` / `completedCourses` / `certificates` / `createdCourses`, `learningStreak` / `totalPoints` / `totalEarnings` / `rating`, and a `learningPreferences` subdoc for AI personalization. The `pre('save')` hook is a no-arg `async function` (no `next` parameter) — this is required for Mongoose 9.
- `controllers/` — one per route file. Several are still empty stubs (`ai`, `assignment`, `payment`, `quiz`, `user`); the populated ones are `auth`, `course`, `enrollment`, `admin`.
- `routes/` — thin Express routers, each delegating to its controller.
- `middleware/`
  - `auth.js` exports `protect` (Bearer header **or** `req.cookies.token`, verifies JWT, loads `User` minus password, blocks if `!isActive`) and `optionalAuth` (attaches `req.user` if token valid, otherwise `null`).
  - `roles.js` exports `authorize(...roles)` and shortcuts `isStudent` / `isInstructor` / `isAdmin`. **Note `isStudent` accepts all three roles** — every authenticated user qualifies.
  - `upload.js` is currently a stub; the Cloudinary/multer wiring referenced by it is not yet implemented.
  - `errorHandler.js` — terminal middleware. Must be last (it is, in `server.js`). Handles Mongoose duplicate-key (11000), `ValidationError`, `JsonWebTokenError`, `TokenExpiredError`; includes `err.stack` only when `NODE_ENV === 'development'`.
- `services/` — domain logic kept out of controllers:
  - `ai.service.js` — every OpenAI call uses `gpt-4o-mini`. JSON-mode calls (`response_format: { type: 'json_object' }`) return `JSON.parse(…)` of the first choice. Four functions: `generateQuizQuestions` (temp 0.7, truncates `content` to 2000 chars), `gradeAnswer` (temp 0.3), `generateLearningPath` (default temp), `generateCourseSummary` (text-only, `max_tokens: 200`, truncates to 3000 chars).
  - `stripe.service.js`, `email.service.js`.
- `config/` — `db.js` (Mongoose connect, exits process on failure), `cloudinary.js`.
- `utils/` — `generateToken.js`, `generateCertificate.js`, `validators.js` are present as files but currently empty.

AI endpoints (see `ai.routes.js` + `ai.controller.js`): `POST /api/ai/generate-quiz`, `GET /api/ai/recommendations`, `POST /api/ai/grade-answer`. All live in `services/ai.service.js`.

### Frontend (`frontend/`)

Next.js 16 App Router under `src/app/`. **`frontend/AGENTS.md` flags that this Next.js version has breaking changes vs. older versions — read `node_modules/next/dist/docs/` before changing routing/Server Components/APIs.**

Top-level routes (the App Router groups in parentheses don't appear in the URL):

- `app/page.tsx` — landing.
- `app/courses/page.tsx` — listing; `app/courses/[id]/page.tsx` — course detail.
- `app/(auth)/login`, `app/(auth)/register` — auth route group.
- `app/forgot-password/` — top-level (not under the `(auth)` group).
- `app/dashboard/student/`, `app/dashboard/instructor/`, `app/dashboard/admin/` — role-gated dashboards, each with subpages (`admin/{courses,enrollments,users}`, `instructor/courses`).
- `app/(payment)/` — Stripe checkout route group.
- `app/layout.tsx` — mounts `<Navbar>` and `<Toaster>` (react-hot-toast, dark theme). Background `#05060f`, Inter font.

- `lib/api.ts` — single axios instance. Reads token from `localStorage['auth-storage']` (Zustand persist), sends `Authorization: Bearer <token>`, and on 401 clears storage and hard-navigates to `/login`. **All backend calls go through this instance** — don't create a second axios/axios-with-credentials client.
- `lib/auth.ts`, `lib/utils.ts` — `auth.ts` is currently empty; `utils.ts` has `cn`/format helpers.
- `store/useAuthStore.ts` — Zustand store with `persist` middleware (key `auth-storage`); the persisted shape is `{ user, token, isAuthenticated }` with `setAuth`/`logout`.
- `hooks/useAuth.ts`, `hooks/useCourses.ts` — read the store + fetch with SWR (useSWR is the fetching convention; check before adding a new pattern).
- `components/{layout,courses,dashboard,quiz,ui}/` — feature-grouped UI. Quiz components live separately from courses because quizzes are also AI-generated.
- `types/index.ts` — shared TypeScript types; `User` is imported by the auth store.

### Roles & authorization

Three roles enforced server-side by `middleware/auth.js` + `middleware/roles.js` and mirrored in the dashboard route group on the frontend. The role hierarchy is `admin ⊃ instructor ⊃ student` (any higher role also satisfies `isStudent`).

### Data flow notes

- Course lifecycle: instructor creates (`POST /api/courses`, status `draft`) → submits for review (`POST /api/courses/:id/submit`) → admin approves/rejects (`PUT /api/admin/courses/:id/{approve,reject}`). Only `published` courses appear in the public listing.
- AI quiz generation: controller calls `ai.service.generateQuizQuestions`, persists the returned JSON into a `Quiz` document keyed to a `Course`/`Lesson`.
- Frontend never talks to MongoDB or OpenAI directly — it goes through `lib/api.ts`.

## Conventions

- Backend is CommonJS (`require` / `module.exports`). Don't introduce ESM.
- Frontend is TypeScript strict; shared types in `src/types/index.ts`.
- All API responses follow `{ success: boolean, message?, data? }` shape (see `errorHandler.js` and controllers).
- Tailwind 4 + MUI 9 are both installed; existing code favors Tailwind for layout/styling and MUI for complex form controls — check the surrounding component before adding a new dependency for the same job.
- `eslint-config-next` (core-web-vitals + typescript presets) is the lint config; run `npm run lint` from `frontend/`.
- Several backend files (`utils/`, `models/Lesson.js`/`Assignment.js`/`Certificate.js`/`ForumPost.js`, `middleware/upload.js`, and the `ai`/`assignment`/`payment`/`quiz`/`user` controllers) are still empty placeholders. If you're adding functionality in those areas, treat the file as a starting point, not a working module.

## Testing

`npm test` runs Jest in `backend/`, but no test files exist yet under the repo (`*.test.*` / `*.spec.*` / `__tests__/` all absent, excluding `node_modules`). When adding tests, follow the default Jest config and place files next to source or under `src/__tests__/`.
