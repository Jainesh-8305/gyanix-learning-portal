/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Trash2,
  Send,
  Search,
  BookOpen,
  User,
  Clock,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import Modal from '@/components/ui/Modal';
import { Course } from '@/types';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  published: { label: 'Live / Published', style: 'bg-teal-500/15 text-teal-300 border-teal-500/30' },
  pending: { label: 'Pending Review', style: 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse' },
  hidden: { label: 'Hidden / Disabled', style: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  rejected: { label: 'Changes Requested', style: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
  draft: { label: 'Draft', style: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
  archived: { label: 'Archived', style: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
};

export default function AdminCoursesPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'published' | 'hidden' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [changeRequestModalOpen, setChangeRequestModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    else if (user?.role !== 'admin') router.push('/dashboard/student');
  }, [isAuthenticated, user, router]);

  const queryParams = new URLSearchParams();
  if (activeTab !== 'all') queryParams.append('status', activeTab);
  if (searchQuery.trim()) queryParams.append('search', searchQuery.trim());

  const { data, mutate, isLoading } = useSWR(`/admin/courses?${queryParams.toString()}`, fetcher);
  const courses: Course[] = data?.data || [];

  // Quick stats counts
  const pendingCount = courses.filter((c) => c.status === 'pending').length;

  // ── Quick status toggle (Publish / Hide / Archive) ─────────────
  const handleSetStatus = async (courseId: string, status: string, feedback?: string) => {
    try {
      await api.put(`/admin/courses/${courseId}/status`, { status, feedback });
      toast.success(`Course marked as ${status}`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update course status');
    }
  };

  // ── Direct approve ─────────────────────────────────────────────
  const handleApprove = async (courseId: string) => {
    try {
      await api.put(`/admin/courses/${courseId}/approve`);
      toast.success('Course approved and published live!');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Approval failed');
    }
  };

  // ── Request changes / Notify instructor ────────────────────────
  const handleOpenChangeRequest = (course: Course) => {
    setSelectedCourse(course);
    setFeedbackText(course.adminFeedback || '');
    setChangeRequestModalOpen(true);
  };

  const handleSubmitChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!feedbackText.trim()) {
      toast.error('Please enter the required revisions or feedback');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/courses/${selectedCourse._id}/request-changes`, {
        feedback: feedbackText,
        status: 'rejected',
      });
      toast.success('Change instructions emailed to instructor!');
      setChangeRequestModalOpen(false);
      setSelectedCourse(null);
      setFeedbackText('');
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send change request');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete Course ──────────────────────────────────────────────
  const handleOpenDelete = (course: Course) => {
    setSelectedCourse(course);
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    setActionLoading(true);
    try {
      await api.delete(`/admin/courses/${selectedCourse._id}`);
      toast.success('Course removed successfully');
      setDeleteConfirmModalOpen(false);
      setSelectedCourse(null);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#05060f] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Moderation & Control</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Course Governance</h1>
            <p className="text-sm text-indigo-200/60 mt-1">
              Approve, hide/disable, request instructor modifications, or remove courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/admin"
              className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition"
            >
              ← Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Courses' },
              { id: 'pending', label: 'Pending Review', count: pendingCount },
              { id: 'published', label: 'Live / Published' },
              { id: 'hidden', label: 'Hidden / Disabled' },
              { id: 'rejected', label: 'Changes Requested' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'text-indigo-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.label}</span>
                  {typeof tab.count === 'number' && tab.count > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-indigo-300/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs placeholder-indigo-300/30 focus:outline-none"
            />
          </div>
        </div>

        {/* Course Cards List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl h-36 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-card rounded-3xl p-16 text-center">
            <BookOpen className="w-12 h-12 text-indigo-400/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-1">No courses found</h3>
            <p className="text-sm text-indigo-200/60">
              No courses matching the selected filter or search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const badge = STATUS_BADGES[course.status] || STATUS_BADGES.draft;
              const instructorName = typeof course.instructor === 'object' ? course.instructor.name : 'Unknown';
              const instructorEmail = typeof course.instructor === 'object' ? course.instructor.email : '';

              return (
                <div
                  key={course._id}
                  className="glass-card rounded-2xl p-5 sm:p-6 transition-all border border-indigo-500/20 hover:border-indigo-500/40 space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Course Info */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-xs text-teal-400 font-medium capitalize">
                          {course.category?.replace('-', ' ')}
                        </span>
                        <span className="text-xs text-indigo-300/40">•</span>
                        <span className="text-xs text-indigo-300/60 capitalize">{course.level}</span>
                      </div>

                      <h3 className="text-lg font-bold text-white leading-snug">{course.title}</h3>

                      {course.shortDescription && (
                        <p className="text-xs sm:text-sm text-indigo-200/60 line-clamp-2">
                          {course.shortDescription}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-300/60 pt-1">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span>
                            {instructorName} {instructorEmail && `(${instructorEmail})`}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                        </span>
                        <span className="font-semibold text-white">
                          {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                        </span>
                        <span>{course.totalStudents || 0} Students enrolled</span>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                      {/* Preview / View Details */}
                      <Link
                        href={`/courses/${course._id}`}
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200 hover:text-white transition flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>

                      {/* Approve / Publish */}
                      {course.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => handleApprove(course._id)}
                          className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Publish Live</span>
                        </button>
                      )}

                      {/* Hide / Disable (Make unavailable) */}
                      {course.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(course._id, 'hidden')}
                          className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 hover:text-purple-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          title="Hide from public catalog"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide / Disable</span>
                        </button>
                      )}

                      {/* Unhide */}
                      {course.status === 'hidden' && (
                        <button
                          type="button"
                          onClick={() => handleSetStatus(course._id, 'published')}
                          className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 hover:text-teal-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          title="Restore visibility in catalog"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Unhide</span>
                        </button>
                      )}

                      {/* Request Changes / Send Feedback */}
                      <button
                        type="button"
                        onClick={() => handleOpenChangeRequest(course)}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Request Edits</span>
                      </button>

                      {/* Delete Course */}
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(course)}
                        className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                        title="Permanently remove course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Feedback Banner if changes were previously requested */}
                  {course.adminFeedback && (
                    <div className="rounded-xl p-3.5 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-amber-300 uppercase tracking-wider">
                          Latest Admin Notes to Instructor:
                        </span>
                        <p className="text-indigo-100/80 mt-0.5 leading-relaxed">{course.adminFeedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal 1: Request Changes / Instructor Notification ──── */}
      <Modal
        isOpen={changeRequestModalOpen}
        onClose={() => setChangeRequestModalOpen(false)}
        title="Request Course Modifications"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitChangeRequest} className="space-y-4">
          <p className="text-xs text-indigo-200/70">
            Send structured change instructions to{' '}
            <strong className="text-white">
              {typeof selectedCourse?.instructor === 'object' ? selectedCourse.instructor.name : 'Instructor'}
            </strong>{' '}
            for course <strong className="text-teal-300">"{selectedCourse?.title}"</strong>. An email
            with your feedback will be dispatched automatically.
          </p>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-indigo-200/80 mb-2">
              Specific Changes or Edits Needed:
            </label>
            <textarea
              rows={5}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g. Please update lesson 3 video resolution, refine quiz questions for chapter 2, and add a higher-resolution thumbnail image..."
              className="w-full p-4 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setChangeRequestModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl glow-btn-primary text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? 'Sending Notification…' : 'Send Instructions & Update'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal 2: Delete Confirmation ───────────────────────── */}
      <Modal
        isOpen={deleteConfirmModalOpen}
        onClose={() => setDeleteConfirmModalOpen(false)}
        title="Delete Course Permanently"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>
              This action is irreversible. The course and its lessons will be permanently deleted from the database.
            </span>
          </div>

          <p className="text-xs text-indigo-200/80">
            Are you sure you want to delete <strong className="text-white">"{selectedCourse?.title}"</strong>?
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteConfirmModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-600/30 disabled:opacity-50 cursor-pointer"
            >
              {actionLoading ? 'Deleting…' : 'Yes, Delete Course'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}