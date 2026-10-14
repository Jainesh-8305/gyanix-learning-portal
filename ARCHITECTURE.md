# AI-LMS — Architecture Reference
> Last updated: 2026-08-22 (Phase 2 completion)

---

## System Overview

```
┌───────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                             │
│            Next.js 16 (App Router) — localhost:3000               │
│                                                                   │
│  Zustand (auth store) ──→ Axios (lib/api.ts, /api/*) ──→ SWR     │
└──────────────────────────────┬────────────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                   EXPRESS 5 BACKEND — localhost:5000              │
│                                                                  │
│  helmet (CSP) → CORS → global rate-limiter → morgan              │
│      ├── /api/auth          auth.routes.js                       │
│      │     login (10/15min rate-limit)                           │
│      ├── /api/users         user.routes.js                       │
│      ├── /api/courses       course.routes.js  + Cloudinary       │
│      ├── /api/enrollments   enrollment.routes.js                 │
│      ├── /api/quizzes       quiz.routes.js                       │
│      ├── /api/assignments   assignment.routes.js                 │
│      ├── /api/ai            ai.routes.js  → ai.service.js        │
│      ├── /api/payments      payment.routes.js → stripe.service   │
│      └── /api/admin         admin.routes.js  (isAdmin gate)      │
│                                                                  │
│  errorHandler middleware (last)                                  │
└──────────┬──────────────────────┬──────────────────────────────┘
           │ Mongoose 9           │ External APIs
           ▼                      ▼
┌──────────────────┐   ┌───────────────────────────────────────────┐
│   MongoDB         │   │  OpenAI gpt-4o-mini  (ai.service.js)     │
│   (Mongoose 9)    │   │  Stripe              (stripe.service.js)  │
│                   │   │  Cloudinary          (cloudinary.js)      │
│  Models:          │   │  Nodemailer/SMTP     (email.service.js)   │
│  User             │   └───────────────────────────────────────────┘
│  Course           │
│  Enrollment       │
│  Quiz             │
│  Assignment       │
│  Certificate      │
└──────────────────┘
```

---

## Role Model

| Role | Can do |
|------|--------|
| `student` | Browse courses, enroll (free/paid), view lessons, take quizzes, submit assignments, earn certificates |
| `instructor` | Everything student can + create/update/delete courses, create quizzes & assignments, grade submissions, AI quiz generation |
| `admin` | Everything instructor can + approve/reject courses, toggle user status, view global stats |

Role is set at registration and enforced by Express middleware:
- `protect` — verifies JWT and attaches `req.user`
- `isInstructor` — `req.user.role === 'instructor' || 'admin'`
- `isAdmin` — `req.user.role === 'admin'`

---

## REST API Reference

### Auth  `POST /api/auth/*`
| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| POST | `/register` | — | Register; welcome email sent async |
| POST | `/login` | 10/15min rate-limit | JWT returned |
| GET  | `/me` | protect | Current user object |
| POST | `/forgot-password` | — | Generates reset token, emails link |
| POST | `/reset-password` | — | Consumes token, updates password |

### Courses  `GET/POST/PUT/DELETE /api/courses/*`
| Method | Endpoint | Guard |
|--------|----------|-------|
| GET | `/` | optionalAuth |
| GET | `/my-courses` | isInstructor |
| GET | `/:id` | optionalAuth |
| POST | `/` | isInstructor |
| PUT | `/:id` | isInstructor |
| POST | `/:id/submit` | isInstructor |
| DELETE | `/:id` | isInstructor |
| POST | `/upload-thumbnail` | isInstructor |

### Enrollments
| Method | Endpoint | Guard |
|--------|----------|-------|
| GET | `/my` | protect |
| POST | `/:courseId` | protect (free courses only) |
| PUT | `/:courseId/progress` | protect |

### Quizzes
| Method | Endpoint | Guard |
|--------|----------|-------|
| POST | `/` | isInstructor |
| GET | `/course/:courseId` | protect |
| GET | `/:id` | protect |
| PUT | `/:id` | isInstructor |
| DELETE | `/:id` | isInstructor |
| POST | `/:id/submit` | protect |

### Assignments
| Method | Endpoint | Guard |
|--------|----------|-------|
| POST | `/` | isInstructor |
| GET | `/course/:courseId` | protect |
| GET | `/:id` | protect |
| PUT | `/:id` | isInstructor |
| DELETE | `/:id` | isInstructor |
| POST | `/:id/submit` | protect |
| PUT | `/:id/grade/:submissionId` | isInstructor |

