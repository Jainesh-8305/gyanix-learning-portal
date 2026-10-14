/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import {
  BookOpen, Users, Star, Satellite, Plus, Clock,
  ChevronRight, Sparkles, ArrowRight, Award, ShieldCheck,
  Brain, KeyRound, Copy, Check, LayoutDashboard,
  BarChart3, Search, GraduationCap, CheckCircle2, AlertCircle
} from 'lucide-react';
import AstroMascot from '@/components/ui/AstroMascot';
import FacultyResourcePinModal from '@/components/dashboard/FacultyResourcePinModal';
import AIAssignmentStudioModal from '@/components/dashboard/AIAssignmentStudioModal';
import InstructorBatchQuizModal from '@/components/dashboard/InstructorBatchQuizModal';
import InstructorStatDetailsModal from '@/components/dashboard/InstructorStatDetailsModal';
import toast from 'react-hot-toast';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

type CockpitTab = 'overview' | 'courses' | 'cadets' | 'assignments' | 'quizzes' | 'analytics';

export default function InstructorDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Active Sidebar / Cockpit View
  const [activeTab, setActiveTab] = useState<CockpitTab>('overview');

  const [selectedPinCourse, setSelectedPinCourse] = useState<{ id: string; title: string } | null>(null);
  const [showAssignmentStudioModal, setShowAssignmentStudioModal] = useState<boolean>(false);
  const [showBatchQuizModal, setShowBatchQuizModal] = useState<boolean>(false);
  const [detailModal, setDetailModal] = useState<'courses' | 'cadets' | 'reviews' | 'ratings' | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [mounted, setMounted] = useState<boolean>(false);

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
      } catch (e) { }
    }

    const timer = setTimeout(() => {
      if (!hasToken && !isAuthenticated) {
        router.replace('/login');
      } else if (user?.role && user.role !== 'instructor') {
        router.replace(`/dashboard/${user.role}`);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [mounted, isAuthenticated, user, router]);

  const { data: coursesData, mutate: mutateCourses } = useSWR('/courses/my-courses', fetcher);
  const { data: overviewData, mutate: mutateOverview } = useSWR('/courses/instructor-overview', fetcher);

  const courses = coursesData?.data || [];
  const overview = overviewData?.data || {
    totalPublishedCourses: 0,
    totalEnrolledCadets: 0,
    totalActiveReviews: 0,
    averageRating: 5.0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    courses: [],
    students: [],
    reviews: [],
  };

  const copyBatchCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Copied batch code ${code}! Share with students.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const togglePublish = async (courseId: string) => {
    try {
      const res = await api.post(`/courses/${courseId}/toggle-publish`);
      toast.success(res.data.message || 'Course status updated!');
      mutateCourses();
      mutateOverview();
    } catch {
      toast.error('Failed to update course status');
    }
  };

  const published = courses.filter((c: any) => c.status === 'published');
  const totalStudents = published.reduce((acc: number, c: any) => acc + (c.totalStudents || 0), 0);

  const statCards = [
    {
      type: 'courses',
      label: 'Published Courses',
      value: overview.totalPublishedCourses !== undefined ? overview.totalPublishedCourses : published.length,
      icon: BookOpen,
      color: 'from-indigo-500 to-indigo-600',
      borderGlow: 'hover:border-indigo-500/50',
      iconBg: 'bg-indigo-500/20 text-indigo-300',
      glow: 'rgba(99, 102, 241, 0.2)',
    },
    {
      type: 'cadets',
      label: 'Enrolled Students',
      value: overview.totalEnrolledCadets !== undefined ? overview.totalEnrolledCadets : totalStudents,
      icon: Users,
      color: 'from-teal-400 to-teal-600',
      borderGlow: 'hover:border-teal-500/50',
      iconBg: 'bg-teal-500/20 text-teal-300',
      glow: 'rgba(20, 184, 166, 0.2)',
    },
    {
      type: 'reviews',
      label: 'Active Reviews',
      value: overview.totalActiveReviews !== undefined ? overview.totalActiveReviews : (overview.reviews?.length || 0),
      icon: Clock,
      color: 'from-amber-400 to-orange-500',
      borderGlow: 'hover:border-amber-500/50',
      iconBg: 'bg-amber-500/20 text-amber-300',
      glow: 'rgba(245, 158, 11, 0.2)',
    },
    {
      type: 'ratings',
      label: 'Average Rating',
      value: `${overview.averageRating ? Number(overview.averageRating).toFixed(1) : '5.0'} ★`,
      icon: Star,
      color: 'from-pink-500 to-rose-600',
      borderGlow: 'hover:border-pink-500/50',
      iconBg: 'bg-pink-500/20 text-pink-300',
      glow: 'rgba(244, 63, 94, 0.2)',
    },
  ];

  const filteredCourses = courses.filter((c: any) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.classroomCode && c.classroomCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const studentsList = overview.students || [];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-6 lg:p-8 relative overflow-hidden text-white">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

        {/* ── 1. Futuristic Cockpit Command Sidebar ───────────────── */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
          <div className="glass-card rounded-3xl p-5 border border-indigo-500/25 bg-[#0a0d22] space-y-4 shadow-2xl">
            {/* Header Badge */}
            <div className="flex items-center gap-3 pb-3 border-b border-indigo-500/20">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-teal-500/20">
                <Satellite className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Command Deck</h3>
                <p className="text-xs text-teal-300 font-semibold tracking-wide">Captain {user?.name?.split(' ')[0]}</p>
              </div>
            </div>

            {/* Sidebar Navigation Items */}
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === 'overview' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>Dashboard Overview</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 font-mono">
                  {courses.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('courses')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'courses'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className={`w-4 h-4 ${activeTab === 'courses' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>Active Courses</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold">
                  {published.length} Live
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('cadets')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'cadets'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'cadets' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>Enrolled Students</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                  {studentsList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className={`w-4 h-4 ${activeTab === 'assignments' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>AI Assignment Studio</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase">
                  Auto
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('quizzes')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'quizzes'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Brain className={`w-4 h-4 ${activeTab === 'quizzes' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>Batch AI Quizzes</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                  AI
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-600/30 text-teal-200 border border-teal-400/40 shadow-md'
                    : 'text-indigo-100 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-teal-400' : 'text-indigo-300'}`} />
                  <span>Ratings & Reviews</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold">
                  {overview.averageRating || '5.0'}★
                </span>
              </button>
            </nav>

            {/* Quick Actions in Sidebar */}
            <div className="pt-3 border-t border-indigo-500/20 space-y-2">
              <Link
                href="/dashboard/instructor/courses/create"
                className="w-full py-3 px-3.5 rounded-2xl glow-btn-teal font-extrabold text-xs text-black flex items-center justify-center gap-2 shadow-lg transition"
              >
                <Plus className="w-4 h-4" />
                <span>Deploy New Course</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* ── 2. Main Cockpit Workspace ───────────────────────────── */}
        <main className="flex-1 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Mascot Welcome Header */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2.5 text-center md:text-left z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider">
                    <Satellite className="w-3.5 h-3.5 text-teal-400" />
                    <span>Flight Command Active</span>
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  </div>

                  <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                    Captain{' '}
                    <span className="bg-gradient-to-r from-teal-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                      {user?.name?.split(' ')[0] || 'Instructor'}
                    </span>
                  </h1>

                  <p className="text-sm text-indigo-100 max-w-xl leading-relaxed font-medium">
                    Command your course curriculum, generate AI automated quizzes, review student enrollment statistics, and publish new learning paths.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
                  <button
                    onClick={() => setShowBatchQuizModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/25 hover:from-amber-500/35 hover:to-orange-500/35 border border-amber-400/40 font-bold text-xs text-amber-200 flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <Brain className="w-4 h-4 text-amber-300" />
                    <span>Create AI Batch Quiz</span>
                  </button>

                  <button
                    onClick={() => setShowAssignmentStudioModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/20 to-indigo-500/20 hover:from-teal-500/30 hover:to-indigo-500/30 border border-teal-400/40 font-bold text-xs text-teal-200 flex items-center gap-1.5 shadow-md cursor-pointer transition"
                  >
                    <Award className="w-4 h-4 text-teal-300" />
                    <span>AI Assignment Studio</span>
                  </button>

                  <AstroMascot role="instructor" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>

              {/* Stat Pedestals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      onClick={() => setDetailModal(stat.type as any)}
                      className={`glass-card rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] border border-indigo-500/20 ${stat.borderGlow} relative overflow-hidden shadow-xl cursor-pointer group select-none`}
                      style={{ boxShadow: `0 10px 30px ${stat.glow}` }}
                      title={`Click to view deep analytics for ${stat.label}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-11 h-11 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-105 transition`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition">
                            Inspect
                          </span>
                          <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:animate-ping" />
                        </div>
                      </div>

                      <p className="text-3xl font-black text-white tracking-tight">
                        {stat.value}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-xs font-bold text-indigo-100 uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <ArrowRight className="w-4 h-4 text-teal-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition duration-200" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Courses Quickview */}
              <div className="glass-card rounded-3xl p-6 border border-indigo-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Your Published Courses</h2>
                    <p className="text-xs text-indigo-100 font-medium mt-0.5">Your created courses, classroom batch codes, and states</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-xs font-bold text-teal-300 hover:text-teal-200 inline-flex items-center gap-1 transition"
                  >
                    <span>View All Courses ({courses.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course: any) => (
                    <div
                      key={course._id}
                      className="p-4 rounded-2xl bg-white/4 border border-indigo-500/15 hover:border-indigo-400/40 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => togglePublish(course._id)}
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                            course.status === 'published'
                              ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                          }`}
                        >
                          {course.status}
                        </button>
                        <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                          Free Academic Access
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-sm line-clamp-1">
                        {course.title}
                      </h3>

                      {course.classroomCode && (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
                          <span className="text-teal-300 font-mono font-bold flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                            <span>Code: {course.classroomCode}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => copyBatchCode(course.classroomCode)}
                            className="px-2 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-[10px] font-bold text-teal-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            {copiedCode === course.classroomCode ? (
                              <>
                                <Check className="w-3 h-3 text-teal-300" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-teal-300" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold pt-1 border-t border-indigo-500/10">
                        <span>{course.totalLessons || 0} Lessons</span>
                        <span>{course.totalStudents || 0} Enrolled</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSES MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Course Management</h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">Deploy, edit curriculum, toggle publish state, and pin reference textbooks</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses or codes..."
                      className="pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white placeholder-indigo-200/60"
                    />
                  </div>
                  <Link
                    href="/dashboard/instructor/courses/create"
                    className="px-4 py-2 rounded-xl glow-btn-teal font-extrabold text-xs text-black flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Course</span>
                  </Link>
                </div>
              </div>

              {filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-indigo-400/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">No Courses Match Your Query</p>
                  <p className="text-xs text-indigo-100 font-medium">Try clearing your search query or deploy a new course module.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((course: any) => (
                    <div
                      key={course._id}
                      className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 hover:border-indigo-400/50 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => togglePublish(course._id)}
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                              course.status === 'published'
                                ? 'bg-teal-500/15 text-teal-300 border-teal-500/40 hover:bg-teal-500/25'
                                : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
                            }`}
                          >
                            {course.status}
                          </button>
                          <span className="text-[11px] font-bold text-teal-300 bg-teal-500/15 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                            Free Access
                          </span>
                        </div>

                        <h3 className="font-bold text-white text-sm line-clamp-2">
                          {course.title}
                        </h3>

                        {course.classroomCode && (
                          <div className="flex items-center justify-between p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs">
                            <span className="text-teal-300 font-mono font-bold flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                              <span>Code: {course.classroomCode}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => copyBatchCode(course.classroomCode)}
                              className="px-2 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-[10px] font-bold text-teal-200 transition flex items-center gap-1 cursor-pointer"
                            >
                              {copiedCode === course.classroomCode ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-indigo-100 font-medium">
                          <span>{course.totalLessons || 0} Lessons</span>
                          <span>{course.totalStudents || 0} Students Enrolled</span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-indigo-500/15">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/instructor/courses/${course._id}/edit`}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-center text-indigo-100 hover:text-white transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => setSelectedPinCourse({ id: course._id, title: course.title })}
                            className="py-1.5 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Pin Hub</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ENROLLED STUDENTS ROSTER */}
          {activeTab === 'cadets' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Enrolled Students Roster</h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">Students who joined your courses via classroom batch codes</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-400/30">
                  {studentsList.length} Active Students
                </span>
              </div>

              {studentsList.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-indigo-400/40 mx-auto mb-3" />
                  <p className="text-sm font-bold text-white mb-1">No Students Enrolled Yet</p>
                  <p className="text-xs text-indigo-100 font-medium">Share your course batch codes with students to see them appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentsList.map((cadet: any, index: number) => (
                    <div
                      key={cadet.enrollmentId || index}
                      className="p-4 rounded-2xl bg-white/4 border border-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-teal-400/30 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center font-bold text-black text-sm">
                          {cadet.studentName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{cadet.studentName}</h4>
                          <p className="text-xs text-indigo-100 font-medium">{cadet.studentEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="text-right">
                          <p className="text-indigo-100">{cadet.courseTitle}</p>
                          <p className="text-teal-300 font-mono text-[11px]">Batch: {cadet.classroomCode}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-400/30 font-bold">
                          {cadet.progressPercentage || 0}% Progress
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI ASSIGNMENT STUDIO & GRADEBOOK */}
          {activeTab === 'assignments' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Award className="w-6 h-6 text-teal-400" />
                    <span>AI Assignment Studio & Auto-Gradebook</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Generate assignments with Master Answer Keys. AI grades student submissions automatically in the background.
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignmentStudioModal(true)}
                  className="px-5 py-2.5 rounded-xl glow-btn-teal font-extrabold text-xs text-black flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Open Full AI Studio</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/25 space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-0.5 rounded-full">
                    Pillar 1 • 1-Click Generator
                  </span>
                  <h3 className="font-bold text-white text-base">Prompt to Master Answer Key</h3>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    Type any technical topic. The AI synthesizes the problem statement, point-by-point marking criteria, and a reference solution. Deployed to students in 1 click.
                  </p>
                  <button
                    onClick={() => setShowAssignmentStudioModal(true)}
                    className="text-xs font-bold text-teal-300 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Generate New Assignment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full">
                    Pillar 2 • Live Auto-Gradebook
                  </span>
                  <h3 className="font-bold text-white text-base">Zero Copy-Pasting Required</h3>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                    Students submit code directly from their portal. The AI compares their code against your Master Answer Key and registers marks, strengths, and areas for improvement in real time.
                  </p>
                  <button
                    onClick={() => setShowAssignmentStudioModal(true)}
                    className="text-xs font-bold text-indigo-200 hover:text-white inline-flex items-center gap-1"
                  >
                    <span>Inspect Submissions Ledger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BATCH AI QUIZZES */}
          {activeTab === 'quizzes' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Brain className="w-6 h-6 text-amber-400" />
                    <span>Batch AI Quiz Engine</span>
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">
                    Generate multi-question MCQ assessments for your students with automated grading & explanations
                  </p>
                </div>
                <button
                  onClick={() => setShowBatchQuizModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 font-extrabold text-xs text-black flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Batch Quiz</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
                <h3 className="font-bold text-white text-base">How Batch Quizzes Work</h3>
                <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                  Select any of your courses, pick difficulty (Beginner, Intermediate, Advanced), and specify question count. Gyanix's AI quiz model drafts questions based on course topics and pushes them to enrolled students immediately.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: ANALYTICS & REVIEWS */}
          {activeTab === 'analytics' && (
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/20 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Ratings & Feedback Intelligence</h2>
                  <p className="text-xs text-indigo-100 font-medium mt-0.5">Overall student satisfaction rating and reviews</p>
                </div>
                <span className="text-lg font-black text-pink-300 bg-pink-500/20 px-3.5 py-1 rounded-xl border border-pink-500/30">
                  {overview.averageRating ? Number(overview.averageRating).toFixed(1) : '5.0'} ★ Average
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-3">
                  <h3 className="font-bold text-sm text-white">Rating Distribution</h3>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = overview.ratingDistribution?.[star] || 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <span className="w-12 font-bold text-amber-300">{star} Stars</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full"
                            style={{ width: `${count > 0 ? (count / 10) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono text-indigo-100">{count}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-5 rounded-2xl bg-white/4 border border-indigo-500/20 space-y-3">
                  <h3 className="font-bold text-sm text-white">Student Reviews</h3>
                  {(overview.reviews || []).length === 0 ? (
                    <p className="text-xs text-indigo-100 font-medium">No written reviews yet. High marks and participation detected across courses.</p>
                  ) : (
                    <div className="space-y-2">
                      {overview.reviews.map((rev: any, i: number) => (
                        <div key={i} className="p-3 rounded-xl bg-white/3 border border-indigo-500/10 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white">{rev.studentName}</span>
                            <span className="text-amber-300 font-bold">{rev.rating} ★</span>
                          </div>
                          <p className="text-indigo-100 font-medium">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Deep Analytics Details Modal */}
      {detailModal && (
        <InstructorStatDetailsModal
          type={detailModal}
          onClose={() => setDetailModal(null)}
          data={overview}
          onCopyBatchCode={copyBatchCode}
          onTogglePublish={togglePublish}
        />
      )}

      {/* Resource Pinning Modal */}
      {selectedPinCourse && (
        <FacultyResourcePinModal
          courseId={selectedPinCourse.id}
          courseTitle={selectedPinCourse.title}
          onClose={() => setSelectedPinCourse(null)}
        />
      )}

      {/* AI Assignment Studio & Auto-Gradebook Modal */}
      {showAssignmentStudioModal && (
        <AIAssignmentStudioModal
          onClose={() => setShowAssignmentStudioModal(false)}
          courses={courses}
        />
      )}

      {/* Instructor AI Batch Quiz Creator Modal */}
      {showBatchQuizModal && (
        <InstructorBatchQuizModal
          isOpen={showBatchQuizModal}
          onClose={() => setShowBatchQuizModal(false)}
          courses={courses}
          onQuizCreated={() => {
            mutateCourses();
            mutateOverview();
          }}
        />
      )}
    </div>
  );
}
