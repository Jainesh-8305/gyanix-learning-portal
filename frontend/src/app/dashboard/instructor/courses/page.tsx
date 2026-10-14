/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import {
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Edit,
  Send,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  draft: { label: 'Draft', color: 'text-gray-400 bg-gray-400/10 border-gray-400/30', icon: FileText },
  pending: { label: 'In Review', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', icon: Clock },
  published: { label: 'Published', color: 'text-teal-400 bg-teal-400/10 border-teal-400/30', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-rose-400 bg-rose-400/10 border-rose-400/30', icon: XCircle },
};

export default function InstructorCoursesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'draft' | 'pending' | 'published' | 'rejected'>('all');

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'instructor') router.push(`/dashboard/${user?.role}`);
  }, [isAuthenticated, user, router]);

  const { data, isLoading, mutate } = useSWR('/courses/my-courses', fetcher);
  const courses: any[] = data?.data || [];

  const handleResubmit = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/submit`);
      await mutate();
      toast.success('Course submitted for administrative review!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Submission failed');
    }
  };

  const handleDeleteCourse = async (courseId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/courses/${courseId}`);
      await mutate();
      toast.success('Course removed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const filteredCourses = activeFilter === 'all'
    ? courses
    : courses.filter((c) => c.status === activeFilter);

  const counts = {
    all: courses.length,
    draft: courses.filter((c) => c.status === 'draft').length,
    pending: courses.filter((c) => c.status === 'pending').length,
    published: courses.filter((c) => c.status === 'published').length,
    rejected: courses.filter((c) => c.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-[#05060f] relative overflow-hidden p-4 sm:p-6 lg:p-8">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Curriculum Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Courses</h1>
            <p className="text-xs sm:text-sm text-indigo-200/60 mt-1">
              Manage, edit, draft, and track moderation approval for all your courses.
            </p>
          </div>

          <Link
            href="/dashboard/instructor/courses/create"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl glow-btn-teal font-semibold text-xs shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Course</span>
          </Link>
        </div>

        {/* Interactive Clickable Filter Tabs */}
        <div className="flex flex-wrap gap-2.5 p-1.5 rounded-2xl bg-white/3 border border-indigo-500/20 w-fit">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'text-indigo-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Courses ({counts.all})</span>
          </button>

          <button
            onClick={() => setActiveFilter('draft')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'draft'
                ? 'bg-gray-700 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Drafts ({counts.draft})</span>
          </button>

          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'pending'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-lg'
                : 'text-amber-400/70 hover:text-amber-300 hover:bg-amber-500/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>In Review ({counts.pending})</span>
          </button>

          <button
            onClick={() => setActiveFilter('published')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'published'
                ? 'bg-teal-500/30 text-teal-300 border border-teal-500/50 shadow-lg'
                : 'text-teal-400/70 hover:text-teal-300 hover:bg-teal-500/10'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Published ({counts.published})</span>
          </button>

          <button
            onClick={() => setActiveFilter('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'rejected'
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 shadow-lg'
                : 'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Needs Changes ({counts.rejected})</span>
          </button>
        </div>

        {/* Course List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-24 animate-pulse border border-indigo-500/15" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-indigo-500/20">
            <div className="w-14 h-14 bg-indigo-500/15 rounded-2xl flex items-center justify-center mx-auto text-indigo-300 text-2xl font-bold">
              📚
            </div>
            <p className="text-white font-bold text-base">
              {activeFilter === 'all' ? 'No Courses Created Yet' : `No courses in "${activeFilter}" state`}
            </p>
            <p className="text-indigo-200/60 text-xs max-w-sm mx-auto">
              Draft your modules, upload lecture videos, and submit for instant admin verification.
            </p>
            <Link
              href="/dashboard/instructor/courses/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glow-btn-primary text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Course</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCourses.map((course: any) => {
              const config = STATUS_CONFIG[course.status] || STATUS_CONFIG.draft;
              const Icon = config.icon;
              return (
                <div
                  key={course._id}
                  className="glass-card rounded-2xl p-5 sm:p-6 border border-indigo-500/20 hover:border-indigo-400/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-300 text-xl font-bold">
                      🎓
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-bold text-white text-base truncate">{course.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          <span>{config.label}</span>
                        </span>
                      </div>

                      <p className="text-xs text-indigo-200/60 flex items-center gap-2 flex-wrap">
                        <span className="capitalize">{course.category}</span>
                        <span>•</span>
                        <span className="capitalize">{course.level}</span>
                        <span>•</span>
                        <span>{course.price ? `₹${course.price.toLocaleString('en-IN')}` : 'Free'}</span>
                        {course.status === 'published' && (
                          <>
                            <span>•</span>
                            <span className="text-teal-400 font-semibold">{course.totalStudents || 0} enrolled students</span>
                          </>
                        )}
                        {course.status === 'pending' && (
                          <span className="text-amber-400 font-semibold">— Under administrative review</span>
                        )}
                        {course.status === 'rejected' && (
                          <span className="text-rose-400 font-semibold">— Changes requested</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-indigo-500/15">
                    {/* Edit draft or rejected */}
                    <Link
                      href={`/dashboard/instructor/courses/${course._id}/edit`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-indigo-400/30 text-indigo-200 hover:text-white hover:bg-white/5 transition inline-flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Curriculum</span>
                    </Link>

                    {/* Submit draft */}
                    {course.status === 'draft' && (
                      <button
                        onClick={() => handleResubmit(course._id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold glow-btn-teal text-white transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit for Review</span>
                      </button>
                    )}

                    {/* Re-submit rejected */}
                    {course.status === 'rejected' && (
                      <button
                        onClick={() => handleResubmit(course._id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold glow-btn-primary text-white transition inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Re-submit Course</span>
                      </button>
                    )}

                    {/* View live published course */}
                    {course.status === 'published' && (
                      <Link
                        href={`/courses/${course._id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold glow-btn-teal text-white transition inline-flex items-center gap-1.5 shadow-md"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live</span>
                      </Link>
                    )}

                    {/* Delete course button */}
                    <button
                      onClick={() => handleDeleteCourse(course._id, course.title)}
                      className="p-2 rounded-xl text-indigo-300/40 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}