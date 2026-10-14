# AI-LMS — Prompt Registry (PROMPTS.md)
> Centralised documentation for all LLM prompts used in the system.
> Model: `gpt-4o-mini` | Format: `response_format: { type: "json_object" }` on all except `generateCourseSummary`.
> Location: `backend/src/services/ai.service.js`

---

## 1. `generateQuizQuestions`

**Endpoint:** `POST /api/ai/generate-quiz`  
**Guard:** `isInstructor`  
**Temperature:** `0.7` (creative variety in question phrasing)  
**Max tokens:** API default

### Input contract
```json
{
  "topic": "string (required)",
  "count": "number (default: 5)",
  "difficulty": "easy | medium | hard (default: medium)",
  "content": "string (optional — lesson/section text, trimmed to 2000 chars)"
}
```

### Output contract
```json
{
  "questions": [
    {
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why A is correct...",
      "difficulty": "medium",
      "points": 1
    }
  ]
}
```

### Prompt template
```
You are an expert educational quiz creator.
Generate {count} quiz questions about: "{topic}"
Difficulty: {difficulty}
[Based on this content: {content — first 2000 chars}]

Return ONLY valid JSON in this exact format:
{ "questions": [...] }
```

---

## 2. `gradeAnswer`

**Endpoint:** `POST /api/ai/grade-answer`  
**Guard:** `isInstructor` — also auto-called internally on assignment submit when `enableAiGrading: true`  
**Temperature:** `0.3` (low — deterministic grading)

### Input contract
```json
{
  "question": "string",
  "studentAnswer": "string",
  "rubric": "string (optional — defaults to 'Evaluate accuracy, completeness, and clarity')",
  "maxPoints": "number"
}
```

### Output contract
```json
{
  "score": 8,
  "percentage": 80,
  "feedback": "Detailed constructive feedback string...",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}
```

### Prompt template
```
You are a fair and detailed educational grader.

Question: {question}
Student Answer: {studentAnswer}
Grading Rubric: {rubric}
Maximum Points: {maxPoints}

Return ONLY valid JSON: { "score": ..., "percentage": ..., "feedback": ..., "strengths": [...], "improvements": [...] }
```

---

## 3. `generateLearningPath`

**Endpoint:** `GET /api/ai/recommendations`  
**Guard:** `protect` (any authenticated user)  
**Temperature:** `0.4` (structured output, low creativity needed)  
**Fix history:** Was unset (API default ~1.0) before Phase 2 — variable quality output. Fixed.

### Input contract (constructed from DB data in route)
```json
{
  "studentProfile": {
    "completedCourses": ["Course Title 1", "Course Title 2"],
    "interests": ["interest1", "interest2"],
    "level": "beginner | intermediate | advanced",
    "goal": "string"
  },
  "availableCourses": [
    { "_id": "...", "title": "...", "level": "...", "category": "..." }
  ]
}
```

### Output contract
```json
{
  "recommendations": [
    {
      "courseId": "mongoId",
      "reason": "Why this course fits this student",
      "priority": 1
    }
  ],
  "learningPathSummary": "2-3 sentence description of the path"
}
```

### Prompt template
```
You are an expert learning advisor...

Student Profile:
- Completed courses: {completedCourses}
- Interests: {interests}
- Current level: {level}
- Learning goal: {goal}

Available courses (IDs and titles):
{courseList}

Recommend up to 5 courses in order of priority.
Only recommend courses from the list above.
Return ONLY valid JSON: { "recommendations": [...], "learningPathSummary": "..." }
```

---

## 4. `generateCourseSummary`

**Status:** 🔲 **Not wired to any route yet** — preserved for Phase 4  
**Temperature:** `0.5` | **Max tokens:** `200` | **response_format:** plain text (not JSON)

### Purpose
Generate a 3-sentence catalogue blurb to entice student enrollment. Will be called:
- On instructor publish/submit
- Stored in `course.aiGeneratedSummary` field (already on the schema)

### Planned endpoint
`POST /api/ai/generate-summary` with `isInstructor` guard.

---

## Phase 4 Planned Prompts (not yet implemented)

| Feature | Planned temperature | Notes |
|---------|--------------------|----|
| **RAG Q&A chatbot** | 0.2 | Requires vector store (e.g. Pinecone), embedding model, retrieval pipeline — not a simple prompt change |
| **Adaptive quiz selection** | N/A | Logic-based on past attempt scores, no LLM call needed |
| **Audio summary (TTS)** | N/A | OpenAI TTS API or similar, not a chat completion |
| **Plagiarism detection** | 0.1 | Heuristic + LLM check |
| **AI course copilot** | 0.6 | Streaming chat, requires SSE endpoint |

---

## Error handling

All prompts use `response_format: { type: "json_object" }` which instructs the model to
return valid JSON. The `safeParseJSON()` helper in `ai.service.js` wraps every `JSON.parse`
call with a descriptive error and `cause` chain, so any malformed output surfaces with context
instead of a raw `SyntaxError`.
