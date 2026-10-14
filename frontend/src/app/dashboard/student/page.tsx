/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import {
  Home,
  BookOpen,
  Sparkles,
  FileText,
  Brain,
  Award,
  BarChart2,
  TrendingUp,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  KeyRound,
  Clock,
  Flame,
  Search,
  Rocket,
  Video,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Code,
  Terminal,
  Cpu,
  Star,
  Users,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import AstroMascot from '@/components/ui/AstroMascot';
import JoinBatchModal from '@/components/dashboard/JoinBatchModal';
import StudentGoalCard from '@/components/dashboard/StudentGoalCard';
import UpcomingTimelineCard from '@/components/dashboard/UpcomingTimelineCard';
import GyanixAIAssistantWidget from '@/components/dashboard/GyanixAIAssistantWidget';
import DetailedProgressCard from '@/components/dashboard/DetailedProgressCard';
import MotivationalQuoteCard from '@/components/ui/MotivationalQuoteCard';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type StudentTab =
  | 'overview'
  | 'courses'
  | 'ai-learning'
  | 'assignments'
  | 'quizzes'
  | 'certificates'
  | 'analytics';

function ProgressRing({ pct, size = 64 }: { pct: number; size?: number }) {
  const r = 24;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="rotate-[-90deg]">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="5" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="url(#progressGrad)"
        strokeWidth="5"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome back');
  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const [courseFilter, setCourseFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [courseSearch, setCourseSearch] = useState('');
  const [showJoinBatch, setShowJoinBatch] = useState(false);
  const [copiedBatchCode, setCopiedBatchCode] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const handleCopyBatch = (code: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedBatchCode(code);
      setTimeout(() => setCopiedBatchCode(null), 2000);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let hasToken = false;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) hasToken = true;
        }
      } catch (e) {}
    }

    const timer = setTimeout(() => {
      if (!hasToken && !isAuthenticated) {
        router.replace('/login');
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning');
    else if (hr < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const { data: enrollData, isLoading: loadingEnroll, mutate: mutateEnroll } = useSWR('/enrollments/my', fetcher);
  const { data: userProfileData } = useSWR('/users/me', fetcher);
  const { data: recommendData } = useSWR('/ai/recommendations', fetcher);
  const { data: srsData } = useSWR('/ai/flashcards/due-count', fetcher);
  const { data: attemptsData } = useSWR('/ai/quiz-attempts', fetcher);
  const { data: batchQuizzesData, mutate: mutateBatchQuizzes } = useSWR('/courses/batch-quizzes', fetcher);

  const enrollments: any[] = enrollData?.data || [];
  const profile = userProfileData?.data || user;
  const srsDueCount = srsData?.data?.dueCount || 0;
  const frequentWeakTopics: any[] = attemptsData?.data?.frequentWeakTopics || [];
  const batchQuizzes: any[] = batchQuizzesData?.data || [];

  const inProgress = enrollments.filter((e) => !e.isCompleted && (e.progressPercentage ?? 0) < 100);
  const completed = enrollments.filter((e) => e.isCompleted || (e.progressPercentage ?? 0) >= 100);

  const overallProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((acc, e) => acc + (e.progressPercentage || 0), 0) / enrollments.length
      )
    : 0;

  const currentStreak = profile?.learningStreak || (completed.length > 0 ? 1 : 0);

  // Filtered courses for Courses tab
  const filteredCourses = enrollments.filter((e) => {
    const matchesFilter =
      courseFilter === 'all'
        ? true
        : courseFilter === 'in-progress'
        ? !e.isCompleted && (e.progressPercentage ?? 0) < 100
        : e.isCompleted || (e.progressPercentage ?? 0) >= 100;
    const matchesSearch =
      courseSearch.trim() === '' ||
      e.course?.title?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      e.course?.category?.toLowerCase().includes(courseSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statCards = [
    {
      label: 'Enrolled Programs',
      value: enrollments.length,
      icon: BookOpen,
      color: 'from-indigo-500 to-teal-400',
      borderGlow: 'hover:border-indigo-400/50',
      iconBg: 'bg-indigo-500/15 text-indigo-300',
      glow: 'rgba(99, 102, 241, 0.15)',
      description: 'Active & graduated academic curriculums',
      tab: 'courses' as StudentTab,
    },
    {
      label: 'Mastered & Verified',
      value: completed.length,
      icon: Award,
      color: 'from-teal-400 to-emerald-500',
      borderGlow: 'hover:border-teal-400/50',
      iconBg: 'bg-teal-500/15 text-teal-300',
      glow: 'rgba(45, 212, 191, 0.15)',
      description: 'Conferred certificates of excellence',
      tab: 'certificates' as StudentTab,
    },
    {
      label: 'Due Flashcards (SRS)',
      value: srsDueCount,
      icon: Zap,
      color: 'from-amber-400 to-orange-500',
      borderGlow: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-300',
      glow: 'rgba(245, 158, 11, 0.15)',
      description: srsDueCount > 0 ? `${srsDueCount} cards due today` : 'All cards reviewed! Zero backlog',
      tab: 'ai-learning' as StudentTab,
    },
    {
      label: 'Daily Study Streak',
      value: `${currentStreak}d`,
      icon: Flame,
      color: 'from-pink-500 to-rose-600',
      borderGlow: 'hover:border-pink-500/50',
      iconBg: 'bg-pink-500/15 text-pink-300',
      glow: 'rgba(244, 63, 94, 0.15)',
      description: 'Consecutive active learning days',
      tab: 'analytics' as StudentTab,
    },
  ];

  const sidebarNavItems = [
    {
      id: 'overview' as StudentTab,
      label: 'Home',
      icon: Home,
      badge: 'Live',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'courses' as StudentTab,
      label: 'My Courses',
      icon: BookOpen,
      badge: inProgress.length > 0 ? `${inProgress.length} Active` : `${enrollments.length}`,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
    {
      id: 'ai-learning' as StudentTab,
      label: 'AI Learning',
      icon: Sparkles,
      badge: 'NEW',
      badgeColor: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-black font-extrabold',
    },
    {
      id: 'assignments' as StudentTab,
      label: 'Assignments',
      icon: FileText,
      badge: 'Auto',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'quizzes' as StudentTab,
      label: 'Quizzes',
      icon: Brain,
      badge: batchQuizzes.length > 0 ? `${batchQuizzes.length}` : 'Quiz',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'certificates' as StudentTab,
      label: 'Certificates',
      icon: Award,
      badge: completed.length > 0 ? `${completed.length}` : '0',
      badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'analytics' as StudentTab,
      label: 'Analytics',
      icon: BarChart2,
      badge: `${overallProgress}%`,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  // Relative time formatter for real timestamps
  const formatTimeAgo = (dateStr?: string | Date) => {
    if (!dateStr) return 'Recently';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Dynamic Course Overview strictly based on the student's real enrollments
  const overviewCourses = enrollments.map((enr, idx) => {
    const totalLessons =
      enr.course?.sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) ||
      enr.course?.totalLessons ||
      (enr.course?.lessonsCount || 0);
    const completedCount = enr.completedLessons?.length || 0;
    const pct = typeof enr.progressPercentage === 'number' ? enr.progressPercentage : 0;

    const icons = [Code, Brain, Layers, Terminal, Sparkles];
    const Icon = icons[idx % icons.length];
    const colorThemes = [
      { color: 'bg-blue-600/25 border-blue-400/40 text-blue-300 shadow-blue-500/20', barColor: 'from-blue-400 to-indigo-400' },
      { color: 'bg-teal-600/25 border-teal-400/40 text-teal-300 shadow-teal-500/20', barColor: 'from-teal-400 to-cyan-400' },
      { color: 'bg-purple-600/25 border-purple-400/40 text-purple-300 shadow-purple-500/20', barColor: 'from-purple-400 to-pink-400' },
      { color: 'bg-amber-600/25 border-amber-400/40 text-amber-300 shadow-amber-500/20', barColor: 'from-amber-400 to-orange-400' },
    ];
    const theme = colorThemes[idx % colorThemes.length];

    return {
      id: enr.course?._id || `gyx-c-${idx}`,
      title: enr.course?.title || 'Enrolled Course',
      lessons: totalLessons > 0 ? `${completedCount}/${totalLessons} Lessons` : `${completedCount} Lessons`,
      pct,
      icon: Icon,
      color: theme.color,
      barColor: theme.barColor,
      link: enr.course?._id ? `/courses/${enr.course._id}/learn` : '/courses',
    };
  });

  // Dynamic Active Course Fleet strictly based on student's actual enrolled courses & batch codes
  const fleetBatches = enrollments.map((enr, idx) => {
    const totalLessons =
      enr.course?.sections?.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0) ||
      enr.course?.totalLessons ||
      1;
    const code =
      enr.course?.batchCode ||
      `GYX-${(enr.course?.category || 'CRS').slice(0, 3).toUpperCase()}${idx + 1}`;
    return {
      id: enr._id || `fleet-${idx}`,
      courseId: enr.course?._id,
      title: enr.course?.title || 'Academic Course',
      code,
      status: enr.course?.status ? enr.course.status.toUpperCase() : 'PUBLISHED',
      access: enr.course?.price === 0 || enr.amountPaid === 0 ? 'Free Academic Access' : 'Verified Enrolled',
      lessons: totalLessons,
      enrolled: enr.course?.totalStudents || 2,
    };
  });

  // Dynamic Recent Activities based on real student events
  const recentActivities = [
    ...(attemptsData?.data?.attempts?.slice(0, 2).map((att: any, i: number) => ({
      id: `act-att-${i}`,
      title: 'Quiz Completed',
      sub: att.quizTitle || att.topic || 'AI Assessment',
      time: formatTimeAgo(att.createdAt),
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      link: '/dashboard/student/revision-quiz',
    })) || []),
    ...(enrollments.slice(0, 3).map((enr: any, i: number) => ({
      id: `act-enr-${i}`,
      title: (enr.progressPercentage || 0) > 0 ? 'Study Progress' : 'Course Enrolled',
      sub: enr.course?.title || 'Academic Course',
      time: formatTimeAgo(enr.lastAccessedAt || enr.createdAt),
      icon: (enr.progressPercentage || 0) > 0 ? PlayCircle : BookOpen,
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      link: enr.course?._id ? `/courses/${enr.course._id}/learn` : '/courses',
    }))),
    {
      id: 'act-srs',
      title: 'Flashcards Active',
      sub: srsDueCount > 0 ? `${srsDueCount} items due` : 'SRS Decks Synced',
      time: 'Today',
      icon: Zap,
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      link: '/dashboard/student/flashcards',
    },
  ].slice(0, 4);

  // Dynamic Upcoming Events based on real courses and assessments
  const upcomingTimelineEvents = [
    ...(enrollments[0]
      ? [
          {
            id: 'evt-1',
            title: enrollments[0].course?.title || 'Web Development',
            subtitle: 'Curriculum Study Unit',
            time: 'Self-Paced / In Progress',
            type: 'lecture' as const,
            link: enrollments[0].course?._id
              ? `/courses/${enrollments[0].course._id}/learn`
              : '/courses',
          },
        ]
      : []),
    ...(enrollments[1]
      ? [
          {
            id: 'evt-2',
            title: enrollments[1].course?.title || 'DEMO LECTURE',
            subtitle: 'Curriculum Study Unit',
            time: 'Self-Paced / In Progress',
            type: 'lecture' as const,
            link: enrollments[1].course?._id
              ? `/courses/${enrollments[1].course._id}/learn`
              : '/courses',
          },
        ]
      : []),
    {
      id: 'evt-quiz',
      title: enrollments[0]?.course?.title
        ? `${enrollments[0].course.title.slice(0, 22)}... Quiz`
        : 'AI Diagnostic Assessment',
      subtitle: 'Adaptive Knowledge Check',
      tag: 'Available',
      tagColor: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
      time: 'Flexible / On Demand',
      type: 'quiz' as const,
      link: enrollments[0]?.course?._id
        ? `/courses/${enrollments[0].course._id}/quiz`
        : '/dashboard/student/revision-quiz',
    },
    {
      id: 'evt-srs',
      title: srsDueCount > 0 ? `${srsDueCount} Flashcards Pending` : 'Cosmic Flashcards SRS',
      subtitle: 'Spaced Repetition Memory Sync',
      tag: srsDueCount > 0 ? 'Review Due' : 'Active Deck',
      tagColor:
        srsDueCount > 0
          ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
          : 'text-teal-300 bg-teal-500/20 border-teal-500/40',
      time: 'Daily Recall',
      type: 'assignment' as const,
      link: '/dashboard/student/flashcards',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-4 lg:p-4.5 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-[1720px] mx-auto space-y-3.5">
        
        {/* ── MOBILE / TABLET TOP HORIZONTAL NAV SCROLLER ── */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-indigo-600 text-white border-teal-400/50 shadow-md shadow-teal-500/20'
                    : 'glass-card text-indigo-100 hover:text-white border-indigo-500/20'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-teal-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── MAIN COCKPIT: LEFT SIDEBAR + CONTENT AREA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 xl:gap-4 items-start">
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ── LEFT SIDEBAR (Matching Reference Architecture) ──────── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 space-y-3 sticky top-16">
            <div className="glass-card rounded-3xl p-3.5 sm:p-4 border border-indigo-500/25 bg-[#060919]/90 shadow-2xl space-y-3.5">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-indigo-500/20">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-black text-sm shadow-lg shadow-teal-500/25 border border-white/20">
                  {user?.name?.charAt(0) || 'J'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-teal-300">
                      Scholar Command
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-white truncate">
                    {user?.name || 'Jainesh Dalwadi'}
                  </h3>
                  <p className="text-[10px] text-indigo-200/70 truncate">
                    Active Student
                  </p>
                </div>
              </div>

              {/* Main Navigation Menu */}
              <nav className="space-y-1">
                {sidebarNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/25 via-indigo-600/35 to-teal-500/10 text-white border border-teal-400/50 shadow-md shadow-teal-500/15 translate-x-1'
                          : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'text-indigo-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Quick Tools Section */}
              <div className="pt-2 border-t border-indigo-500/15 space-y-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300/60 px-1.5">
                  Quick Tools
                </span>
                
                <div className="space-y-0.5">
                  <button
                    onClick={() => setActiveTab('ai-learning')}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-indigo-200 hover:text-white hover:bg-white/5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>AI Study Assistant</span>
                  </button>

                  <Link
                    href="/dashboard/student/notes"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-indigo-200 hover:text-white hover:bg-white/5 transition"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    <span>Notes & Resources</span>
                  </Link>

                  <Link
                    href="/dashboard/student/flashcards"
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-indigo-200 hover:text-white hover:bg-white/5 transition"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Flashcards (SRS)</span>
                  </Link>

                  <button
                    onClick={() => setShowJoinBatch(true)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-teal-300 hover:text-teal-200 hover:bg-teal-500/10 transition cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3 text-teal-400" />
                    <span>Join Classroom Batch</span>
                  </button>
                </div>
              </div>

              {/* Bottom Motivational Capsule */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-purple-950/50 to-teal-950/50 border border-teal-500/30 flex items-center justify-between gap-2 shadow-md">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-cursive text-xs text-white font-bold leading-tight">
                    Small Steps, Big Dreams
                  </p>
                  <p className="text-[9px] text-teal-300 font-semibold">Gyanix Academy</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/30 shrink-0">
                  <Rocket className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>

            </div>
          </aside>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* ── MAIN CONTENT TABS (Col 4-12 on lg, Col 3-12 on xl) ─── */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-3.5">

            {/* ────────────────────────────────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 1: OVERVIEW / HOME (One-Screen Balanced Cockpit) ─── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 items-stretch animate-in fade-in duration-300">
                
                {/* ═════════════════════════════════════════════════════════ */}
                {/* ── COLUMN 1: LEFT (~58% width -> xl:col-span-7) ──────── */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div className="xl:col-span-7 space-y-2.5 flex flex-col justify-between">

                  {/* 1. Hero Scholar Flight Command Card */}
                  <div className="glass-card rounded-3xl p-4 sm:p-4.5 border border-indigo-500/25 bg-gradient-to-r from-[#060919] via-[#090d26] to-[#0a102e] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-1.5 text-center sm:text-left z-10 flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
                        <span>Flight Command Active</span>
                      </div>

                      <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                        {greeting},{' '}
                        <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                          {user?.name?.split(' ')[0] || 'Jainesh'}
                        </span>{' '}
                        ☀️
                      </h1>

                      <p className="text-xs text-slate-200 font-medium leading-relaxed line-clamp-1">
                        Your learning journey is going great! Keep going — extraordinary things take consistent effort.
                      </p>

                      {/* 3 Quick Action Launcher Cards */}
                      <div className="grid grid-cols-3 gap-2 pt-1.5">
                        <Link
                          href="/dashboard/student/revision-quiz"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-cyan-400/30 text-left transition flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 border border-cyan-400/30 shadow-sm">
                              <Brain className="w-4 h-4 text-cyan-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 truncate transition leading-tight">Create AI Quiz</p>
                              <p className="text-[10px] text-indigo-300/80 truncate hidden sm:block">In seconds</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                        </Link>

                        <button
                          onClick={() => setActiveTab('assignments')}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-teal-500/15 border border-teal-400/30 text-left transition flex items-center justify-between group shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-400/30 shadow-sm">
                              <Sparkles className="w-4 h-4 text-teal-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-white group-hover:text-teal-300 truncate transition leading-tight">AI Studio</p>
                              <p className="text-[10px] text-teal-300/80 truncate hidden sm:block">Instant feedback</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-teal-400 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                        </button>

                        <button
                          onClick={() => setActiveTab('ai-learning')}
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-indigo-500/15 border border-indigo-400/30 text-left transition flex items-center justify-between group shadow-sm cursor-pointer"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 border border-indigo-400/30 shadow-sm">
                              <Rocket className="w-4 h-4 text-indigo-300" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-[13px] font-bold text-white group-hover:text-indigo-300 truncate transition leading-tight">AI Tutor</p>
                              <p className="text-[10px] text-indigo-300/80 truncate hidden sm:block">Ask anything</p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                        </button>
                      </div>
                    </div>

                    {/* Mascot with Cursive Motto */}
                    <div className="flex items-center gap-2.5 z-10 shrink-0 sm:flex-col sm:items-end">
                      <div className="text-right hidden sm:block">
                        <p className="font-cursive text-sm text-cyan-200 font-bold leading-tight">Better Skills, Bigger Dreams</p>
                        <p className="text-[10px] text-indigo-300/90 font-medium">Scholar Mastery</p>
                      </div>
                      <AstroMascot role="student" className="w-14 h-14 sm:w-16 sm:h-16" />
                    </div>
                  </div>

                  {/* 2. Course Overview (Continue where you left off) */}
                  <div className="glass-card rounded-3xl p-3.5 sm:p-4 border border-indigo-500/20 bg-[#070b20]/90 space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/15">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-teal-400" />
                          <span>Course Overview</span>
                        </h3>
                        <p className="text-[11px] text-indigo-200/70">Continue where you left off</p>
                      </div>

                      <button
                        onClick={() => setActiveTab('courses')}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <span>View All Courses</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {overviewCourses.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 text-center space-y-2">
                        <p className="text-xs text-indigo-200">No active course enrollments yet.</p>
                        <Link
                          href="/courses"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glow-btn-primary text-xs font-semibold"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Browse Academy Catalog</span>
                        </Link>
                      </div>
                    ) : (
                      <div className={`grid gap-2.5 ${
                        overviewCourses.length === 1
                          ? 'grid-cols-1'
                          : overviewCourses.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : overviewCourses.length === 3
                          ? 'grid-cols-1 sm:grid-cols-3'
                          : 'grid-cols-2 md:grid-cols-4'
                      }`}>
                        {overviewCourses.map((c) => {
                          const Icon = c.icon;
                          return (
                            <Link
                              key={c.id}
                              href={c.link}
                              className="p-3.5 rounded-2xl bg-white/4 hover:bg-white/8 border border-indigo-500/20 hover:border-teal-400/40 transition-all flex flex-col justify-between space-y-3 group shadow-lg"
                            >
                              <div className="flex items-center justify-between">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${c.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-300 group-hover:translate-x-0.5 transition">
                                  <span>Continue</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                <h4 className="text-xs sm:text-[13px] font-bold text-white group-hover:text-teal-300 transition truncate">
                                  {c.title}
                                </h4>
                                <div className="flex items-center justify-between text-[11px] text-indigo-300/90 font-medium">
                                  <span>{c.lessons}</span>
                                  <span className="font-bold text-teal-300 text-xs sm:text-[13px]">{c.pct}%</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${c.barColor} transition-all duration-700`}
                                    style={{ width: `${c.pct}%` }}
                                  />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Active Course Fleet (Your created courses, classroom batch codes, and status) */}
                  <div className="glass-card rounded-3xl p-3.5 sm:p-4 border border-indigo-500/20 bg-[#070b20]/90 space-y-2.5 shadow-xl">
                    <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/15">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                          <Rocket className="w-4 h-4 text-teal-400" />
                          <span>Active Course Fleet</span>
                        </h3>
                        <p className="text-[11px] text-indigo-200/70">Your enrolled curricula, classroom batch codes, and live status</p>
                      </div>

                      <button
                        onClick={() => setShowJoinBatch(true)}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <span>Join Batch</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {fleetBatches.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 text-center space-y-2">
                        <p className="text-xs text-indigo-200">No active classroom batch codes.</p>
                        <button
                          onClick={() => setShowJoinBatch(true)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glow-btn-teal text-xs font-semibold cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Join Classroom Batch</span>
                        </button>
                      </div>
                    ) : (
                      <div className={`grid gap-2.5 ${
                        fleetBatches.length === 1
                          ? 'grid-cols-1'
                          : fleetBatches.length === 2
                          ? 'grid-cols-1 sm:grid-cols-2'
                          : 'grid-cols-1 sm:grid-cols-3'
                      }`}>
                        {fleetBatches.map((batch) => (
                          <div
                            key={batch.id}
                            className="p-3.5 rounded-2xl bg-white/4 border border-indigo-500/20 hover:border-cyan-400/40 transition-all space-y-2.5 flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                  batch.status === 'PUBLISHED'
                                    ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/40'
                                    : 'text-amber-300 bg-amber-500/15 border-amber-500/40'
                                }`}>
                                  {batch.status}
                                </span>
                                <span className="text-[9px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded-full">
                                  {batch.access}
                                </span>
                              </div>

                              <Link
                                href={batch.courseId ? `/courses/${batch.courseId}/learn` : '/courses'}
                                className="text-xs sm:text-[13px] font-bold text-white hover:text-cyan-300 transition truncate block leading-tight"
                              >
                                {batch.title}
                              </Link>

                              {/* Batch code with copy */}
                              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/40 border border-indigo-500/20 text-xs font-mono text-cyan-300 font-bold">
                                <span className="truncate">Code: {batch.code}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyBatch(batch.code)}
                                  title="Copy batch code"
                                  className="text-indigo-300 hover:text-white transition p-0.5 cursor-pointer"
                                >
                                  {copiedBatchCode === batch.code ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-cyan-400" />
                                  )}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-indigo-200/90 font-semibold pt-1 border-t border-white/5">
                              <span>{batch.lessons} Lessons</span>
                              <span>{batch.enrolled} Enrolled</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Recent Activity (Your latest actions and progress - dynamic items) */}
                  <div className="glass-card rounded-3xl p-3.5 sm:p-4 border border-indigo-500/20 bg-[#070b20]/90 space-y-2 shadow-xl">
                    <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/15">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-teal-400" />
                          <span>Recent Activity</span>
                        </h3>
                        <p className="text-[11px] text-indigo-200/70">Your latest actions, study progression, and assessments</p>
                      </div>

                      <button
                        onClick={() => setActiveTab('analytics')}
                        className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 transition cursor-pointer"
                      >
                        <span>View Analytics</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className={`grid gap-2.5 ${
                      recentActivities.length === 1
                        ? 'grid-cols-1'
                        : recentActivities.length === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : 'grid-cols-2 sm:grid-cols-4'
                    }`}>
                      {recentActivities.map((act) => {
                        const Icon = act.icon;
                        return (
                          <Link
                            key={act.id}
                            href={act.link}
                            className="p-2.5 rounded-xl bg-white/4 hover:bg-white/8 border border-indigo-500/15 hover:border-teal-400/30 transition-all flex items-center gap-2.5 group cursor-pointer"
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${act.iconBg}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-[13px] font-bold text-white group-hover:text-teal-300 truncate leading-tight transition">{act.title}</p>
                              <p className="text-[11px] text-indigo-200/80 truncate font-medium">{act.sub}</p>
                              <p className="text-[10px] text-indigo-300/70 truncate">{act.time}</p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* ═════════════════════════════════════════════════════════ */}
                {/* ── RIGHT WIDGETS WRAPPER (~42% width -> xl:col-span-5) ── */}
                {/* ═════════════════════════════════════════════════════════ */}
                <div className="xl:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch h-full">

                  {/* ── COLUMN 2: MIDDLE (Today's Goal + Expanded AI Chatbot) ── */}
                  <div className="flex flex-col gap-2.5 h-full justify-between">
                    <StudentGoalCard
                      completedToday={completed.length > 0 ? 4 : (enrollments.some(e => (e.progressPercentage || 0) > 0) ? 2 : 1)}
                      dailyTarget={4}
                      nextLessonLink={inProgress.length > 0 && inProgress[0].course?._id ? `/courses/${inProgress[0].course._id}/learn` : '/courses'}
                      nextLessonTitle={inProgress.length > 0 ? `Continue module in ${inProgress[0].course?.title || 'your course'}` : 'Complete 1 more lesson to reach your goal!'}
                    />
                    <GyanixAIAssistantWidget className="flex-1 h-full min-h-[300px]" />
                  </div>

                  {/* ── COLUMN 3: RIGHT (Upcoming Timeline + Expanded Daily Catalyst) ── */}
                  <div className="flex flex-col gap-2.5 h-full justify-between">
                    <UpcomingTimelineCard
                      events={upcomingTimelineEvents}
                    />
                    <MotivationalQuoteCard
                      userName={user?.name?.split(' ')[0] || 'Scholar'}
                      className="flex-1 h-full min-h-[280px]"
                    />
                  </div>

                </div>

              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 2: MY COURSES ───────────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'courses' && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/15">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-teal-400" />
                      <span>My Enrolled Courses</span>
                    </h2>
                    <p className="text-xs text-indigo-100 font-medium mt-0.5">
                      Track active curricula, review completed units, and advance your syllabus
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCourseFilter('all')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        courseFilter === 'all'
                          ? 'bg-teal-500 text-black border-teal-400 shadow-md shadow-teal-500/25'
                          : 'bg-white/5 text-indigo-200 border-indigo-500/20 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      All ({enrollments.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter('in-progress')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        courseFilter === 'in-progress'
                          ? 'bg-teal-500 text-black border-teal-400 shadow-md shadow-teal-500/25'
                          : 'bg-white/5 text-indigo-200 border-indigo-500/20 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      In Progress ({inProgress.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseFilter('completed')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        courseFilter === 'completed'
                          ? 'bg-teal-500 text-black border-teal-400 shadow-md shadow-teal-500/25'
                          : 'bg-white/5 text-indigo-200 border-indigo-500/20 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      Completed ({completed.length})
                    </button>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-indigo-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder="Search your courses by title or topic..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs sm:text-sm text-white placeholder-indigo-300/40 border border-indigo-500/20"
                  />
                </div>

                {/* Courses Grid */}
                {loadingEnroll ? (
                  <div className="text-center py-12 text-xs text-indigo-200/50">
                    Loading your enrolled courses...
                  </div>
                ) : filteredCourses.length === 0 ? (
                  courseFilter === 'completed' ? (
                    <div className="text-center py-12 space-y-3 p-6 rounded-3xl bg-white/4 border border-indigo-500/20 max-w-lg mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center mx-auto border border-indigo-500/30">
                        <Award className="w-6 h-6 text-teal-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white">No Completed Courses Yet</h3>
                      <p className="text-xs text-indigo-200/70">
                        You have {inProgress.length} active course{inProgress.length !== 1 ? 's' : ''} in progress. Complete all lesson modules to earn your verified certificates!
                      </p>
                      <button
                        type="button"
                        onClick={() => setCourseFilter('in-progress')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-teal text-xs font-bold cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>View In-Progress Courses</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 space-y-3">
                      <p className="text-sm font-bold text-white">No courses match your filter or search.</p>
                      <Link
                        href="/courses"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-semibold"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Browse Academy Catalog</span>
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {filteredCourses.map((enrollment) => {
                      const isDone = enrollment.isCompleted || (enrollment.progressPercentage ?? 0) >= 100;
                      const hasStarted = (enrollment.progressPercentage ?? 0) > 0;
                      const totalLessons =
                        enrollment.course?.sections?.reduce(
                          (sum: number, s: any) => sum + (s.lessons?.length || 0),
                          0
                        ) ||
                        enrollment.course?.totalLessons ||
                        0;
                      const doneLessons = enrollment.completedLessons?.length || 0;

                      return (
                        <div
                          key={enrollment._id}
                          className="p-5 rounded-3xl bg-white/4 border border-indigo-500/20 hover:border-teal-400/50 transition-all space-y-4 flex flex-col justify-between shadow-lg group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="uppercase text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  {enrollment.course?.category || 'Technology'}
                                </span>
                                {isDone ? (
                                  <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span>Completed</span>
                                  </span>
                                ) : hasStarted ? (
                                  <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                    In Progress
                                  </span>
                                ) : (
                                  <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Enrolled
                                  </span>
                                )}
                              </div>
                              <span className="text-teal-300 font-bold text-xs">
                                {totalLessons > 0 ? `${doneLessons}/${totalLessons} Lessons • ` : ''}
                                {enrollment.progressPercentage || 0}% Complete
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-teal-300 transition">
                              {enrollment.course?.title}
                            </h3>

                            <p className="text-xs text-indigo-100 font-medium line-clamp-2">
                              {enrollment.course?.description || 'Curriculum modules active for study.'}
                            </p>

                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isDone
                                    ? 'bg-gradient-to-r from-teal-400 to-emerald-400'
                                    : 'bg-gradient-to-r from-indigo-500 to-teal-400'
                                }`}
                                style={{ width: `${enrollment.progressPercentage || 0}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/15">
                            <Link
                              href={`/courses/${enrollment.course?._id}/learn`}
                              className="flex-1 py-2.5 rounded-xl glow-btn-teal text-xs font-bold inline-flex items-center justify-center gap-2 shadow"
                            >
                              <PlayCircle className="w-4 h-4" />
                              <span>{isDone ? 'Review Curriculum' : 'Continue Learning'}</span>
                            </Link>

                            {isDone && (
                              <Link
                                href={`/courses/${enrollment.course?._id}/quiz`}
                                className="px-3.5 py-2.5 rounded-xl glow-btn-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Quiz</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 3: AI LEARNING SUITE ────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'ai-learning' && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-indigo-500/15">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-teal-400" />
                    <span>AI Learning Suite & Memory Engine</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Spaced repetition, high-yield PDF note synthesis, and adaptive test recovery
                  </p>
                </div>

                {/* AI Tools Cards (Fully interactive with live status badges) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Link
                    href="/dashboard/student/flashcards"
                    className="p-5 rounded-2xl bg-[#080d2a]/90 border border-teal-500/35 hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-200 space-y-3 group cursor-pointer shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-110 transition border border-teal-500/30">
                        <Zap className="w-5 h-5 text-teal-300" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                        {srsDueCount > 0 ? `${srsDueCount} Due Today` : 'Deck Ready'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-teal-200 transition">
                        SRS Flashcards
                      </h3>
                      <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">
                        Active recall cards scheduled via SuperMemo-2 algorithm. Reinforce neural retention with zero backlog.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-teal-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                        Open Flashcards &rarr;
                      </span>
                      <span className="text-[10px] text-indigo-300/70 font-mono">SM-2 Algorithm</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/student/notes"
                    className="p-5 rounded-2xl bg-[#080d2a]/90 border border-indigo-500/35 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all duration-200 space-y-3 group cursor-pointer shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-0.5 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center group-hover:scale-110 transition border border-cyan-500/30">
                        <BookOpen className="w-5 h-5 text-cyan-300" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        PDF • Video • Notes
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white group-hover:text-cyan-200 transition">
                          AI One-Shot Notes & Explainer
                        </h3>
                        <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">New</span>
                      </div>
                      <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">
                        Upload any chapter PDF or video lecture link to generate one-shot revision summaries & ELI5 explanations.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                        Synthesize Notes &rarr;
                      </span>
                      <span className="text-[10px] text-indigo-300/70 font-mono">Instant PDF-Parse</span>
                    </div>
                  </Link>

                  <Link
                    href="/dashboard/student/revision-quiz"
                    className="p-5 rounded-2xl bg-[#080d2a]/90 border border-amber-500/35 hover:border-amber-400 hover:bg-amber-500/10 transition-all duration-200 space-y-3 group cursor-pointer shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 block"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center group-hover:scale-110 transition border border-amber-500/30">
                        <Brain className="w-5 h-5 text-amber-300" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Adaptive Recovery
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition">
                        Adaptive Cram Quizzes
                      </h3>
                      <p className="text-xs text-indigo-200/80 leading-relaxed mt-1">
                        Instant tailored test generation based on your syllabus and current mastery gaps.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                        Launch Quiz &rarr;
                      </span>
                      <span className="text-[10px] text-indigo-300/70 font-mono">IRT Adaptive</span>
                    </div>
                  </Link>
                </div>

                {/* Embedded Gyanix AI Assistant */}
                <GyanixAIAssistantWidget />

                {/* Exam Gap Recovery Diagnostics */}
                {frequentWeakTopics.length > 0 && (
                  <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                      <span>Identified Conceptual Traps (IRT Gap Recovery)</span>
                    </h4>
                    <p className="text-xs text-indigo-200/70">
                      Our AI diagnosis detected these conceptual traps in recent quiz attempts:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {frequentWeakTopics.slice(0, 4).map((wt: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-xl bg-white/4 border border-rose-500/20 flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{wt.topic}</span>
                          <span className="text-[10px] text-rose-300 font-mono">Flagged {wt.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 4: ASSIGNMENTS ──────────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'assignments' && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-indigo-500/15">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-6 h-6 text-amber-400" />
                    <span>Assignments & Practical Projects</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Faculty assigned problem sets with real-time AI reference-key evaluation
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/4 border border-indigo-500/20 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                        Due Soon • Tomorrow, 11:59 PM
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Full-Stack Architecture Assessment
                      </h4>
                      <p className="text-xs text-indigo-200/70">
                        Design a RESTful API contract with rate-limiting and JWT security controls.
                      </p>
                    </div>

                    <button
                      onClick={() => alert('Assignment submission portal is ready. Submit your code via GitHub or text answer.')}
                      className="px-4 py-2 rounded-xl glow-btn-primary text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Submit Assignment
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/40 border border-indigo-500/15 text-center text-xs text-indigo-200/60">
                    All other assignments are up to date! As instructors deploy new problem sets, they will automatically appear here.
                  </div>
                </div>
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 5: QUIZZES ──────────────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'quizzes' && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-indigo-500/15">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Brain className="w-6 h-6 text-purple-400" />
                    <span>Assigned Classroom Batch Quizzes ({batchQuizzes.length})</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Instructor scheduled active-recall assessments and adaptive topic tests
                  </p>
                </div>

                {batchQuizzes.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-2xl bg-white/3 border border-indigo-500/15 space-y-3">
                    <Brain className="w-10 h-10 text-purple-400/40 mx-auto" />
                    <p className="text-sm font-bold text-white">No pending batch quizzes assigned right now.</p>
                    <p className="text-xs text-indigo-200/60 max-w-sm mx-auto">
                      You can generate on-demand AI practice quizzes anytime to test your course knowledge!
                    </p>
                    <Link
                      href="/dashboard/student/revision-quiz"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-primary text-xs font-bold shadow"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start On-Demand Quiz</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {batchQuizzes.map((quiz) => (
                      <div
                        key={quiz._id}
                        className="p-5 rounded-2xl bg-white/4 border border-purple-500/25 hover:border-purple-400/50 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-bold text-purple-300 uppercase px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                            Batch: {quiz.course?.title || 'Classroom Batch'}
                          </span>
                          <h4 className="text-base font-bold text-white">{quiz.title}</h4>
                          <div className="flex items-center gap-3 text-xs text-indigo-200/70 pt-1">
                            <span>⏱️ {quiz.timeLimit} mins</span>
                            <span>•</span>
                            <span>{quiz.questions?.length || 5} Questions</span>
                            {quiz.dueDate && (
                              <>
                                <span>•</span>
                                <span>Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/student/revision-quiz?topic=${encodeURIComponent(quiz.title)}`}
                          className="w-full py-2.5 rounded-xl glow-btn-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow"
                        >
                          <span>Start Quiz</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 6: CERTIFICATES ─────────────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'certificates' && (
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
                <div className="pb-4 border-b border-indigo-500/15">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Award className="w-6 h-6 text-pink-400" />
                    <span>Verified Academic Credentials ({completed.length})</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Official conferred diplomas verified on the Gyanix Academy credential ledger
                  </p>
                </div>

                {completed.length === 0 ? (
                  <div className="text-center py-12 p-6 rounded-2xl bg-white/3 border border-indigo-500/15 space-y-3">
                    <Award className="w-10 h-10 text-pink-400/40 mx-auto" />
                    <p className="text-sm font-bold text-white">No completion diplomas unlocked yet.</p>
                    <p className="text-xs text-indigo-200/60 max-w-sm mx-auto">
                      Finish 100% of any enrolled course curriculum to take the graduation exam and earn your verified certificate!
                    </p>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-btn-teal text-xs font-bold shadow cursor-pointer"
                    >
                      <span>Continue Enrolled Courses</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completed.map((enrollment) => {
                      const certId =
                        typeof enrollment.certificate === 'object'
                          ? (enrollment.certificate as any)?._id || (enrollment.certificate as any)?.certificateId
                          : enrollment.certificate;
                      return (
                        <div
                          key={enrollment._id}
                          className="p-5 rounded-2xl bg-white/4 border border-pink-500/30 hover:border-pink-400/60 transition-all space-y-4 shadow-lg flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[10px] font-bold text-teal-300 uppercase px-2 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Conferred & Verified
                              </span>
                              <span className="text-indigo-300/60 font-mono text-[10px]">
                                {enrollment.completedAt ? new Date(enrollment.completedAt).toLocaleDateString() : 'Active'}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white">{enrollment.course?.title}</h4>
                            <p className="text-xs text-indigo-200/70">
                              Demonstrated curriculum mastery with verified AI assessment.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-indigo-500/15">
                            {certId ? (
                              <Link
                                href={`/certificates/${certId}`}
                                target="_blank"
                                className="flex-1 py-2 px-3 rounded-xl glow-btn-teal text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>View Verified Diploma</span>
                              </Link>
                            ) : (
                              <Link
                                href={`/courses/${enrollment.course?._id}/quiz`}
                                className="flex-1 py-2 px-3 rounded-xl glow-btn-primary text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Take Graduation Quiz</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ────────────────────────────────────────────────────────── */}
            {/* ── TAB 7: ANALYTICS & PROGRESS ─────────────────────────── */}
            {/* ────────────────────────────────────────────────────────── */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 4 Stat Pedestal Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <button
                        key={stat.label}
                        onClick={() => setActiveTab(stat.tab)}
                        className={`glass-card rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 border border-indigo-500/20 ${stat.borderGlow} text-left relative overflow-hidden shadow-xl group block cursor-pointer`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
                            Metrics
                          </span>
                        </div>

                        <p className="text-3xl font-extrabold text-white tracking-tight">
                          {stat.value}
                        </p>
                        <p className="text-xs font-semibold text-indigo-200/70 uppercase tracking-wider mt-1">
                          {stat.label}
                        </p>
                        <p className="text-[11px] text-indigo-300/50 mt-1 truncate">
                          {stat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Progress Component */}
                <DetailedProgressCard
                  overallPct={overallProgress || 68}
                  completedUnits={completed.length || 24}
                  totalUnits={enrollments.length || 35}
                  coursesPct={overallProgress || 68}
                  assignmentsPct={Math.min(100, Math.round((completed.length / (enrollments.length || 1)) * 85)) || 72}
                  quizzesPct={58}
                  certificatesPct={completed.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 46}
                />
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Join Classroom Batch Modal */}
      <JoinBatchModal
        isOpen={showJoinBatch}
        onClose={() => setShowJoinBatch(false)}
        onJoined={() => {
          mutateEnroll();
          mutateBatchQuizzes();
        }}
      />
    </div>
  );
}