# Gyanix Learning Portal

A college learning portal built with Next.js, React, Express and MongoDB. Students, instructors and administrators have separate workspaces with server-enforced permissions. **All published courses are free.** There is no checkout, payment gateway, pricing configuration or revenue reporting.

## Workspaces and features

- **Students:** enroll or join a classroom, watch lessons, save progress, submit assignments, view their own grades, take timed assessments, download course-completion certificates, save notes and practise SuperMemo-2 flashcards.
- **Instructors:** create curricula, submit courses for review, manage owned classrooms and resource hubs, create batch/reviewed quizzes, draft assignments, inspect their own student roster, review submissions and manually grade work.
- **Administrators:** review and publish courses, request changes, manage visibility/archival, search user accounts, activate/deactivate non-admin accounts and inspect enrollment records.
- **Assistant:** a small floating chat icon on signed-in pages opens a private conversation. It uses role-filtered help documentation, authorized account summaries and saved conversation history. It never decides permissions or executes admin actions. Hindi, Gujarati, English and other languages are handled by the configured LLM.

Notes, flashcards, feedback and conversations are account-owned. A completed lecture record alone does not create a certificate: an enrolled student must complete the published curriculum and pass a server-scored assessment. Certificates are issued by this college project; they are not external accreditation.

## Local setup

Use **Node.js 22.22+**, npm and MongoDB 7. Install from the lockfiles:

```sh
npm ci --prefix backend
npm ci --prefix frontend
cp backend/.env.example backend/.env
```

Set the following in the private, ignored `backend/.env`:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/gyanix
JWT_SECRET=replace-with-a-random-value-of-at-least-32-characters
FRONTEND_URL=http://localhost:3000
API_PUBLIC_URL=http://localhost:5000
```

Generate a signing secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Start MongoDB, then run `npm run dev --prefix backend`.

Create the ignored `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run `npm run dev --prefix frontend`. For a production run, use `npm run build --prefix frontend` and `npm start --prefix frontend`. Public frontend values are fixed at build time. Never put an LLM key in a `NEXT_PUBLIC_` variable.

The API refuses startup without a database connection and a sufficiently long signing secret. `/health` reports readiness. Normal startup does not create accounts or seed courses.

### Local accounts and sample curricula

`npm run seed --prefix backend` is restricted to an explicit loopback MongoDB URI. It creates missing local admin/instructor/student accounts with random passwords and writes new credentials to `.audit-runtime/local-accounts-*.json` (directory mode 700, files mode 600). Existing account passwords are preserved. Sample curricula remain drafts without educational video URLs: add appropriate lectures/durations, review the content and submit for admin approval.

### Existing databases and free access

Back up an existing database before migration. `npm run migrate:free --prefix backend` works only with an explicit loopback URI and removes obsolete pricing/payment fields from course/enrollment records. Learning records are retained. Historical gateway-order collections, if present, are not read or exposed by this application and are left untouched for archival purposes. Old payment API routes return 404. New pricing fields are rejected; any published legacy course can be enrolled in for free.

## Assistant and retrieval setup

Configure these **server-only** variables in `backend/.env`, then restart the API:

```dotenv
OPENAI_API_KEY=
CHAT_MODEL=gpt-5.4-mini
CHAT_EMBEDDING_MODEL=text-embedding-3-small
CHAT_SEMANTIC_SEARCH=true
```

Supply a valid key privately through your environment or a secret manager; leave the example file empty. The key is never returned to the frontend, written in reports or included in Docker images. The current implementation uses the OpenAI Responses API and embedding API. Models are configurable; the account must have access to the configured models.

Retrieval uses the reviewed chunks in `backend/src/knowledge/portal.json` (also displayed in the role-filtered Help centre). BM25 retrieval includes Hindi/Gujarati keyword expansion. When a provider is configured, semantic similarity and keyword ranks are combined. Only role-allowed documentation is embedded/cached. Private notes and account/course summaries are fetched with authenticated ownership predicates for each request, are never shared in an index/cache and are bounded before generation. Answer keys, passwords, email lists and raw submission bodies are excluded from assistant context. Student assignment context contains only that student's permitted grade/feedback.

