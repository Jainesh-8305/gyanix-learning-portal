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
