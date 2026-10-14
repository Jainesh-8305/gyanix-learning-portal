/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  GraduationCap,
  Award,
  Brain,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Search,
  Zap,
} from 'lucide-react';

interface PlatformGuideModalProps {
  onClose: () => void;
  initialRole?: 'all' | 'student' | 'instructor';
}

export default function PlatformGuideModal({ onClose, initialRole = 'all' }: PlatformGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'student' | 'instructor' | 'ai-models' | 'faq'>('overview');
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does an instructor create an assignment with AI?',
      a: 'Instructors open the "AI Assignment Studio", pick a course batch, and type a topic (e.g. "Binary Search Trees"). The AI instantly writes the full problem statement, custom marking rules, and the complete Master Reference Solution. Click "Deploy" to publish it to all enrolled students immediately.',
      category: 'instructor',
    },
    {
      q: 'Do instructors need to copy and paste student answers into the AI grader?',
      a: 'No! That tedious job is completely eliminated. When a student submits their code or essay, Gyanix automatically runs it through the autonomous AI grader in the background, compares it against the instructor\'s Master Answer Key, and populates the Auto-Gradebook ledger with scores, strengths, and critique.',
      category: 'instructor',
    },
    {
      q: 'How do students join a course or classroom batch?',
      a: 'Every course generated on Gyanix has a unique classroom batch code (e.g. GYX-ULW7). Instructors can copy and share this code. Students simply click "Join Classroom Batch" on their dashboard and enter the code for instant enrollment.',
      category: 'student',
    },
    {
      q: 'What is the Dual-Screen AI Study Suite?',
      a: 'It is a workspace where students can watch video lectures on one side while simultaneously chatting with an AI Tutor, generating personalized summary notes, and creating revision flashcards in real-time.',
      category: 'student',
    },
    {
      q: 'Are courses and certificates free?',
      a: 'Yes! Gyanix Academy provides 100% free open academic access. All legacy paywalls have been removed, and verified digital completion certificates are issued without charge upon completing courses and passing the AI quiz.',
      category: 'all',
    },
    {
      q: 'Which AI models are used behind the scenes?',
      a: 'Gyanix utilizes specialized pedagogical LLMs (GPT-4o-mini & Google Gemini) configured with strict deterministic temperatures (0.2 - 0.4) for fair grading, structured JSON schemas for quizzes, and semantic retrieval for personalized recommendations.',
      category: 'ai-models',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-card max-w-4xl w-full rounded-3xl border border-indigo-500/35 bg-[#090b1c] shadow-[0_25px_70px_rgba(0,0,0,0.9)] max-h-[92vh] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-indigo-500/20 bg-[#0c0f24] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Gyanix Academy Platform Guide
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300">
                  AI Helping Agent
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 font-medium">
                Comprehensive blueprint, role workflows, and live AI model documentation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-indigo-500/20 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Dock */}
        <div className="flex items-center gap-2 p-2.5 sm:px-6 bg-[#070917] border-b border-indigo-500/15 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'student'
                ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/30 font-extrabold'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('instructor')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'instructor'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30 font-extrabold'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Instructor Flight Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-models')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ${
              activeTab === 'ai-models'
                ? 'bg-gradient-to-r from-pink-500 to-indigo-600 text-white shadow-lg'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Models & Engines</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer shrink-0 ml-auto ${
              activeTab === 'faq'
                ? 'bg-white/15 text-white border border-indigo-400/30'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Q&A</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-400" />
                  <span>Welcome to Gyanix Academy — The AI-Native Learning Ecosystem</span>
                </h3>
                <p className="text-sm text-indigo-100 font-medium leading-relaxed">
                  Gyanix Academy is engineered from the ground up to replace outdated legacy portals with an autonomous, high-speed education environment. Instructors save dozens of hours via 1-click AI course and assignment generation, while students learn through dual-screen interactive study halls, instant flashcards, and automated feedback.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold">1</div>
                  <h4 className="text-sm font-bold text-white">Free Open Access</h4>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    No hidden charges, paywalls, or checkout friction. Every student has immediate access to full course videos and AI tools.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">2</div>
                  <h4 className="text-sm font-bold text-white">Master Answer Key Grading</h4>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    Instructors define a single reference answer key once. The AI automatically grades every student submission against it in real time.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">3</div>
                  <h4 className="text-sm font-bold text-white">Dual-Screen AI Study Hall</h4>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    Watch lectures with an AI mentor on the side. Generate chapter flashcards, comprehensive revision notes, and test quizzes in seconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT GUIDE */}
          {activeTab === 'student' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-teal-300 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-teal-400" />
                    <span>The Student Journey Step-by-Step</span>
                  </h3>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    How students enroll, study with AI, submit assignments, and earn verified credentials
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black shrink-0">1</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Join Classroom Batch via Code</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Instructors provide a 6-character batch code (e.g., <code className="text-teal-300 font-mono font-bold">GYX-ULW7</code>). From your Student Dashboard, click "Join Batch Code", enter the key, and instantly unlock all lessons and assignments.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black shrink-0">2</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Dual-Screen AI Study Suite</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Navigate to any course and launch the Study Suite. Ask deep conceptual questions to the AI Tutor, generate interactive flashcards for spaced repetition, and export beautifully formatted markdown notes.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black shrink-0">3</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Submit Homework & Coding Assignments</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      When your instructor deploys an assignment, read the problem specifications and paste your code or written solution. The AI evaluates your work against the instructor\'s marking criteria and Master Answer Key within seconds, highlighting your key strengths and specific improvement areas.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-black shrink-0">4</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Earn Verifiable Digital Certificates</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Complete all video lectures and pass the final AI Assessment Quiz to earn a permanent digital certificate with a verifiable ID, downloadable high-res PDF, and 1-click LinkedIn share.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTRUCTOR GUIDE */}
          {activeTab === 'instructor' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-amber-300 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    <span>The Instructor Flight Command Guide</span>
                  </h3>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    How instructors deploy courses, automate grading, and command student cohorts
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/4 border border-amber-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">1</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">1-Click Course Deployment & Batch Codes</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Click "Deploy New Course", enter your course title and description, upload video modules, and publish. A unique Classroom Batch Code is automatically minted for your students.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-amber-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">2</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">AI Assignment Studio with Master Answer Key</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Never write homework questions from scratch. Select your course, type a topic, and click "AI Generate". The AI synthesizes the problem statement, point-by-point marking criteria, and a model Master Reference Solution.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-amber-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">3</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Zero Manual Copy-Pasting: Live Auto-Gradebook</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      You do NOT have to copy-paste student answers one by one. Students submit directly through the portal, and the AI evaluates them automatically against your Master Answer Key. Simply open the "Auto-Gradebook & Submissions Ledger" tab to view real-time scores, student code, and AI critiques.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-amber-500/20 flex items-start gap-4">
                  <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-black shrink-0">4</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Create AI Batch Quizzes in Seconds</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                      Click "Create AI Batch Quiz" to generate 5 to 20 multiple-choice questions with customized difficulty levels (Beginner, Intermediate, Advanced) and detailed answer explanations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI MODELS */}
          {activeTab === 'ai-models' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/25 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-pink-400" />
                  <span>AI Architecture & Model Transparency</span>
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                  We believe in explainable, deterministic educational AI. Here is exactly how our AI engines power your learning and grading:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full">
                    Autonomous Grading Engine
                  </span>
                  <h4 className="text-sm font-bold text-white">Deterministic Master Key Evaluator</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                    Operates with low temperature (0.2) to eliminate hallucinations. Compares student AST / logic / essay semantics against the instructor's verified reference answer key, ensuring fair and repeatable marks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-full">
                    Curriculum Synthesis Model
                  </span>
                  <h4 className="text-sm font-bold text-white">Dynamic Quiz & Assignment Generator</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                    Generates production-grade programming tasks and theoretical case studies with strict JSON schema validation, ensuring zero malformed output and instant compilation.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pink-300 bg-pink-500/15 px-2.5 py-0.5 rounded-full">
                    Study Suite Pedagogical Agent
                  </span>
                  <h4 className="text-sm font-bold text-white">Adaptive Socratic Tutor</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                    Powers the Dual-Screen Study Suite. Breaks complex engineering and theoretical concepts down into intuitive bite-sized analogies and flashcard memory hooks.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-500/15 px-2.5 py-0.5 rounded-full">
                    Zero-Latency Cache & Resilience
                  </span>
                  <h4 className="text-sm font-bold text-white">In-Memory SWR & Heuristic Fallbacks</h4>
                  <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                    All student scores and course metadata are cached in browser memory for instant UI transitions, with heuristic fallback generators guaranteeing 100% uptime even if upstream APIs experience rate limits.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & INTERACTIVE Q&A */}
          {activeTab === 'faq' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="relative">
                <Search className="w-4 h-4 text-indigo-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search any question or feature (e.g. grading, batch code, study suite)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-indigo-200/60"
                />
              </div>

              <div className="space-y-3">
                {filteredFaqs.map((faq, index) => {
                  const isOpen = selectedFaq === index;
                  return (
                    <div
                      key={index}
                      className="rounded-2xl bg-white/4 border border-indigo-500/20 overflow-hidden transition"
                    >
                      <button
                        onClick={() => setSelectedFaq(isOpen ? null : index)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/5 transition cursor-pointer"
                      >
                        <span className="font-bold text-sm text-white flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 text-indigo-300 transition-transform ${
                            isOpen ? 'rotate-90 text-teal-400' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed border-t border-indigo-500/10">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-indigo-500/20 bg-[#0c0f24] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-indigo-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Gyanix Autonomous Learning Protocol • Verifiably Free Academic Access</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl glow-btn-teal text-black font-extrabold text-xs cursor-pointer shadow-md"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
