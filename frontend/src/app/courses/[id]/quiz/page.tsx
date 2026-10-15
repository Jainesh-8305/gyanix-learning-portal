/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  RotateCcw,
  Award,
  Brain,
  Lock,
  PlayCircle,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import AstroMascot from '@/components/ui/AstroMascot';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

// ── Timer Hook ────────────────────────────────────────────────
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

export default function CourseQuizHubPage() {
  const params = useParams();
  const courseId = params.id as string;

  const { data: courseData, isLoading: courseLoading } = useSWR(
    `/courses/${courseId}`,
    fetcher,
  );
  const {
    data: quizData,
    error: quizError,
    isLoading: quizLoading,
  } = useSWR(`/ai/course-quiz/${courseId}`, fetcher, {
    shouldRetryOnError: false,
  });
  const { data: enrollmentData } = useSWR('/enrollments/my', fetcher);

  const course = courseData?.data;
  const quiz = quizData?.data;
  const questions = quiz?.questions || [];

  const enrollment = enrollmentData?.data?.find(
    (e: any) => e.course?._id === courseId || e.course === courseId,
  );

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const confirmRef = useRef<HTMLDivElement>(null);
  useDialogFocus(
    confirmRef,
    () => setShowConfirmModal(false),
    showConfirmModal,
  );

  const handleExpire = () => {
    if (!submitted && !submitting) {
      toast.error('The server assessment deadline has arrived.');
      void handleSubmit();
    }
  };

  const { mins, secs, isLow } = useTimer(quiz?.expiresAt, handleExpire);

  async function handleSubmit() {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);
    setShowConfirmModal(false);
    try {
      const res = await api.post(`/ai/course-quiz/${courseId}/submit`, {
        answers,
        attemptId: quiz.attemptId,
      });
      setResult(res.data.data);
      setSubmitted(true);
      if (res.data.data?.passed) {
        toast.success(
          '🎉 Congratulations! You passed the AI Course Assessment!',
        );
      } else {
        toast('Review the explanations and try again!', { icon: '📚' });
      }
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Submission failed. Please check your connection and try again.';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  }

  // Check if locked: only if backend explicitly reported locked and questions are not available
  const isLocked =
    Boolean(quizError?.response?.data?.isLocked) && !quiz?.questions?.length;

  const totalLessons =
    quizError?.response?.data?.totalLessons ||
    course?.sections?.reduce(
      (acc: number, s: any) => acc + (s.lessons?.length || 0),
      0,
    ) ||
    0;
  const completedLessons =
    quizError?.response?.data?.completedLessons ||
    enrollment?.completedLessons?.length ||
    0;
  const progressPct =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  if (courseLoading || quizLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-transparent flex items-center justify-center p-6">
        <div className="glass-card rounded-2xl p-8 border border-indigo-500/25 shadow-2xl flex flex-col items-center gap-3 text-center">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-teal-400 rounded-full animate-spin" />
          <p className="text-sm text-white font-bold">
            Loading your saved assessment...
          </p>
          <p className="text-xs text-indigo-200/60 max-w-xs">
            Checking enrollment, lesson completion and the server attempt
            deadline.
          </p>
        </div>
      </div>
    );
  }

  // ── LOCKED GATE SCREEN: Must finish all lectures first ────────────
  if (isLocked) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-transparent p-4 sm:p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full mx-auto space-y-6 relative z-10">
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex justify-center mb-2">
              <div className="w-20 h-20 rounded-full bg-amber-500/15 border-2 border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Lock className="w-9 h-9 text-amber-300" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold mb-3">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Prerequisites Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                AI Assessment Quiz Locked
              </h1>
              <p className="text-sm text-indigo-200/70 mt-2 leading-relaxed">
                Complete all <strong>{totalLessons} video lectures</strong>{' '}
                before attending the AI Assessment Quiz and unlocking a project
                course-completion certificate.
              </p>
            </div>

            {/* Lecture Progress Bar */}
            <div className="bg-black/30 p-4 rounded-2xl border border-indigo-500/15 space-y-2">
              <div className="flex justify-between text-xs font-bold text-indigo-200/80">
                <span>Lecture Completion Status</span>
                <span className="text-amber-300">
                  {completedLessons} / {totalLessons} Lectures ({progressPct}%)
                </span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-indigo-500/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-teal-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/courses/${courseId}/learn`}
                className="flex-1 py-3.5 px-5 rounded-xl glow-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
              >
                <PlayCircle className="w-4 h-4 text-teal-300" />
                <span>Resume Video Lectures 🚀</span>
              </Link>
              <Link
                href={`/courses/${courseId}`}
                className="py-3.5 px-5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 text-center transition"
              >
                Course Syllabus
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Result Screen ─────────────────────────────────────────────
  if (submitted && result) {
    const { percentage, passed, score, total, results, certificateId } = result;

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-transparent p-4 sm:p-6 lg:p-8 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl w-full mx-auto space-y-6 relative z-10">
          {/* Score Hero Card */}
          <div className="glass-card rounded-3xl p-8 sm:p-10 text-center border border-indigo-500/25 relative overflow-hidden space-y-5">
            <div className="flex justify-center mb-2">
              <AstroMascot role="student" className="w-24 h-24" />
            </div>

            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-3xl font-extrabold border-2 shadow-2xl ${
                passed
                  ? 'bg-teal-500/15 border-teal-500/40 text-teal-300 shadow-teal-500/20'
                  : 'bg-rose-500/15 border-rose-500/40 text-rose-300 shadow-rose-500/20'
              }`}
            >
              {percentage}%
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {passed ? '🎉 Assessment Passed!' : '📚 Keep Exploring!'}
              </h1>
              <p className="text-sm text-indigo-200/70 mt-1">
                You scored <strong className="text-white">{score}</strong> out
                of <strong className="text-white">{total}</strong> questions
                correctly. (Passing: {result.passingScore}%)
              </p>
            </div>

            {passed && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs font-bold">
                  <Trophy className="w-4 h-4 text-teal-400" />
                  <span>Certified Graduate</span>
                </div>
                {certificateId && (
                  <Link
                    href={`/certificates/${certificateId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glow-btn-teal text-xs font-semibold shadow-lg"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Official Certificate</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Per-Question Breakdown */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-400" />
              <span>AI Evaluation & Answer Breakdown</span>
            </h2>

            <div className="space-y-3">
              {results.map((r: any, i: number) => (
                <div
                  key={i}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    r.isCorrect
                      ? 'bg-teal-500/8 border-teal-500/20'
                      : 'bg-rose-500/8 border-rose-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {r.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold leading-relaxed">
                        Q{i + 1}. {r.question}
                      </p>
                      <p className="text-indigo-200/60 mt-1">
                        Your answer:{' '}
                        <span
                          className={
                            r.isCorrect
                              ? 'text-teal-300 font-bold'
                              : 'text-rose-300 font-bold'
                          }
                        >
                          {r.studentAnswer || 'Unanswered'}
                        </span>
                      </p>
                      {!r.isCorrect && (
                        <p className="text-teal-300/90 mt-0.5">
                          Correct answer: <strong>{r.correctAnswer}</strong>
                        </p>
                      )}
                      {r.explanation && (
                        <p className="text-indigo-200/50 mt-1.5 italic bg-black/20 p-2.5 rounded-xl border border-indigo-500/10">
                          💡 AI Explanation: {r.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href={`/courses/${courseId}/learn`}
              className="flex-1 py-3 px-4 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 text-center transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Course</span>
            </Link>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 py-3 px-4 rounded-xl glow-btn-primary text-xs font-semibold text-center transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake Quiz</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Quiz Active Taking Screen ──────────────────────────────────
  const q = questions[currentQ];
  const totalQ = questions.length;
  const currentProgressPct =
    totalQ > 0 ? Math.round(((currentQ + 1) / totalQ) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-transparent p-4 sm:p-6 lg:p-8 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Confirmation Modal For Submitting Quiz Early */}
      {showConfirmModal && (
        <div
          ref={confirmRef}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="glass-card max-w-md w-full rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-400/40 text-teal-300 flex items-center justify-center mx-auto text-xl shadow-lg">
              🎯
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-white">
                Ready to Submit Quiz?
              </h3>
              <p className="text-xs text-indigo-200/70">
                You do not need to wait for the 15-minute timer to finish! The
                server will compare your answers against the stored answer key.
              </p>
            </div>

            <div className="bg-[#05060f]/80 p-4 rounded-2xl border border-indigo-500/20 space-y-2 text-xs">
              <div className="flex justify-between text-indigo-200">
                <span>Questions Answered:</span>
                <span className="font-bold text-white">
                  {answeredCount} of {totalQ}
                </span>
              </div>
              <div className="flex justify-between text-indigo-200">
                <span>Time Remaining:</span>
                <span className="font-bold text-teal-300">
                  {mins}m {secs}s
                </span>
              </div>
              {answeredCount < totalQ && (
                <p className="text-amber-300/90 text-[11px] pt-1 border-t border-indigo-500/15">
                  ⚠️ You have {totalQ - answeredCount} unanswered questions.
                  Unanswered questions receive 0 points.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-indigo-500/25 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 transition cursor-pointer"
              >
                Keep Reviewing
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowConfirmModal(false);
                  handleSubmit();
                }}
                className="flex-1 py-3 rounded-xl glow-btn-teal text-xs font-bold text-white transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting…' : 'Submit Now 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl w-full mx-auto space-y-6 relative z-10">
        <p className="text-sm text-indigo-200">
          {quiz.generationMode === 'offline'
            ? 'Offline template assessment - generic practice questions; not live AI.'
            : quiz.generationMode === 'live'
              ? 'Questions drafted using OpenAI; scored against a saved answer key.'
              : 'Saved assessment; scored against the instructor answer key.'}
        </p>
        {/* Header Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-200/80 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Lecture</span>
          </Link>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Early Submit Action Button */}
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={submitting}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold shadow-lg shadow-teal-500/25 flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              title="Submit quiz immediately without waiting for the timer to expire"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                Submit Early ({answeredCount}/{totalQ})
              </span>
            </button>

            {/* Timer Pill */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-colors ${
                isLow
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'glass-card border-indigo-500/30 text-teal-300'
              }`}
              title="Time remaining (You can submit anytime before expiry!)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Quiz Question Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 shadow-2xl space-y-6">
          {/* Progress Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-200/70">
              <span className="text-teal-400 font-semibold">
                {course?.title}
              </span>
              <span>
                Question {currentQ + 1} of {totalQ}
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-indigo-500/15">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${currentProgressPct}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          {q && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300">
                  {q.difficulty || 'Assessment'}
                </span>
                <span className="text-xs text-indigo-300/50">1 Point</span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQ + 1}. {q.question}
              </h2>

              {/* Multiple Choice Options */}
              <div className="space-y-3 pt-2">
                {(q.options || []).map((optionText: string, i: number) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = answers[currentQ] === optionText;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQ]: optionText,
                        }))
                      }
                      className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/25 border-teal-400/60 shadow-lg shadow-indigo-600/20'
                          : 'bg-white/3 border-indigo-500/15 hover:border-indigo-400/30 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-teal-400 text-black font-extrabold'
                            : 'bg-white/5 text-indigo-300/70 border border-indigo-500/20'
                        }`}
                      >
                        {letter}
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-white' : 'text-indigo-100/80'}`}
                      >
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation & Submit Bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((prev) => prev - 1)}
            className="px-5 py-3 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentQ < totalQ - 1 ? (
            <div className="flex-1 flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentQ((prev) => prev + 1)}
                className="flex-1 py-3 px-6 rounded-xl glow-btn-primary text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              {answeredCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="py-3 px-4 rounded-xl border border-teal-500/30 bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Submit Early
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 py-3 px-6 rounded-xl glow-btn-teal text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition shadow-lg disabled:opacity-50"
            >
              <Trophy className="w-4 h-4" />
              <span>
                {submitting ? 'Submitting & Grading…' : 'Submit AI Quiz 🚀'}
              </span>
            </button>
          )}
        </div>

        {/* Question Numbers Navigator Dots */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          {questions.map((_: any, idx: number) => {
            const isAnswered = answers[idx] !== undefined;
            const isCurrent = idx === currentQ;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentQ(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-teal-400 scale-125 shadow-[0_0_8px_#2dd4bf]'
                    : isAnswered
                      ? 'bg-indigo-400'
                      : 'bg-white/15 hover:bg-white/30'
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
