/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import { CheckCircle, PlayCircle, Lock, ChevronLeft, Menu, X, Sparkles, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import VideoPlayer from '@/components/courses/VideoPlayer';

const fetcher = (url: string) => api.get(url).then(r => r.data);

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.token) return;
        }
      } catch (e) {}
    }
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data: courseData } = useSWR(`/courses/${params.id}`, fetcher);
  const { data: enrollmentData, mutate } = useSWR('/enrollments/my', fetcher);

  const course = courseData?.data;
  const enrollment = enrollmentData?.data?.find(
    (e: any) => e.course._id === params.id || e.course === params.id
  );

  // Auto-select first lesson
  useEffect(() => {
    if (course?.sections?.length && !activeLesson) {
      const firstLesson = course.sections[0]?.lessons[0];
      if (firstLesson) setActiveLesson(firstLesson);
    }
  }, [course, activeLesson]);

  const isLessonCompleted = (lessonId: string) =>
    enrollment?.completedLessons?.some((l: any) => l.lessonId === lessonId);

  const handleLessonComplete = async (lessonId: string, watchTime: number) => {
    try {
      await api.put(`/enrollments/${params.id}/progress`, { lessonId, watchTimeSeconds: watchTime });
      await mutate();
      toast.success('Lesson completed! ✓');
    } catch {}
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#05060f] flex items-center justify-center">
        <div className="animate-pulse text-indigo-300/50">Loading your course...</div>
      </div>
    );
  }

  const totalLessons = course.sections?.reduce((acc: number, s: any) => acc + s.lessons.length, 0) || 0;
  const progressPercent = enrollment?.progressPercentage || 0;

  return (
    <div className="min-h-screen bg-[#05060f] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-80' : 'w-0'} shrink-0 transition-all duration-300 overflow-hidden bg-[#0a0c1a] border-r border-indigo-500/15 flex flex-col`}>
        <div className="p-4 border-b border-indigo-500/15">
          <Link href={`/courses/${params.id}`} className="flex items-center gap-2 text-indigo-300/60 hover:text-teal-400 text-sm transition mb-3">
            <ChevronLeft size={16} />
            Back to course
          </Link>
          <h2 className="font-medium text-white text-sm line-clamp-2">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-indigo-200/40 mb-1.5">
              <span>Your progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {course.sections?.map((section: any, sIndex: number) => (
            <div key={section._id || sIndex}>
              <div className="px-4 py-3 bg-white/2 border-b border-indigo-500/10">
                <p className="text-xs font-medium text-indigo-200/50 uppercase tracking-wide">
                  {section.title}
                </p>
              </div>
              {section.lessons?.map((lesson: any, lIndex: number) => {
                const completed = isLessonCompleted(lesson._id);
                const isActive = activeLesson?._id === lesson._id;
                return (
                  <button
                    key={lesson._id || lIndex}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-4 py-3.5 flex items-start gap-3 border-b border-indigo-500/5 transition-all ${
                      isActive ? 'bg-indigo-500/10 border-l-2 border-l-indigo-400' : 'hover:bg-white/3'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {completed ? (
                        <CheckCircle size={16} className="text-teal-400" />
                      ) : (
                        <PlayCircle size={16} className={isActive ? 'text-indigo-400' : 'text-indigo-300/30'} />
                      )}
                    </div>
                    <span className={`text-sm leading-snug ${isActive ? 'text-white' : completed ? 'text-indigo-200/60' : 'text-indigo-200/50'}`}>
                      {lesson.title}
                    </span>
                  </button>
                );
                })}
              </div>
            ))}
          </div>

        {/* AI Quiz Section in Sidebar */}
        <div className="p-4 border-t border-indigo-500/15 bg-[#070914] space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>AI Assessment Quiz</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                progressPercent === 100
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}
            >
              {progressPercent === 100 ? '✨ Unlocked' : '🔒 Locked'}
            </span>
          </div>
          <p className="text-[11px] text-indigo-200/60 leading-tight">
            {progressPercent === 100
              ? '🎉 Lectures completed! Attend the AI Quiz to verify your skills & unlock your certificate.'
              : `Complete all ${totalLessons} video lectures (${enrollment?.completedLessons?.length || 0}/${totalLessons}) to unlock the AI Quiz.`}
          </p>
          <Link
            href={`/courses/${params.id}/community`}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-xs font-semibold text-indigo-200 hover:text-white flex items-center justify-center gap-1.5 text-center transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Course Community Q&A</span>
          </Link>
          <Link
            href={`/courses/${params.id}/quiz`}
            className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md text-center transition ${
              progressPercent === 100
                ? 'glow-btn-teal text-black font-extrabold'
                : 'bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-indigo-200'
            }`}
          >
            {progressPercent === 100 ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch AI Quiz 🚀</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Quiz Locked ({progressPercent}%)</span>
              </>
            )}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-12 bg-[#0a0c1a]/80 backdrop-blur-xl border-b border-indigo-500/15 flex items-center justify-between px-4 gap-3">
          <div className="flex items-center gap-3 truncate">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-indigo-300/50 hover:text-white transition"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="text-sm text-indigo-200/80 font-medium truncate">
              {activeLesson?.title || 'Select a lesson'}
            </span>
          </div>

          <Link
            href={`/courses/${params.id}/community`}
            className="px-3 py-1.5 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Question / Discussion</span>
          </Link>
        </div>

        {/* Video area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeLesson?.videoUrl ? (
            <div className="max-w-4xl mx-auto">
              <VideoPlayer
                videoUrl={activeLesson.videoUrl}
                lessonId={activeLesson._id}
                onComplete={handleLessonComplete}
                title={activeLesson.title}
              />
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-white mb-2">{activeLesson.title}</h2>
                {activeLesson.description && (
                  <p className="text-indigo-200/60 text-sm">{activeLesson.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto flex items-center justify-center h-64 bg-[#0f1120]/60 rounded-2xl border border-indigo-500/15">
              <div className="text-center">
                <PlayCircle size={32} className="text-indigo-400/30 mx-auto mb-3" />
                <p className="text-indigo-200/40 text-sm">
                  {activeLesson ? 'No video URL for this lesson yet' : 'Select a lesson from the sidebar'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}