'use client';
/**
 * Quiz-Taking Page — /courses/[id]/quiz/[quizId]
 *
 * Student experience:
 *   1. Quiz loads with timer countdown
 *   2. One question shown at a time with smooth transitions
 *   3. Progress bar and question counter
 *   4. Submit → animated results screen showing score + per-question breakdown
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  BookOpen,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { QuizSkeleton } from '@/components/ui/SkeletonLoader';

/* eslint-disable @typescript-eslint/no-explicit-any */

const fetcher = (url: string) => api.get(url).then((r) => r.data);

// ── Timer hook ────────────────────────────────────────────────
function useTimer(expiresAt: string | undefined, onExpire: () => void) {
  const [seconds, setSeconds] = useState(0);
  const callback = useRef(onExpire);
  useEffect(() => {
    callback.current = onExpire;
  });
  useEffect(() => {
    if (!expiresAt) return;
    const deadline = new Date(expiresAt).getTime();
    if (!Number.isFinite(deadline)) return;
    let fired = false;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0 && !fired) {
        fired = true;
        callback.current();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  return {
    mins: Math.floor(seconds / 60),
    secs: seconds % 60,
    isLow: seconds < 60,
  };
}

// ── Result screen ─────────────────────────────────────────────
function ResultScreen({ result, courseId }: { result: any; courseId: string }) {
  const { percentage, passed, score, possible, results } = result;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full animate-scale-in">
        {/* Score hero */}
        <div className="glass rounded-[var(--radius-2xl)] p-10 text-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-teal-500/5" />

          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold
            ${
              passed
                ? 'bg-teal-500/15 border-2 border-teal-500/40 text-teal-300 shadow-[0_0_40px_-8px_rgba(20,184,166,0.4)]'
                : 'bg-red-500/15 border-2 border-red-500/40 text-red-300'
            }`}
          >
            {percentage}%
          </div>

          <h1 className="text-2xl font-semibold text-white mb-1">
            {passed ? '🎉 You passed!' : '📚 Almost there'}
          </h1>
          <p className="text-indigo-200/60 text-sm mb-6">
            {score} out of {possible} points · Passing score:{' '}
            {result.passingScore}%
          </p>

          {passed && (
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-4 py-2 rounded-full text-sm font-medium">
              <Trophy size={15} /> Congratulations!
            </div>
          )}
        </div>

        {/* Per-question breakdown */}
        <div className="glass rounded-[var(--radius-xl)] p-6 mb-6">
          <h2 className="text-white font-medium mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" />
            Question breakdown
          </h2>
          <div className="space-y-3">
            {results.map((r: any, i: number) => (
              <div
                key={r.questionId || i}
                className={`p-4 rounded-[var(--radius-lg)] border text-sm ${
                  r.pendingReview
                    ? 'bg-amber-500/5 border-amber-500/20'
                    : r.isCorrect
                      ? 'bg-teal-500/5 border-teal-500/15'
                      : 'bg-red-500/5 border-red-500/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {r.pendingReview ? (
                      <AlertTriangle size={15} className="text-amber-400" />
                    ) : r.isCorrect ? (
                      <CheckCircle2 size={15} className="text-teal-400" />
                    ) : (
                      <XCircle size={15} className="text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-indigo-100/90 font-medium leading-snug mb-1">
                      Q{i + 1}. {r.question}
                    </p>
                    {r.pendingReview ? (
                      <p className="text-amber-400/70 text-xs">
                        Pending instructor review
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-indigo-300/50 mb-0.5">
                          Your answer:{' '}
                          <span
                            className={
                              r.isCorrect ? 'text-teal-400' : 'text-red-400'
                            }
                          >
                            {r.studentAnswer || '—'}
                          </span>
                        </p>
                        {!r.isCorrect && r.correctAnswer && (
                          <p className="text-xs text-indigo-300/50 mb-0.5">
                            Correct:{' '}
                            <span className="text-teal-400">
                              {r.correctAnswer}
                            </span>
                          </p>
                        )}
                        {r.explanation && (
                          <p className="text-xs text-indigo-300/40 mt-1 italic">
                            {r.explanation}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="shrink-0 text-xs font-medium text-indigo-300/50">
                    {r.pointsEarned ?? '?'}/{r.pointsPossible}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/courses/${courseId}/learn`} className="flex-1">
            <Button
              variant="secondary"
              fullWidth
              icon={<ArrowLeft size={15} />}
            >
              Back to course
            </Button>
          </Link>
          {!passed && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => window.location.reload()}
              icon={<ChevronRight size={15} />}
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main quiz page ─────────────────────────────────────────────
export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const quizId = params.quizId as string;

  const { data, isLoading } = useSWR(`/quizzes/${quizId}`, fetcher);
  const quiz = data?.data;

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleExpire = () => {
    if (!submitted && !submitting) {
      toast.error('The server assessment deadline has arrived.');
      void handleSubmit();
    }
  };

  const { mins, secs, isLow } = useTimer(quiz?.expiresAt, handleExpire);

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${quizId}/submit`, {
        answers,
        attemptId: quiz.attemptId,
      });
      setResult(res.data.data);
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && result)
    return <ResultScreen result={result} courseId={courseId} />;

  if (isLoading || !quiz) {
    return (
      <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <QuizSkeleton />
        </div>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const q = questions[currentQ];
  const totalQ = questions.length;
  const progress = ((currentQ + 1) / totalQ) * 100;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] px-4 py-8">
      {/* Glow blobs */}
      <div className="fixed top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl mx-auto">
        {/* ── Header bar ────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-indigo-300/50 hover:text-white text-sm transition"
          >
            <ArrowLeft size={14} /> Exit quiz
          </button>

          {/* Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
              isLow
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : 'glass border-[var(--border-subtle)] text-indigo-300'
            }`}
          >
            <Clock size={13} />
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>

        {/* ── Quiz card ─────────────────────────────────────── */}
        <div className="glass rounded-[var(--radius-2xl)] p-8 animate-fade-up stagger-1">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-indigo-300/50 mb-2">
              <span className="font-medium text-indigo-200/70">
                {quiz.title}
              </span>
              <span>
                Question {currentQ + 1} of {totalQ}
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div key={currentQ} className="animate-fade-up">
            <h2 className="text-lg font-medium text-white mb-1">
              {currentQ + 1}. {q.question}
            </h2>
            {q.difficulty && (
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full border mb-5 ${
                  q.difficulty === 'easy'
                    ? 'text-teal-400 border-teal-400/20 bg-teal-400/8'
                    : q.difficulty === 'hard'
                      ? 'text-red-400 border-red-400/20 bg-red-400/8'
                      : 'text-amber-400 border-amber-400/20 bg-amber-400/8'
                }`}
              >
                {q.difficulty}
              </span>
            )}

            {/* Options */}
            <div className="space-y-3 mt-4">
              {(q.options || []).map((opt: string, i: number) => {
                const letter = String.fromCharCode(65 + i); // A, B, C, D
                const selected = answers[q._id] === opt;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q._id]: opt }))
                    }
                    className={`w-full text-left flex items-center gap-4 p-4 rounded-[var(--radius-lg)] border transition-all duration-200 group ${
                      selected
                        ? 'bg-indigo-500/15 border-indigo-400/50 shadow-[0_0_20px_-4px_rgba(99,102,241,0.3)]'
                        : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-white/3'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                        selected
                          ? 'bg-indigo-500 text-white'
                          : 'bg-white/5 text-indigo-300/60 group-hover:bg-white/10'
                      }`}
                    >
                      {letter}
                    </span>
                    <span
                      className={`text-sm ${selected ? 'text-white font-medium' : 'text-indigo-200/80'}`}
                    >
                      {opt}
                    </span>
                    {selected && (
                      <CheckCircle2
                        size={16}
                        className="ml-auto shrink-0 text-indigo-400"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Navigation ────────────────────────────────────── */}
        <div className="flex items-center gap-3 mt-5 animate-fade-up stagger-2">
          <Button
            variant="secondary"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((q) => q - 1)}
            icon={<ChevronLeft size={15} />}
          >
            Previous
          </Button>

          {currentQ < totalQ - 1 ? (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => setCurrentQ((q) => q + 1)}
              icon={<ChevronRight size={15} />}
            >
              Next question
            </Button>
          ) : (
            <Button
              variant="teal"
              className="flex-1"
              loading={submitting}
              onClick={handleSubmit}
              icon={<Trophy size={15} />}
            >
              Submit quiz
            </Button>
          )}
        </div>

        {/* Question dots navigator */}
        <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
          {questions.map((_: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentQ
                  ? 'bg-indigo-400 scale-125'
                  : answers[questions[i]?._id]
                    ? 'bg-teal-500/60'
                    : 'bg-white/15 hover:bg-white/30'
              }`}
              title={`Question ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