The backend owns conversation history and verifies account, current role, expiry and generation locks. Client-supplied roles, account IDs, document IDs, arbitrary URLs and histories are not accepted by the chat endpoint. Conversations retain up to 40 messages and expire after 30 days. Retrieval text is treated as untrusted data in model instructions; the assistant has no tools that can change accounts or fetch arbitrary URLs. Citations must match the server-selected sources. See [CHATBOT_SECURITY.md](CHATBOT_SECURITY.md) for boundaries and tests.

With a working provider, the model receives selected authorized evidence and recent private conversation turns. `store: false` disables application response storage through the provider's Responses API; provider retention policies remain separate. Without a key or during an outage, the UI explicitly shows **retrieved help**, not a fabricated AI answer. Hindi/Gujarati/English articles remain available locally; unrestricted natural-language intelligence and other-language quality require the live model. Do not treat an unavailable provider as a successful live test.

Other study-tool generation/grading uses OpenAI when configured. Offline drafts are labelled and require review. Grading failures remain pending for manual instructor review. Text-based PDFs are supported; scanned PDFs require OCR and video study guides require a transcript.

### Optional services

SMTP delivers password-reset and course-review emails. Configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`; verify actual inbox delivery separately. Reset responses stay generic and never expose tokens. Cloudinary is optional for image uploads. Certificates have a direct PDF endpoint. There is no payment service to configure.

## Performance choices

Dashboard navigation uses standard Next links and cached per-account SWR data. The student overview loads one bounded dashboard response. Instructor rosters, gradebooks, quizzes and large modals load only when requested. Chat code loads on first open and makes no background provider calls while unused. Global canvas/cursor animation loops and heavy glass backdrop filtering have been removed; reduced-motion preferences are respected. Indexed ownership queries, bounded retrieval context, strict timeouts, no automatic provider retries and request quotas control work. Cache identity resets on account changes; backend API responses are `no-store`.

## Validation

Start a separate MongoDB on `127.0.0.1:27028`, then:

```sh
npm run lint --prefix backend -- --max-warnings 0
npm test --prefix backend
npm run lint --prefix frontend -- --max-warnings 0
npm run build --prefix frontend
npm run typecheck --prefix frontend
npm audit --prefix backend
npm audit --prefix frontend
```

The test suite creates unique disposable databases and cleans only those databases. It disables live keys, captures reset mail and tests owned data, moderation, free enrollment, progress/assessments, certificates, assignments, privacy, persistence, multilingual retrieval, conversation ownership, spoofed roles, expiry, provider failure and quotas. Provider-contract tests use a controlled mock; actual model quality must also be tested with a configured key. CI starts test MongoDB automatically. A workflow added locally is not a completed GitHub run.

## Docker

Supply a strong `JWT_SECRET` through the environment, set the intended frontend/API URLs and optional LLM/SMTP configuration, then:

```sh
docker compose build
docker compose up -d
```

Frontend public variables are supplied at build time. Production images run as non-root users and use Next standalone output with no source bind mounts. Default app/API ports bind only to loopback (3000/5000). MongoDB is internal to Compose. Configure public HTTPS ingress separately when intentionally deploying.

## Audit documents

The original audit under `audit/` and the earlier fix report under `audit/fixes/` are historical snapshots. The latest enhancement report records the additional dashboard, free-access, performance and assistant work, including credential-dependent limitations. No local change is automatically pushed or deployed.

## Project presentation and QA snapshot

- [Teacher presentation with speaker notes](presentation/output/Gyanix_Project_Presentation.pptx)
- [Final audit and QA report (PDF)](audit/enhancements/output/pdf/Gyanix_Final_Audit_and_QA_Report.pdf)
- [Readable audit report](audit/enhancements/Gyanix_Final_Audit_and_QA_Report.md)
- [Finding-by-finding resolution matrix](audit/enhancements/resolution-matrix.json)
- [QA results snapshot](audit/enhancements/evidence/qa-summary.json)

The reports record local verification on 15 October 2026, before the source was committed and pushed. Their statements about uncommitted changes describe that snapshot. Live LLM quality, SMTP inbox delivery and Cloudinary upload delivery remain pending credential-backed verification. Private runtime data, credentials, database backups and build artifacts are excluded from Git.

MIT license: see `LICENSE`.
