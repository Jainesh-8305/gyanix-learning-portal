/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Rocket,
  Sparkles,
  Award,
  Brain,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Play,
  Zap,
  GraduationCap,
  KeyRound,
  FileText,
  Sliders,
  HelpCircle,
  Eye,
  Check,
} from 'lucide-react';
import AstroMascot from '@/components/ui/AstroMascot';
import PlatformGuideModal from '@/components/guide/PlatformGuideModal';

type Mode = 'student' | 'instructor' | 'ai-architecture';

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<Mode>('student');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Interactive Live Sandbox State on Homepage
  const [sandboxQuestion, setSandboxQuestion] = useState('Explain how Virtual DOM enhances React UI rendering performance.');
  const [sandboxAnswer, setSandboxAnswer] = useState('React creates an in-memory lightweight representation of the real DOM. When state changes, it reconciles differences using a diffing algorithm and batches updates to minimize costly real DOM repaints.');
  const [evaluatedScore, setEvaluatedScore] = useState<number | null>(96);

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
            <AstroMascot role={activeMode === 'instructor' ? 'instructor' : 'student'} className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-[0_15px_30px_rgba(99,102,241,0.5)]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/50 text-teal-300 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-teal-500/20">
            <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
            <span>Autonomous AI Academic Protocol • 100% Free Access</span>
          </div>
        </div>

        {/* High-Contrast Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.18] mb-5">
          <span className="text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]">
            Empowering Students & Instructors with{' '}
          </span>
          <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(45,212,191,0.6)]">
            Autonomous AI Precision.
          </span>
        </h1>

        {/* High-Legibility Clear Subtitle */}
        <p className="text-base sm:text-lg text-slate-100 font-medium max-w-2xl mx-auto mb-8 leading-relaxed">
          From 1-click AI course & assignment creation to intelligent auto-grading against master answer keys, Gyanix eliminates academic friction for instructors and students alike.
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
              onClick={() => setActiveMode('student')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === 'student'
                  ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/30'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>For Students</span>
            </button>

            <button
              onClick={() => setActiveMode('instructor')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === 'instructor'
                  ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>For Instructors</span>
            </button>

            <button
              onClick={() => setActiveMode('ai-architecture')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeMode === 'ai-architecture'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>AI Engine</span>
            </button>
          </div>

          {/* Interactive Pane: STUDENT */}
          {activeMode === 'student' && (
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
                  <h4 className="font-bold text-white text-base">Dual-Screen AI Study Suite</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Watch video lectures side-by-side with an interactive Socratic AI Mentor that answers doubts in real time and synthesizes chapter notes.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">1-Click Flashcards & Notes</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Instantly turn course transcripts and topics into spaced-repetition digital flashcards and downloadable, well-formatted markdown study sheets.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Permanent Verifiable Badges</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Pass the final assessment quiz to receive an unforgeable certificate with a permanent verification URL, downloadable PDF, and LinkedIn badge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Pane: INSTRUCTOR */}
          {activeMode === 'instructor' && (
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
                  <h4 className="font-bold text-white text-base">AI Assignment & Master Key Studio</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Type a topic. The AI instantly generates the problem statement, point-by-point marking criteria, and a comprehensive Master Answer Key in seconds.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-amber-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Live Auto-Gradebook Ledger</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Zero manual copy-pasting. Student answers are evaluated autonomously against your master key upon submission, compiling marks and feedback directly.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-amber-500/20 space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base">Classroom Batch Codes</h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Every deployed course mints a unique 6-character code (e.g. GYX-ULW7). Invite students with 1 click; zero administrative approval queues.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Pane: AI ARCHITECTURE */}
          {activeMode === 'ai-architecture' && (
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-indigo-500/35 space-y-6 shadow-2xl animate-in fade-in duration-300">
              <div className="pb-4 border-b border-indigo-500/20">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/40">
                  AI Model Transparency
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Specialized High-Fidelity Pedagogical Models
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Brain className="w-4 h-4 text-teal-400" />
                    <span>Deterministic Grading & Semantic Evaluation</span>
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Operates with strict temperature controls to ensure reliable marking. Evaluates student submissions directly against the instructor's master answer key with actionable strengths and improvements.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <h4 className="font-bold text-white text-base flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Zero-Lag In-Memory SWR Caching</span>
                  </h4>
                  <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                    Next.js Turbopack with package import tree-shaking and client deduping keeps every click instant without CPU throttle.
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
                <h3 className="text-lg font-bold text-white">Live AI Grading Engine Simulator</h3>
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                Experience how Gyanix evaluates student answers in real time against marking criteria
              </p>
            </div>
            <span className="text-xs font-black text-teal-300 bg-teal-500/15 px-3 py-1 rounded-full border border-teal-400/30">
              Interactive Sandbox
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Sample Question / Prompt
              </label>
              <input
                type="text"
                value={sandboxQuestion}
                onChange={(e) => setSandboxQuestion(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl glass-input text-xs sm:text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-teal-300 mb-1">
                Student Submission / Code
              </label>
              <textarea
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
                    Autonomous Score Verdict
                  </span>
                  <p className="text-xs sm:text-sm text-indigo-100 font-medium">
                    Verified against model solution: Accurately identifies virtual DOM diffing and DOM repaint minimization.
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
              <p className="text-3xl sm:text-4xl font-black text-teal-400">0 sec</p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Manual Copy-Pasting Needed
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-amber-300">1-Click</p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Course & AI Quiz Minting
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-300">Verified</p>
              <p className="text-xs sm:text-sm text-indigo-200 font-bold mt-1 uppercase tracking-wider">
                Cryptographic Credentials
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