### AI
| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| POST | `/generate-quiz` | isInstructor | Generate quiz questions from topic |
| GET  | `/recommendations` | protect | Learning path recommendations |
| POST | `/grade-answer` | isInstructor | AI-grade an open-ended answer |

### Payments
| Method | Endpoint | Guard |
|--------|----------|-------|
| POST | `/create-intent` | protect |
| POST | `/webhook` | raw body (Stripe signature) |

### Admin
| Method | Endpoint | Guard |
|--------|----------|-------|
| GET | `/dashboard` | isAdmin |
| GET | `/users` | isAdmin |
| PUT | `/users/:id/toggle-status` | isAdmin |
| GET | `/courses` | isAdmin |
| GET | `/courses/pending` | isAdmin |
| PUT | `/courses/:id/approve` | isAdmin |
| PUT | `/courses/:id/reject` | isAdmin |
| GET | `/enrollments` | isAdmin |

---

## Payment Flow

```
Frontend → POST /api/payments/create-intent
        ← { clientSecret, amount }

Stripe Elements (CardElement) confirmCardPayment(clientSecret)
        → Stripe processes card
        → Stripe → POST /api/payments/webhook (payment_intent.succeeded)
                 → Enrollment created
                 → Payment receipt email sent to student
                 → Frontend receives webhook result → redirect to /learn
```

---

## Certificate Flow

```
Student watches lessons → PUT /api/enrollments/:courseId/progress
      → progressPercentage = 100%
      → issueCertificate() runs async (non-blocking)
            → generateCertificate() creates PDF (PDFKit)
            → Cloudinary upload (buffer, no temp files)
            → Certificate document saved
            → Linked to Enrollment + User
            → sendCertificateIssued() email sent to student
```

---

## AI Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Quiz generation | ✅ Live | `POST /api/ai/generate-quiz` |
| Learning recommendations | ✅ Live | `GET /api/ai/recommendations` |
| AI answer grading | ✅ Live | `POST /api/ai/grade-answer` (instructor) |
| AI assignment auto-grading | ✅ Live | On submit, if `enableAiGrading=true` |
| Course summary generation | 🔲 Planned (Phase 4) | Function exists in `ai.service.js` but not wired |
| RAG Q&A chatbot | 🔲 Planned (Phase 4) | **Not yet implemented.** Internship report described this — it does not exist in the codebase today |
| Adaptive quizzing | 🔲 Planned (Phase 4) | Quiz model has `isAdaptive` flag |
| Audio summaries | 🔲 Planned (Phase 4) | |

> ⚠️ **Documentation note:** The Internship Report describes a "RAG pipeline" with vector embeddings, semantic chunking, and cosine similarity search. This does not exist in the current codebase. The AI recommendations endpoint uses a simple LLM prompt with course metadata, not retrieval-augmented generation. RAG is planned for Phase 4.

---

## Frontend Route Map

| URL | File | Role Access |
|-----|------|-------------|
| `/` | `app/page.tsx` | Public |
| `/login` | `app/(auth)/login/page.tsx` | Public |
| `/register` | `app/(auth)/register/page.tsx` | Public |
| `/forgot-password` | `app/forgot-password/page.tsx` | Public |
| `/reset-password?token=` | `app/reset-password/page.tsx` | Public |
| `/courses` | `app/courses/page.tsx` | Public |
| `/courses/[id]` | `app/courses/[id]/page.tsx` | Public |
| `/courses/[id]/learn` | `app/courses/[id]/learn/page.tsx` | Enrolled student |
| `/checkout?courseId=` | `app/(payment)/checkout/page.tsx` | Authenticated |
| `/dashboard/student` | `app/dashboard/student/page.tsx` | Student |
| `/dashboard/instructor` | `app/dashboard/instructor/page.tsx` | Instructor |
| `/dashboard/instructor/courses` | … | Instructor |
| `/dashboard/instructor/courses/create` | … | Instructor |
| `/dashboard/instructor/courses/[id]/edit` | … | Instructor |
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | Admin |
| `/dashboard/admin/courses` | … | Admin |
| `/dashboard/admin/users` | … | Admin |
| `/dashboard/admin/enrollments` | … | Admin |

---

## Deployment Targets

| Service | Target | Config |
|---------|--------|--------|
| Frontend | Vercel | `vercel.json` |
| Backend | Railway / Render | `Dockerfile` (to be added) |
| Database | MongoDB Atlas | Change `MONGODB_URI` in env |
| Storage | Cloudinary | Already integrated |
| Email | Gmail SMTP / SendGrid | `EMAIL_*` vars |
