'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Layers,
  HelpCircle,
  Clock,
  GraduationCap,
  Globe,
  AlertTriangle,
  Lightbulb,
  Check,
  ChevronRight,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { apiError } from '@/lib/errors';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty?: string;
  points?: number;
}

interface ClassroomCourse {
  _id: string;
  title: string;
  category?: string;
  level?: string;
  thumbnail?: string;
  sections?: Array<{
    title: string;
    lessons?: Array<{ title: string }>;
  }>;
}

type QuizSource = 'classroom' | 'external';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

function RevisionQuizContent() {
  const searchParams = useSearchParams();
  useRouter();

  const initialTopic = searchParams.get('topic') || '';

  // Source selection state
  const [sourceType, setSourceType] = useState<QuizSource>('external');
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [loadingCourses, setLoadingCourses] = useState<boolean>(false);

  // Quiz parameters
  const [topic, setTopic] = useState(
    initialTopic || 'Full Stack Web Development',
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [count, setCount] = useState<number>(5);

  // Quiz execution state
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generationMode, setGenerationMode] = useState('offline');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [isEvaluationReady, setIsEvaluationReady] = useState(false);
  const [showInstantExplanation, setShowInstantExplanation] = useState(true);

  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Read actual enrolled course records. Public catalog entries are not classroom membership.
  useEffect(() => {
    const controller = new AbortController();
    setLoadingCourses(true);
    api
      .get('/enrollments/my', { signal: controller.signal })
      .then((res) => {
        const enrolled = (res.data.data || [])
          .map(
            (entry: { course?: ClassroomCourse & { status?: string } }) =>
              entry.course,
          )
          .filter(
            (
              course: (ClassroomCourse & { status?: string }) | undefined,
            ): course is ClassroomCourse =>
              !!course && course.status === 'published',
          );
        setCourses(enrolled);
        if (enrolled[0]) setSelectedCourseId(enrolled[0]._id);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCourses(false);
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (sourceType !== 'classroom' || !selectedCourseId) return;
    const controller = new AbortController();
    api
      .get('/courses/' + selectedCourseId, { signal: controller.signal })
      .then((res) =>
        setCourses((current) =>
          current.map((course) =>
            course._id === selectedCourseId ? res.data.data : course,
          ),
        ),
      )
      .catch(() => {});
    return () => controller.abort();
  }, [selectedCourseId, sourceType]);

  // Update topic when course is selected
  useEffect(() => {
    if (sourceType === 'classroom' && selectedCourseId) {
      const found = courses.find((c) => c._id === selectedCourseId);
      if (found) {
        if (selectedSection && selectedSection !== 'all') {
          setTopic(`${found.title} - ${selectedSection}`);
        } else {
          setTopic(found.title);
        }
      }
    }
  }, [selectedCourseId, selectedSection, sourceType, courses]);

  // Quiz timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !isEvaluationReady) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isEvaluationReady]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Trending Subject Suggestions
  const trendingTopics = [
    { label: 'Generative AI (GANs, VAEs, Diffusion)', icon: '🧠' },
    { label: 'Full Stack Next.js & React 19', icon: '💻' },
    { label: 'Data Structures & Algorithms', icon: '⚡' },
    { label: 'SQL Indexing & Database Systems', icon: '🗄️' },
    { label: 'Cloud Architecture & Docker DevOps', icon: '☁️' },
    { label: 'Cybersecurity & JWT Authentication', icon: '🛡️' },
  ];

  // Selected course object
  const activeCourse = useMemo(() => {
    return courses.find((c) => c._id === selectedCourseId);
  }, [courses, selectedCourseId]);

  // Handle quiz generation
  const handleGenerate = async () => {
    const activeTopic = topic.trim();
    if (!activeTopic) {
      toast.error('Please enter or select a quiz topic');
      return;
    }

    setLoading(true);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsEvaluationReady(false);
    setTimeElapsed(0);
    setTimerActive(false);

    try {
      const res = await api.post('/ai/generate-quiz', {
        topic: activeTopic,
        difficulty,
        count,
        content:
          activeCourse?.title === activeTopic ? activeCourse?.title : undefined,
      });

      if (
        res.data?.success &&
        res.data?.data?.questions &&
        res.data.data.questions.length > 0
      ) {
        setQuestions(res.data.data.questions);
        setGenerationMode(res.data.data.mode || 'offline');
        setTimerActive(true);
        toast.success(
          `Created ${res.data.data.questions.length} ${res.data.data.mode === 'offline' ? 'offline practice' : 'LLM-drafted'} questions on ${activeTopic}.`,
        );
      } else {
        throw new Error('No questions returned');
      }
    } catch (error) {
      toast.error(
        apiError(error, 'Could not generate questions. Please try again.'),
      );
      setQuestions([]);
      setTimerActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, option: string) => {
    if (isEvaluationReady) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  // Evaluation calculations
  const scoreStats = useMemo(() => {
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const weakAreas: string[] = [];

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (!selected) {
        unansweredCount++;
      } else if (selected === q.correctAnswer) {
        correctCount++;
      } else {
        incorrectCount++;
        // Extract concept summary for weak areas
        const preview = q.question
          .split('?')[0]
          .replace(/in the context of|which layer|what is the/gi, '')
          .trim();
        weakAreas.push(preview.slice(0, 60));
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    let grade = 'Needs Practice';
    let gradeColor = 'text-rose-400';
    let badgeBg = 'bg-rose-500/20 border-rose-500/30';
    if (percentage >= 80) {
      grade = 'Mastery Achieved';
      gradeColor = 'text-emerald-400';
      badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
    } else if (percentage >= 60) {
      grade = 'Proficient';
      gradeColor = 'text-cyan-400';
      badgeBg = 'bg-cyan-500/20 border-cyan-500/30';
    }

    return {
      correctCount,
      incorrectCount,
      unansweredCount,
      total,
      percentage,
      grade,
      gradeColor,
      badgeBg,
      weakAreas,
    };
  }, [questions, selectedAnswers]);

  // Complete and submit quiz
  const handleFinishQuiz = () => {
    setTimerActive(false);
    setIsEvaluationReady(true);
    toast.success(
      `Quiz Completed! Final Score: ${scoreStats.correctCount}/${scoreStats.total}`,
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 relative overflow-hidden bg-[#040714]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {questions.length > 0 && (
          <p className="ws-note">
            {generationMode === 'live'
              ? 'LLM-drafted practice questions. Review important explanations.'
              : 'Offline template practice. These generic examples are not live AI output.'}{' '}
            Practice scores do not issue certificates.
          </p>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 font-medium">
              <Link
                href="/dashboard/student"
                className="hover:text-teal-300 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Student workspace</span>
              </Link>
              <span>/</span>
              <span className="text-white font-bold">Revision quizzes</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span>Topic revision quiz</span>
            </h1>
            <p className="text-xs text-indigo-200/80">
              Generate self-paced diagnostic assessments on enrolled classroom
              courses or any custom topic in seconds.
            </p>
          </div>

          {questions.length > 0 && !isEvaluationReady && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-indigo-500/20 text-xs font-mono text-cyan-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <button
                type="button"
                onClick={() => setQuestions([])}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-indigo-200 hover:text-white transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Setup</span>
              </button>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
            QUIZ CREATOR SETUP (When no questions are active)
        ═══════════════════════════════════════════════════════════════════════════ */}
        {questions.length === 0 && (
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 bg-[#070b22]/95 space-y-6 shadow-2xl max-w-2xl mx-auto">
            <div className="space-y-1 text-center">
              <h2 className="text-lg sm:text-xl font-black text-white">
                Launch Diagnostic AI Quiz
              </h2>
              <p className="text-xs text-indigo-200/70">
                Choose whether you want to test from your enrolled classroom
                curriculum or any external subject.
              </p>
            </div>

            {/* ── 1. Source Selector Tabs: Classroom vs External ── */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#05081c] rounded-2xl border border-indigo-500/20">
              <button
                type="button"
                onClick={() => setSourceType('classroom')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  sourceType === 'classroom'
                    ? 'bg-gradient-to-r from-teal-500/30 to-indigo-600/40 text-teal-200 border border-teal-400/50 shadow-md'
                    : 'text-indigo-300/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-teal-300" />
                <span>Classroom Courses</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('external')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  sourceType === 'external'
                    ? 'bg-gradient-to-r from-teal-500/30 to-indigo-600/40 text-teal-200 border border-teal-400/50 shadow-md'
                    : 'text-indigo-300/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-300" />
                <span>Any External Topic</span>
              </button>
            </div>

            {/* ── 2A. Classroom Course Selector ── */}
            {sourceType === 'classroom' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#090d29]/80 border border-indigo-500/25">
                <label className="text-xs font-bold text-teal-300 flex items-center justify-between">
                  <span>Select Enrolled Classroom Course:</span>
                  <span className="text-[10px] text-indigo-300/70">
                    {courses.length} Courses Found
                  </span>
                </label>

                {courses.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-indigo-500/30">
                    {courses.map((c) => {
                      const isSelected = selectedCourseId === c._id;
                      return (
                        <button
                          key={c._id}
                          type="button"
                          onClick={() => {
                            setSelectedCourseId(c._id);
                            setSelectedSection('all');
                          }}
                          className={`w-full p-3 rounded-xl text-left transition flex items-center justify-between border cursor-pointer ${
                            isSelected
                              ? 'bg-teal-500/15 border-teal-400/60 text-white shadow-md'
                              : 'bg-white/4 border-indigo-500/20 text-indigo-200 hover:bg-white/8 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <h4 className="text-xs font-bold truncate">
                              {c.title}
                            </h4>
                            <p className="text-[10px] text-indigo-300/60 truncate capitalize">
                              {c.category || 'General'} •{' '}
                              {c.level || 'All Levels'}
                            </p>
                          </div>
                          {isSelected ? (
                            <span className="w-5 h-5 rounded-full bg-teal-400 text-black flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border border-indigo-500/40 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-indigo-300/60">
                    {loadingCourses
                      ? 'Loading your courses...'
                      : 'No enrolled courses found. Switch to external topic tab!'}
                  </div>
                )}

                {/* Optional Module/Section filter if sections exist */}
                {activeCourse?.sections && activeCourse.sections.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-indigo-500/20">
                    <label className="text-[11px] font-semibold text-indigo-200">
                      Module Scope:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSection('all')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                          selectedSection === 'all'
                            ? 'bg-teal-500/25 border-teal-400 text-teal-200'
                            : 'bg-white/5 border-indigo-500/20 text-indigo-300 hover:text-white'
                        }`}
                      >
                        Entire Course Syllabus
                      </button>
                      {activeCourse.sections.map((sec, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedSection(sec.title)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer truncate max-w-[200px] ${
                            selectedSection === sec.title
                              ? 'bg-teal-500/25 border-teal-400 text-teal-200'
                              : 'bg-white/5 border-indigo-500/20 text-indigo-300 hover:text-white'
                          }`}
                        >
                          {sec.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 2B. External Topic Input & Suggestions ── */}
            {sourceType === 'external' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-200">
                    Enter Subject, Chapter, or Topic:
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Generative AI, Operating Systems, React 19, Python Data Structures"
                    className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-indigo-300/40 border border-indigo-500/30 bg-[#090d26] focus:border-cyan-400 focus:outline-none transition-all shadow-inner"
                  />
                </div>

                {/* Popular Topics Quick-Select Chips */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-300/70 uppercase tracking-wider">
                    Quick Suggestions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {trendingTopics.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setTopic(item.label)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition cursor-pointer border flex items-center gap-1 ${
                          topic === item.label
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-white/5 border-indigo-500/20 text-indigo-200 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── 3. Difficulty Selector (Custom Pill Buttons - No Glitchy Dropdown!) ── */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-200">
                Difficulty Level:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    id: 'beginner' as DifficultyLevel,
                    label: 'Beginner',
                    desc: 'Foundations & Definitions',
                  },
                  {
                    id: 'intermediate' as DifficultyLevel,
                    label: 'Intermediate',
                    desc: 'Applied Architecture',
                  },
                  {
                    id: 'advanced' as DifficultyLevel,
                    label: 'Advanced',
                    desc: 'Edge Cases & Mastery',
                  },
                ].map((item) => {
                  const isActive = difficulty === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/30 to-indigo-600/30 border-teal-400 text-white shadow-md'
                          : 'bg-[#090d26] border-indigo-500/20 text-indigo-300/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-teal-400" />
                        )}
                      </div>
                      <p className="text-[9px] text-indigo-300/60 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 4. Question Count Selector (Custom Pill Buttons) ── */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-200">
                Question Count:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    value: 3,
                    label: '3 Questions',
                    desc: 'Quick Recall (5 min)',
                  },
                  {
                    value: 5,
                    label: '5 Questions',
                    desc: 'Standard Diagnostic',
                  },
                  {
                    value: 10,
                    label: '10 Questions',
                    desc: 'In-Depth Mock Exam',
                  },
                ].map((item) => {
                  const isActive = count === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCount(item.value)}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/30 to-indigo-600/30 border-cyan-400 text-white shadow-md'
                          : 'bg-[#090d26] border-indigo-500/20 text-indigo-300/80 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{item.label}</span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-[9px] text-indigo-300/60 truncate mt-0.5">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── 5. Launch Quiz Button ── */}
            <button
              type="button"
              disabled={loading || !topic.trim()}
              onClick={handleGenerate}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-indigo-600 to-violet-600 hover:from-teal-400 hover:via-indigo-500 hover:to-violet-500 font-black text-xs sm:text-sm text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span>Preparing practice questions…</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Launch AI Quiz for {topic || 'Topic'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            LIVE QUIZ ARENA (Questions Active, Before Final Evaluation)
        ═══════════════════════════════════════════════════════════════════════════ */}
        {questions.length > 0 && !isEvaluationReady && (
          <div className="glass-card rounded-3xl p-5 sm:p-7 border border-indigo-500/25 bg-[#070b22]/95 space-y-6 shadow-2xl">
            {/* Top Stats Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-teal-300 tracking-wider">
                  TOPIC: {topic}
                </span>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">
                    Question {currentIndex + 1} of {questions.length}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 uppercase">
                    {difficulty}
                  </span>
                </div>
              </div>

              {/* Instant Explanation Toggle */}
              <button
                type="button"
                onClick={() => setShowInstantExplanation((prev) => !prev)}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                  showInstantExplanation
                    ? 'bg-teal-500/20 border-teal-400 text-teal-300'
                    : 'bg-white/5 border-indigo-500/20 text-indigo-300/70'
                }`}
              >
                <Lightbulb className="w-3 h-3" />
                <span>
                  Instant Explanation: {showInstantExplanation ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Question Palette Bar (Jump to any question) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[10px] font-bold text-indigo-300/70 mr-1 shrink-0">
                Palette:
              </span>
              {questions.map((_, qIdx) => {
                const isCurrent = currentIndex === qIdx;
                const isAnswered = !!selectedAnswers[qIdx];
                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer shrink-0 ${
                      isCurrent
                        ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30 font-black'
                        : isAnswered
                          ? 'bg-teal-500/30 text-teal-200 border border-teal-400/50'
                          : 'bg-white/5 text-indigo-300/70 hover:text-white hover:bg-white/10 border border-indigo-500/20'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            {/* Active Question Box */}
            {questions[currentIndex] && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#090d29] border border-indigo-500/25 shadow-inner">
                  <span className="text-[10px] font-bold text-indigo-400 font-mono">
                    QUESTION {currentIndex + 1}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed mt-1">
                    {questions[currentIndex].question}
                  </h4>
                </div>

                {/* 4 Options Grid */}
                <div className="space-y-2.5">
                  {questions[currentIndex].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentIndex] === opt;
                    const isAnswered = !!selectedAnswers[currentIndex];
                    const isCorrect =
                      opt === questions[currentIndex].correctAnswer;
                    const letter = String.fromCharCode(65 + oIdx);

                    let optStyle =
                      'bg-white/4 border-indigo-500/20 text-indigo-100 hover:bg-white/8 hover:text-white';

                    if (isAnswered && showInstantExplanation) {
                      if (isCorrect) {
                        optStyle =
                          'bg-emerald-500/20 border-emerald-400/80 text-emerald-300 font-bold shadow-md';
                      } else if (isSelected) {
                        optStyle =
                          'bg-rose-500/20 border-rose-400/80 text-rose-300 font-semibold';
                      } else {
                        optStyle =
                          'bg-white/2 border-indigo-500/10 text-indigo-300/50 opacity-60';
                      }
                    } else if (isSelected) {
                      optStyle =
                        'bg-teal-500/20 border-teal-400 text-teal-200 font-bold shadow-sm';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(currentIndex, opt)}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition flex items-center justify-between cursor-pointer group ${optStyle}`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                              isSelected
                                ? 'bg-teal-400 text-black border-teal-300'
                                : 'bg-white/5 text-indigo-300 border-indigo-500/30 group-hover:border-indigo-400'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="leading-relaxed">{opt}</span>
                        </div>

                        {isAnswered && showInstantExplanation && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isAnswered &&
                          showInstantExplanation &&
                          isSelected &&
                          !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                      </button>
                    );
                  })}
                </div>

                {/* Dedicated Question Explanation (Shown when answered in study mode) */}
                {selectedAnswers[currentIndex] && showInstantExplanation && (
                  <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs text-teal-200 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 text-teal-300 font-black">
                      <HelpCircle className="w-4 h-4" />
                      <span>
                        Conceptual Explanation for Question {currentIndex + 1}:
                      </span>
                    </div>
                    <p className="leading-relaxed text-indigo-100/90 font-medium">
                      {questions[currentIndex].explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination & Finish Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-indigo-500/15">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition disabled:opacity-30 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishQuiz}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-black font-black text-xs transition cursor-pointer shadow-lg shadow-teal-500/25 flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Finish & View Evaluation Report</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════════
            COMPREHENSIVE DIAGNOSTIC EVALUATION REPORT & QUESTION-BY-QUESTION REVIEW
        ═══════════════════════════════════════════════════════════════════════════ */}
        {isEvaluationReady && questions.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* 1. Scorecard Hero Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-[#070b22]/95 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                    DIAGNOSTIC PERFORMANCE EVALUATION
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {topic} Quiz Analysis
                  </h2>
                  <p className="text-xs text-indigo-200/70">
                    Completed in {formatTime(timeElapsed)} •{' '}
                    {difficulty.toUpperCase()} Level
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-2 rounded-2xl border ${scoreStats.badgeBg} text-center`}
                  >
                    <div
                      className={`text-2xl font-black ${scoreStats.gradeColor}`}
                    >
                      {scoreStats.percentage}%
                    </div>
                    <div className="text-[10px] font-bold text-white uppercase tracking-wider">
                      {scoreStats.grade}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Metrics Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-center">
                  <span className="text-xl font-black text-emerald-400">
                    {scoreStats.correctCount}
                  </span>
                  <p className="text-[10px] font-bold text-emerald-300 uppercase mt-0.5">
                    Correct
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-center">
                  <span className="text-xl font-black text-rose-400">
                    {scoreStats.incorrectCount}
                  </span>
                  <p className="text-[10px] font-bold text-rose-300 uppercase mt-0.5">
                    Incorrect
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-center">
                  <span className="text-xl font-black text-cyan-300">
                    {scoreStats.total}
                  </span>
                  <p className="text-[10px] font-bold text-indigo-200 uppercase mt-0.5">
                    Total Tested
                  </p>
                </div>
              </div>

              {/* Weak Concept Traps Identified */}
              {scoreStats.weakAreas.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>
                      Identified Concept Traps & Review Recommendations:
                    </span>
                  </h4>
                  <ul className="space-y-1 text-xs text-rose-100/90 list-disc list-inside">
                    {scoreStats.weakAreas.map((area, aIdx) => (
                      <li key={aIdx} className="leading-relaxed">
                        Review architectural principles around:{' '}
                        <strong>{area}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnswers({});
                      setIsEvaluationReady(false);
                      setCurrentIndex(0);
                      setTimeElapsed(0);
                      setTimerActive(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake Same Quiz</span>
                  </button>

                  <Link
                    href={`/dashboard/student/flashcards?topic=${encodeURIComponent(topic)}`}
                    className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-400/40 text-xs font-bold text-teal-300 transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Practice with Flashcards</span>
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuestions([]);
                    setIsEvaluationReady(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-indigo-600 hover:from-teal-300 hover:to-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg"
                >
                  Create New AI Quiz
                </button>
              </div>
            </div>

            {/* 2. Complete Question-by-Question Detailed Review Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Question-by-Question Evaluation & Analysis</span>
                </h3>
                <span className="text-xs text-indigo-300/70">
                  {scoreStats.correctCount} of {scoreStats.total} Correct
                </span>
              </div>

              {questions.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctAnswer;
                const isSkipped = !userAns;

                return (
                  <div
                    key={idx}
                    className={`glass-card rounded-2xl p-5 border space-y-3 transition-all ${
                      isCorrect
                        ? 'bg-[#060e22]/90 border-emerald-500/30'
                        : 'bg-[#120616]/90 border-rose-500/30'
                    }`}
                  >
                    {/* Question Header & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-indigo-300/70 font-mono">
                          QUESTION {idx + 1}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                          {q.question}
                        </h4>
                      </div>

                      <div className="shrink-0">
                        {isCorrect ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Correct</span>
                          </span>
                        ) : isSkipped ? (
                          <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 text-[10px] font-bold">
                            Skipped
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/40 text-[10px] font-bold flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>Incorrect</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Answers Overview */}
                    <div className="space-y-1.5 pt-1">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = userAns === opt;
                        const isTheCorrect = opt === q.correctAnswer;

                        let style =
                          'bg-white/2 border-indigo-500/10 text-indigo-300/60';
                        if (isTheCorrect) {
                          style =
                            'bg-emerald-500/15 border-emerald-400/60 text-emerald-200 font-semibold';
                        } else if (isChosen && !isTheCorrect) {
                          style =
                            'bg-rose-500/15 border-rose-400/60 text-rose-200 font-medium line-through';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${style}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-indigo-300/80">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>

                            {isTheCorrect && (
                              <span className="text-[10px] font-bold text-emerald-300 shrink-0 ml-2">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isChosen && !isTheCorrect && (
                              <span className="text-[10px] font-bold text-rose-400 shrink-0 ml-2">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dedicated Question Explanation */}
                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Explanation for Question {idx + 1}:</span>
                      </div>
                      <p className="text-cyan-100/90 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RevisionQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#040714] flex items-center justify-center text-white">
          Loading quiz arena...
        </div>
      }
    >
      <RevisionQuizContent />
    </Suspense>
  );
}
