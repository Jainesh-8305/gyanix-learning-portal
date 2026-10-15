# Gyanix architecture

## Runtime and boundaries

Next.js serves the portal and three role workspaces. Express exposes authenticated/authorized APIs backed by MongoDB. Bearer JWTs are checked against the current active account and token version. Frontend hydration/session guards improve navigation; every protected API independently checks permissions. Exact configured CORS origins are allowed. Normal startup waits for MongoDB and never seeds data. All published courses are free; there is no payment gateway, checkout or revenue module.

## Data

Users own enrollments, notes, flashcards, private feedback and chat conversations. Instructors own courses, quizzes, assignments and resource hubs. Administrators moderate courses and manage permitted account status changes. Query indexes support ownership, course and chronological lookups. Archived courses keep learning references. Public course responses remove protected lesson media; owner editors keep private URLs. Historical financial fields are omitted from API serialization and can be removed by an explicit backed-up local migration.

Lesson completion is checked against the saved curriculum and server-recorded watch heartbeats. Quiz keys stay server-owned. Persistent attempts enforce enrollment, expiry, count and replay limits. Passing a certification assessment after lesson completion issues a certificate backed by a passed attempt. Public verification excludes account email and rejects unbacked credentials. Assignment deadlines and numeric score ranges are enforced; students receive only their own submissions, and reference keys are private.

## Frontend

The shared workspace shell supplies consistent sidebar navigation, active states, mobile horizontal navigation and keyboard focus styles. Student summary data uses one bounded endpoint; instructor rosters, quizzes, gradebooks and modals load on demand. SWR caches are reset at identity changes and revalidate on focus/reconnection. API responses are not browser/shared-cacheable. The floating assistant is account/role scoped, lazy loads on first use, stays available across relevant pages and does not occupy a dashboard card. Decorative global animation loops and expensive backdrop filtering are removed.

## Retrieval and LLM generation

Reviewed, role-tagged help chunks live in `backend/src/knowledge/portal.json` and power both Help centre and chat retrieval. BM25 with multilingual expansion runs locally. With a configured provider, role-filtered documentation embeddings contribute semantic ranks. Only reviewed static documentation is cached/embedded. Per-request, ownership-filtered account/course/notes/grade summaries provide relevant private context; no private shared vector store exists.

The backend owns conversation history and passes bounded selected evidence plus recent permitted turns to a configurable OpenAI Responses model. Citations are checked against retrieved IDs. The model cannot call tools, change permissions or read arbitrary files/URLs. Keys live only in server configuration. Clear retrieval-only help remains available when generation is unconfigured or unavailable. Live model quality, factuality and multilingual fluency require provider-backed evaluation; deterministic role tests remain separate.

## Delivery and verification

The repository includes Node/Mongo integration tests, ESLint checks, TypeScript checks, production builds, dependency audits and CI. Docker uses non-root production images and Next standalone output with build-time public API settings, without application source mounts. Separate local QA databases and synthetic accounts isolate test writes. Original and later QA reports are dated evidence, not proof of a public deployment.
