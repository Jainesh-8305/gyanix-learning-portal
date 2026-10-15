/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import Link from 'next/link';
import {
  X,
  BookOpen,
  Users,
  Star,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  Award,
  BarChart2,
  Search,
} from 'lucide-react';

interface InstructorStatDetailsModalProps {
  type: 'courses' | 'cadets' | 'reviews' | 'ratings' | null;
  onClose: () => void;
  data: {
    courses: any[];
    students: any[];
    reviews: any[];
    averageRating: number;
    ratingDistribution: Record<string, number>;
  };
  onTogglePublish?: (courseId: string) => void;
  onCopyBatchCode?: (code: string) => void;
}

export default function InstructorStatDetailsModal({
  type,
  onClose,
  data,
  onCopyBatchCode,
}: InstructorStatDetailsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, true);

  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!type) return null;

  const handleCopy = (code: string) => {
    if (onCopyBatchCode) {
      onCopyBatchCode(code);
    } else {
      navigator.clipboard.writeText(code);
    }
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered datasets
  const filteredCourses = (data.courses || []).filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classroomCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredStudents = (data.students || []).filter(
    (s) =>
      s.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredReviews = (data.reviews || []).filter(
    (r) =>
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reviewText?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in"
    >
      <div className="glass-card max-w-4xl w-full rounded-3xl p-6 sm:p-8 border border-indigo-500/30 bg-[#0c0f24] space-y-6 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-indigo-500/15">
          <div className="flex items-center gap-3">
            {type === 'courses' && (
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
            )}
            {type === 'cadets' && (
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-500/30">
                <Users className="w-5 h-5" />
              </div>
            )}
            {type === 'reviews' && (
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
            )}
            {type === 'ratings' && (
              <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-300 flex items-center justify-center border border-pink-500/30">
                <Star className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {type === 'courses' && 'Your Published Courses'}
                {type === 'cadets' && 'Enrolled Students Roster'}
                {type === 'reviews' && 'Active Student Reviews'}
                {type === 'ratings' && 'Ratings & Student Feedback Analysis'}
              </h2>
              <p className="text-xs text-indigo-200/60 mt-0.5">
                {type === 'courses' &&
                  `Manage and review ${data.courses.length} courses published for students`}
                {type === 'cadets' &&
                  `Detailed record of ${data.students.length} students enrolled in your courses`}
                {type === 'reviews' &&
                  `${data.reviews.length} student evaluations and feedback submitted`}
                {type === 'ratings' &&
                  `Real-time student satisfaction metrics and rating distribution`}
              </p>
            </div>
          </div>
          <button
            aria-label="Close dialog"
            onClick={onClose}
            className="text-indigo-300/60 hover:text-white p-1 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar (for lists) */}
        {type !== 'ratings' && (
          <div className="relative">
            <Search className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                type === 'courses'
                  ? 'Search by course name or batch code...'
                  : type === 'cadets'
                    ? 'Search by student name, email, or course...'
                    : 'Search reviews...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs text-white placeholder-indigo-300/30 border border-indigo-500/20"
            />
          </div>
        )}

        {/* Modal Body Content */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* ── 1. COURSES VIEW ────────────────────────── */}
          {type === 'courses' && (
            <div className="space-y-3">
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 text-indigo-300/50 text-xs">
                  No courses matching your search.
                </div>
              ) : (
                filteredCourses.map((c: any) => (
                  <div
                    key={c._id}
                    className="p-4 sm:p-5 rounded-2xl bg-white/3 border border-indigo-500/15 hover:border-indigo-500/30 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          {c.status}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-300/60 uppercase">
                          {c.category} • {c.level}
                        </span>
                        {c.classroomCode && (
                          <button
                            type="button"
                            onClick={() => handleCopy(c.classroomCode)}
                            className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 flex items-center gap-1 hover:bg-indigo-500/30 cursor-pointer"
                            title="Click to copy batch code"
                          >
                            <span>Batch: {c.classroomCode}</span>
                            {copiedCode === c.classroomCode ? (
                              <Check className="w-3 h-3 text-teal-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-indigo-300" />
                            )}
                          </button>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">
                        {c.title}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-indigo-200/70">
                        <span>👥 {c.totalStudents || 0} Students Enrolled</span>
                        <span>
                          ⭐ {c.rating ? `${c.rating} / 5.0` : 'No ratings'}
                        </span>
                        <span className="text-teal-400 font-semibold">
                          Free Academic Access
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-indigo-500/15">
                      <Link
                        href={`/courses/${c._id}`}
                        className="px-3 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/25 text-xs text-indigo-200 font-semibold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </Link>
                      <Link
                        href={`/dashboard/instructor/courses/${c._id}/edit`}
                        className="px-3 py-2 rounded-xl glow-btn-primary text-xs font-semibold flex items-center gap-1.5 transition shadow"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Course</span>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 2. ENROLLED STUDENTS VIEW ─────── */}
          {type === 'cadets' && (
            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-indigo-300/50 text-xs">
                  No enrolled students found matching your search.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-indigo-200/80">
                    <thead>
                      <tr className="border-b border-indigo-500/20 text-indigo-300 uppercase text-[10px] tracking-wider font-bold">
                        <th className="pb-3 px-3">Student Name</th>
                        <th className="pb-3 px-3">Enrolled Course</th>
                        <th className="pb-3 px-3">Classroom Batch</th>
                        <th className="pb-3 px-3">Progress</th>
                        <th className="pb-3 px-3">Enrolled Date</th>
                        <th className="pb-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-500/10">
                      {filteredStudents.map((s: any, idx: number) => (
                        <tr
                          key={s.enrollmentId || idx}
                          className="hover:bg-white/2 transition"
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 font-bold text-xs uppercase">
                                {s.studentName?.[0] || 'C'}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">
                                  {s.studentName}
                                </p>
                                <p className="text-[11px] text-indigo-300/50">
                                  {s.studentEmail}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-medium text-white max-w-[200px] truncate">
                            {s.courseTitle}
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-indigo-300">
                            {s.classroomCode}
                          </td>
                          <td className="py-3 px-3 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500"
                                  style={{
                                    width: `${s.progressPercentage || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-[11px] font-mono text-white font-semibold">
                                {s.progressPercentage || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-indigo-300/60 text-[11px]">
                            {s.enrolledAt
                              ? new Date(s.enrolledAt).toLocaleDateString()
                              : 'Active'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {s.isCompleted || s.progressPercentage === 100 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                                <Award className="w-3 h-3" /> Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                In Progress
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── 3. ACTIVE REVIEWS VIEW ──────────────────── */}
          {type === 'reviews' && (
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-white/2 border border-indigo-500/10 space-y-2">
                  <Star className="w-10 h-10 text-amber-400/30 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">
                    No Written Student Reviews Yet
                  </p>
                  <p className="text-xs text-indigo-200/60 max-w-md mx-auto">
                    Students are currently learning through your modules. As
                    students complete the curriculum and submit course
                    evaluations, their detailed testimonials and star ratings
                    will be archived here.
                  </p>
                </div>
              ) : (
                filteredReviews.map((r: any, idx: number) => (
                  <div
                    key={r.id || idx}
                    className="p-4 sm:p-5 rounded-2xl bg-white/3 border border-indigo-500/15 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs uppercase">
                          {r.studentName?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">
                            {r.studentName}
                          </p>
                          <p className="text-[10px] text-indigo-300/60">
                            {r.courseTitle}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-500/15 px-2.5 py-1 rounded-xl border border-amber-500/30">
                        <span className="text-xs font-bold text-amber-300">
                          {r.rating
                            ? '★'.repeat(Math.min(5, Math.max(1, r.rating)))
                            : '★★★★★'}
                        </span>
                        <span className="text-[11px] font-bold text-white ml-1">
                          {r.rating || 0}.0
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-indigo-100/90 leading-relaxed italic bg-white/2 p-3 rounded-xl border border-indigo-500/10">
                      "{r.reviewText}"
                    </p>
                    <p className="text-[10px] text-indigo-300/40 text-right">
                      {r.reviewedAt
                        ? new Date(r.reviewedAt).toLocaleDateString()
                        : 'Verified Enrollment'}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── 4. AVERAGE RATINGS ANALYSIS VIEW ────────── */}
          {type === 'ratings' && (
            <div className="space-y-6">
              {/* Highlight summary card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-500/15 via-indigo-600/10 to-teal-500/15 border border-pink-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                    Platform Satisfaction Score
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl sm:text-5xl font-black text-white">
                      {data.averageRating || '0.0'}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex text-amber-400 text-sm">
                        {'★'.repeat(5)}
                      </div>
                      <p className="text-[11px] text-indigo-200/70">
                        Across all enrolled classroom cohorts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center w-full sm:w-auto">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xl font-black text-teal-300">
                      {data.reviews?.length
                        ? Math.round(
                            (data.reviews.filter(
                              (r: { rating?: number }) => (r.rating || 0) >= 4,
                            ).length /
                              data.reviews.length) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-indigo-200/60">
                      Positive Feedback
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-xl font-black text-indigo-300">
                      {data.courses.length}
                    </p>
                    <p className="text-[10px] uppercase font-semibold text-indigo-200/60">
                      Active Curriculums
                    </p>
                  </div>
                </div>
              </div>

              {/* Star Distribution Bars */}
              <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-pink-400" />
                  <span>Rating Breakdown</span>
                </h4>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = data.ratingDistribution?.[String(star)] || 0;
                  const total = Math.max(
                    1,
                    Object.values(data.ratingDistribution || {}).reduce(
                      (n: number, value) => n + Number(value),
                      0,
                    ),
                  );
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="w-10 font-bold text-indigo-200 flex items-center gap-1">
                        {star}{' '}
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right font-mono text-indigo-300/80 text-[11px]">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown per Course */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Course Satisfaction Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.courses.map((c: any) => (
                    <div
                      key={c._id}
                      className="p-4 rounded-2xl bg-white/3 border border-indigo-500/15 flex items-center justify-between"
                    >
                      <div className="space-y-0.5 max-w-[200px]">
                        <p className="text-xs font-bold text-white truncate">
                          {c.title}
                        </p>
                        <p className="text-[10px] text-indigo-300/60 font-mono">
                          Batch: {c.classroomCode || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-amber-300">
                          {c.rating ? `${c.rating} ★` : 'No ratings'}
                        </span>
                        <p className="text-[10px] text-indigo-300/50">
                          {c.totalStudents || 0} students
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-indigo-500/15">
          <span className="text-[11px] text-indigo-300/60">
            Gyanix Learning Portal • Instructor Intelligence Suite
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
