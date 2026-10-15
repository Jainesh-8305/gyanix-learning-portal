"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Rocket,
  Sparkles,
  Award,
  Brain,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Zap,
  GraduationCap,
  KeyRound,
  HelpCircle,
} from "lucide-react";
import AstroMascot from "@/components/ui/AstroMascot";
import dynamic from "next/dynamic";
const PlatformGuideModal = dynamic(
  () => import("@/components/guide/PlatformGuideModal"),
);

type Mode = "student" | "instructor" | "ai-architecture";

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<Mode>("student");
  const [showGuideModal, setShowGuideModal] = useState(false);

  // This fixed example illustrates grading; it does not evaluate user input.
  const [sandboxQuestion, setSandboxQuestion] = useState(
    "Explain how Virtual DOM enhances React UI rendering performance.",
  );
  const [sandboxAnswer, setSandboxAnswer] = useState(
    "React creates an in-memory lightweight representation of the real DOM. When state changes, it reconciles differences using a diffing algorithm and batches updates to minimize costly real DOM repaints.",
  );
  const evaluatedScore = 96;

  return (
    <div className="min-h-[calc(100vh-4rem)] text-white relative overflow-hidden pb-20">
      {/* Dynamic Background Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-teal-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* ── 1. Hero Holographic Launch Stage ───────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 text-center">
        {/* Floating Mascot & Innovation Tag */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="mb-3 animate-float">
            <AstroMascot
              role={activeMode === "instructor" ? "instructor" : "student"}
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_15px_30px_rgba(99,102,241,0.5)]"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/50 text-teal-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>AI-Assisted Learning • 100% Free Course Access</span>
          </div>
        </div>

        {/* High-Contrast Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.18] mb-5">
          <span className="text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
            Empowering Students & Instructors with{" "}
          </span>
          <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(45,212,191,0.6)]">
            AI-Assisted Learning.
          </span>
        </h1>

        {/* High-Legibility Clear Subtitle */}
        <p className="text-base sm:text-lg text-slate-100 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
          Explore free courses, build study notes and flashcards, and manage
          classroom assignments with optional AI support for students and
          instructors.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto mb-12">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl glow-btn-teal text-black font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-xl shadow-teal-500/25 active:scale-95"
          >
            <Rocket className="w-4 h-4" />
            <span>Get Started Free</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowGuideModal(true)}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0c102b] hover:bg-[#12183e] border border-teal-400/40 text-teal-200 hover:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer shadow-lg active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-teal-400" />
            <span>How Gyanix Works (Guide)</span>
          </button>
        </div>

        {/* ── 2. Interactive Role & Engine Switcher Deck ─────────────── */}
        <div className="max-w-5xl mx-auto text-left">
          {/* Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-2xl bg-[#0a0d24] border border-indigo-500/25 max-w-xl mx-auto mb-6 shadow-xl">
            <button
              onClick={() => setActiveMode("student")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === "student"
                  ? "bg-teal-500 text-black shadow-lg shadow-teal-500/30"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>For Students</span>
            </button>

            <button
              onClick={() => setActiveMode("instructor")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === "instructor"
                  ? "bg-amber-400 text-black shadow-lg shadow-amber-400/30"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>For Instructors</span>
            </button>

            <button
              onClick={() => setActiveMode("ai-architecture")}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === "ai-architecture"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Engine</span>
            </button>
          </div>

          {/* Interactive Pane: STUDENT */}
          {activeMode === "student" && (
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-teal-500/30 space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-500/30">
                    Student Learning Suite
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    Everything You Need to Master Any Technical Domain
                  </h3>
                </div>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl glow-btn-teal font-extrabold text-xs text-black shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <span>Join as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    Lectures & AI Study Support
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Watch course lectures, follow your saved progress, and open
                    the floating multilingual assistant for guidance based on
                    content you can access.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    1-Click Flashcards & Notes
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Turn your text, PDFs and topics into private notes and
                    spaced-repetition flashcards. AI tools require a configured
                    model; offline templates are clearly labelled.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    Course Completion Certificates
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Complete a course and pass its assessment to receive a
                    project-issued completion certificate with a verification
                    page. These certificates are not external academic
                    accreditation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Pane: INSTRUCTOR */}
          {activeMode === "instructor" && (
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-amber-500/30 space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
                    Instructor Flight Command
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                    Supercharge Your Teaching with Autonomous AI Assist
                  </h3>
                </div>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 font-extrabold text-xs text-black shrink-0 flex items-center gap-1.5 shadow-md"
                >
                  <span>Teach on Gyanix</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-2xl bg-white/4 border border-amber-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    AI Assignment & Master Key Studio
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Draft assignments and marking criteria using an optional
                    model, review the draft, and publish classroom work. Master
                    answer keys stay restricted to authorized instructors.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-amber-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    Assignment Gradebook
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Review saved submissions and grades in one place. Optional
                    AI feedback assists marking; instructors review and control
                    the final grades.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-amber-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">
                    Classroom Batch Codes
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Share a classroom code after an administrator approves your
                    course for publication. Students can join published
                    classrooms and enroll for free.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Pane: AI ARCHITECTURE */}
          {activeMode === "ai-architecture" && (
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-indigo-500/35 space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="pb-4 border-b border-indigo-500/20">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/40">
                  AI Model Transparency
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Context-Aware Learning Assistance
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <span>Role-Aware Retrieval & Optional AI</span>
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    The assistant retrieves website guidance and authorized
                    learning context before answering. Backend role and
                    ownership checks protect private records; live AI requires a
                    securely configured API key.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Responsive Navigation & Cached Requests</span>
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Shared request caching and lazy-loaded tools reduce
                    duplicate requests and initial page work. Loading and error
                    states keep classroom interactions clear.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 3. Live Interactive AI Grader Simulator ───────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-teal-500/30 bg-[#090c21] shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">
                  Illustrative Grading Example
                </h3>
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                Fixed sample only: editing the text below does not evaluate your
                answer or change the sample score.
              </p>
            </div>
            <span className="text-xs font-black text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-400/30">
              Illustration Only
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="grading-example-question"
                className="block text-xs font-bold text-indigo-200 mb-1"
              >
                Sample Question / Prompt
              </label>
              <input
                id="grading-example-question"
                type="text"
                value={sandboxQuestion}
                onChange={(e) => setSandboxQuestion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label
                htmlFor="grading-example-answer"
                className="block text-xs font-bold text-teal-300 mb-1"
              >
                Student Submission / Code
              </label>
              <textarea
                id="grading-example-answer"
                rows={3}
                value={sandboxAnswer}
                onChange={(e) => setSandboxAnswer(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white font-mono"
              />
            </div>

            {evaluatedScore !== null && (
              <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-teal-300 uppercase tracking-wide">
                    Fixed Example Score
                  </span>
                  <p className="text-xs sm:text-sm text-indigo-100 font-medium">
                    Example feedback: mentions virtual DOM diffing and batched
                    updates. Real submissions use saved assignment criteria and
                    instructor review.
                  </p>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white bg-teal-500/20 px-4 py-1.5 rounded-xl border border-teal-400/40 shrink-0">
                  {evaluatedScore} / 100 Marks
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. High-Impact Statistics ──────────────────────────────── */}
      <section className="relative z-10 border-y border-indigo-500/20 bg-white/[0.03] backdrop-blur-xl py-10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-white">100%</p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Free Academic Access
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-teal-400">
                3 roles
              </p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Students · Instructors · Admins
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-300">
                AI tools
              </p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Optional Model Integration
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-300">
                Project
              </p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Completion Certificates
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Platform Guide Modal Trigger ────────────────────────── */}
      {showGuideModal && (
        <PlatformGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
}
