"use client";
/**
 * AI Quiz Generator — instructor modal component.
 *
 * Flow:
 *   1. Form: topic, count, difficulty, optional lesson content
 *   2. Loading: animated star/orbit loader while AI generates questions
 *   3. Review: editable question cards — instructors can tweak before saving
 *   4. Save: POST /api/quizzes to create the quiz with reviewed questions
 *
 * Usage:
 *   <AIQuizGenerator courseId={id} onClose={() => setOpen(false)} onCreated={(quiz) => mutate()} />
 */

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Sparkles,
  X,
  ChevronRight,
  Pencil,
  Check,
  Trash2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { apiError } from "@/lib/errors";
interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  type?: string;
  points?: number;
}
interface CreatedQuiz {
  _id: string;
  title: string;
}

// ── Step 1: Configuration form ─────────────────────────────────
// Form fields are all strings (HTML inputs), we parse numbers manually in submit handler.
type ConfigForm = {
  title: string;
  topic: string;
  count: string;
  difficulty: "easy" | "medium" | "hard";
  content: string;
  timeLimit: string;
  passingScore: string;
};

interface AIQuizGeneratorProps {
  courseId: string;
  onClose: () => void;
  onCreated?: (quiz: CreatedQuiz) => void;
}

// ── Editable question card ─────────────────────────────────────
function QuestionCard({
  q,
  index,
  onChange,
  onDelete,
}: {
  q: GeneratedQuestion;
  index: number;
  onChange: (updated: GeneratedQuestion) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localQ, setLocalQ] = useState(q);

  const save = () => {
    onChange(localQ);
    setEditing(false);
  };

  return (
    <div
      className="glass rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)] animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="w-6 h-6 bg-indigo-500/15 text-indigo-400 text-xs font-bold rounded-md flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          {editing ? (
            <textarea
              aria-label={`Question ${index + 1} text`}
              className="w-full bg-white/5 border border-[var(--border-default)] rounded-lg p-2 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
              value={localQ.question}
              onChange={(e) =>
                setLocalQ((p: GeneratedQuestion) => ({
                  ...p,
                  question: e.target.value,
                }))
              }
              rows={2}
            />
          ) : (
            <p className="text-sm text-white font-medium leading-snug">
              {q.question}
            </p>
          )}
        </div>
        <div className="flex gap-1 shrink-0">
          {editing ? (
            <button
              aria-label={`Save question ${index + 1}`}
              onClick={save}
              className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-400 hover:bg-teal-500/25 flex items-center justify-center transition"
            >
              <Check size={13} />
            </button>
          ) : (
            <button
              aria-label={`Edit question ${index + 1}`}
              onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg bg-white/5 text-indigo-300/60 hover:text-indigo-200 hover:bg-white/10 flex items-center justify-center transition"
            >
              <Pencil size={12} />
            </button>
          )}
          <button
            aria-label={`Remove question ${index + 1}`}
            onClick={onDelete}
            className="w-7 h-7 rounded-lg bg-white/5 text-indigo-300/40 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-1.5 ml-9">
        {(localQ.options || []).map((opt: string, i: number) => {
          const letter = String.fromCharCode(65 + i);
          const isCorrect = opt === localQ.correctAnswer;
          return (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${
                isCorrect
                  ? "bg-teal-500/8 border-teal-500/20 text-teal-300"
                  : "border-[var(--border-subtle)] text-indigo-300/60"
              }`}
            >
              <span
                className={`font-bold ${isCorrect ? "text-teal-400" : "text-indigo-400/60"}`}
              >
                {letter}.
              </span>
              <span>{opt}</span>
              {isCorrect && (
                <Check size={10} className="ml-auto text-teal-400" />
              )}
            </div>
          );
        })}
      </div>

      {q.explanation && (
        <p className="ml-9 mt-2 text-xs text-indigo-300/40 italic">
          💡 {q.explanation}
        </p>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
import { useDialogFocus } from "@/hooks/useDialogFocus";

export function AIQuizGenerator({
  courseId,
  onClose,
  onCreated,
}: AIQuizGeneratorProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose);
  const [step, setStep] = useState<"config" | "loading" | "review">("config");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [config, setConfig] = useState<ConfigForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [generationMode, setGenerationMode] = useState("offline");

  const { register, handleSubmit } = useForm<ConfigForm>({
    defaultValues: {
      count: "5",
      difficulty: "medium",
      timeLimit: "30",
      passingScore: "70",
    },
  });

  // Step 1: Call AI to generate questions
  const onGenerate = async (data: ConfigForm) => {
    setConfig(data);
    setStep("loading");
    window.dispatchEvent(new Event("gyanix:ai-start"));
    try {
      const res = await api.post("/ai/generate-quiz", {
        topic: data.topic,
        count: data.count,
        difficulty: data.difficulty,
        content: data.content,
      });
      const qs = res.data.data?.questions || [];
      setQuestions(qs);
      setGenerationMode(res.data.data?.mode || "offline");
      setStep("review");
    } catch (err: unknown) {
      toast.error(apiError(err, "AI generation failed"));
      setStep("config");
    } finally {
      window.dispatchEvent(new Event("gyanix:ai-end"));
    }
  };

  // Step 3: Save the reviewed quiz
  const onSave = async () => {
    if (!config || questions.length === 0) return;
    setSaving(true);
    try {
      const res = await api.post("/quizzes", {
        title: config.title,
        courseId,
        questions,
        timeLimit: Number(config.timeLimit),
        passingScore: Number(config.passingScore),
        isRandomized: true,
      });
      toast.success("Quiz created successfully!");
      onCreated?.(res.data.data);
      onClose();
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to save quiz"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        role="button"
        aria-label="Dismiss quiz generator"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault();
            event.currentTarget.click();
          }
        }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Solid Opaque Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-[#0c0f24] rounded-3xl border border-indigo-500/30 shadow-2xl shadow-black overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-indigo-500/20 bg-[#121735] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles size={17} className="text-[#05060f]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-base">
                AI Quiz Generator
              </h2>
              <p className="text-indigo-300/50 text-xs">
                {step === "config" && "Configure your quiz"}
                {step === "loading" && "AI is generating questions…"}
                {step === "review" &&
                  `Review ${questions.length} generated questions`}
              </p>
            </div>
          </div>
          <button
            aria-label="Close quiz generator"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-indigo-300/60 hover:text-white flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* ── Step 1: Config ────────────────────────────── */}
          {step === "config" && (
            <form
              id="quiz-gen-form"
              onSubmit={handleSubmit(onGenerate)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-1"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Quiz title
                  </label>
                  <input
                    id="field-quizAIQuizGeneratortsx-1"
                    {...register("title")}
                    placeholder="e.g. Intro to React — Chapter 1 Quiz"
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm placeholder-indigo-300/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-2"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Topic for quiz generation
                  </label>
                  <input
                    id="field-quizAIQuizGeneratortsx-2"
                    {...register("topic")}
                    placeholder="e.g. React hooks and state management"
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm placeholder-indigo-300/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-3"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Number of questions
                  </label>
                  <input
                    id="field-quizAIQuizGeneratortsx-3"
                    {...register("count")}
                    type="number"
                    min={2}
                    max={20}
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-4"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Difficulty
                  </label>
                  <select
                    id="field-quizAIQuizGeneratortsx-4"
                    {...register("difficulty")}
                    className="w-full px-4 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-5"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Time limit (min)
                  </label>
                  <input
                    id="field-quizAIQuizGeneratortsx-5"
                    {...register("timeLimit")}
                    type="number"
                    min={5}
                    max={120}
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-6"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Passing score (%)
                  </label>
                  <input
                    id="field-quizAIQuizGeneratortsx-6"
                    {...register("passingScore")}
                    type="number"
                    min={1}
                    max={100}
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400/50 transition"
                  />
                </div>

                <div className="col-span-2">
                  <label
                    htmlFor="field-quizAIQuizGeneratortsx-7"
                    className="block text-sm font-medium text-indigo-100/80 mb-1.5"
                  >
                    Lesson content
                    <span className="text-indigo-300/40 font-normal ml-1">
                      (optional — improves question accuracy)
                    </span>
                  </label>
                  <textarea
                    id="field-quizAIQuizGeneratortsx-7"
                    {...register("content")}
                    rows={4}
                    placeholder="Paste lesson text or notes here…"
                    className="w-full px-4 py-2.5 bg-white/5 border border-[var(--border-default)] rounded-[var(--radius-md)] text-white text-sm placeholder-indigo-300/30 focus:outline-none focus:ring-1 focus:ring-indigo-400/50 resize-none transition"
                  />
                </div>
              </div>
            </form>
          )}

          {/* ── Step 2: Loading ────────────────────────────── */}
          {step === "loading" && (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
              {/* Animated orbit rings */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-spin-slow" />
                <div
                  className="absolute inset-2 rounded-full border-2 border-teal-500/30"
                  style={{
                    animationDuration: "4s",
                    animation: "spin-slow 4s linear infinite reverse",
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles
                    size={22}
                    className="text-indigo-400 animate-pulse"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-medium mb-1">
                  Generating your quiz…
                </p>
                <p className="text-indigo-300/50 text-sm">
                  AI is crafting {config?.count} questions about{" "}
                  <span className="text-indigo-300">{config?.topic}</span>
                </p>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Review ─────────────────────────────── */}
          {step === "review" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-amber-500/8 border border-amber-500/20 text-amber-400/80 text-sm">
                <AlertTriangle size={14} className="shrink-0" />
                {generationMode === "offline"
                  ? "Offline template questions. Review and edit every question before saving."
                  : "OpenAI draft. Review every question before saving."}
              </div>

              {questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  index={i}
                  q={q}
                  onChange={(updated) =>
                    setQuestions((qs) =>
                      qs.map((x, j) => (j === i ? updated : x)),
                    )
                  }
                  onDelete={() =>
                    setQuestions((qs) => qs.filter((_, j) => j !== i))
                  }
                />
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8 text-indigo-300/40 text-sm">
                  All questions deleted. Go back to regenerate.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border-subtle)] flex gap-3 shrink-0">
          {step === "config" && (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="quiz-gen-form"
                variant="primary"
                className="flex-1"
                icon={<Sparkles size={15} />}
              >
                Generate with AI
              </Button>
            </>
          )}

          {step === "review" && (
            <>
              <Button
                variant="ghost"
                onClick={() => setStep("config")}
                icon={<ChevronRight size={14} className="rotate-180" />}
              >
                Regenerate
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                loading={saving}
                onClick={onSave}
                icon={<Plus size={15} />}
                disabled={questions.length === 0}
              >
                Save quiz ({questions.length} questions)
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIQuizGenerator;
