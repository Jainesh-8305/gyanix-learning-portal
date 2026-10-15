/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  MessageSquare,
  Sparkles,
  ThumbsUp,
  CheckCircle2,
  Send,
  ArrowLeft,
  Search,
  Plus,
  Bot,
  GraduationCap,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';

// Graceful fetcher: on 403, return the response data (requiresEnrollment) instead of throwing
const fetcher = async (url: string) => {
  try {
    const r = await api.get(url);
    return r.data;
  } catch (err: any) {
    if (err?.response?.status === 403) {
      return err.response.data; // Pass { success: false, requiresEnrollment: true, message: '...' }
    }
    throw err;
  }
};

export default function CourseCommunityPage() {
  const { id: courseId } = useParams();
  const { user } = useAuthStore();

  const [activeFilter, setActiveFilter] = useState<
    'all' | 'unresolved' | 'resolved'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewTopic, setShowNewTopic] = useState(false);

  // New Topic Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [askAi, setAskAi] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reply Form
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  const { data: courseData } = useSWR(
    courseId ? `/courses/${courseId}` : null,
    fetcher,
  );
  const { data: discussionsData, mutate } = useSWR(
    courseId
      ? `/courses/${courseId}/discussions?filter=${activeFilter}&search=${encodeURIComponent(searchTerm)}`
      : null,
    fetcher,
    {
      // Don't throw on 403 — let us handle it gracefully
      onErrorRetry: (error: any, _key, _config, revalidate, { retryCount }) => {
        if (error?.response?.status === 403) return; // don't retry 403
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    },
  );

  const course = courseData?.data;
  const isNotEnrolled =
    discussionsData?.requiresEnrollment === true || !discussionsData?.success;
  const discussions: any[] =
    !isNotEnrolled && discussionsData?.data ? discussionsData.data : [];

  // Enrollment-required locked screen
  if (isNotEnrolled && discussionsData !== undefined) {
    return (
      <div
        className="min-h-screen bg-[#05060f] flex items-center justify-center p-6"
        style={{ zIndex: 10, position: 'relative' }}
      >
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-teal-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6 text-5xl">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Community Access Locked
          </h2>
          <p className="text-slate-400 mb-2">
            The{' '}
            <span className="text-indigo-400 font-semibold">
              {course?.title || 'this course'}
            </span>{' '}
            community is exclusively for enrolled students.
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Enroll in the course to join discussions, ask doubts, get AI tutor
            answers, and collaborate with fellow scholars.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/courses/${courseId}`}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-teal-500 text-white font-semibold hover:opacity-90 transition-opacity text-center block"
            >
              🚀 Enroll to Join Community
            </Link>
            <Link
              href="/courses"
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors text-center block"
            >
              ← Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/courses/${courseId}/discussions`, {
        title,
        content,
        askAi,
      });
      toast.success('Discussion topic posted!');
      setTitle('');
      setContent('');
      setShowNewTopic(false);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post topic');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async (discussionId: string) => {
    const text = replyContent[discussionId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/courses/${courseId}/discussions/${discussionId}/reply`, {
        content: text,
      });
      toast.success('Reply submitted!');
      setReplyContent({ ...replyContent, [discussionId]: '' });
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post reply');
    }
  };

  const handleToggleUpvote = async (discussionId: string) => {
    try {
      await api.put(`/courses/${courseId}/discussions/${discussionId}/upvote`);
      mutate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Please log in to vote');
    }
  };

  const handleToggleResolve = async (discussionId: string) => {
    try {
      await api.put(`/courses/${courseId}/discussions/${discussionId}/resolve`);
      mutate();
      toast.success('Status updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href={`/courses/${courseId}/learn`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200/70 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Video Lecture Suite</span>
          </Link>

          <button
            onClick={() => setShowNewTopic(!showNewTopic)}
            className="px-5 py-2.5 rounded-xl glow-btn-primary font-semibold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg w-fit"
          >
            <Plus className="w-4 h-4" />
            <span>Ask a Question</span>
          </button>
        </div>

        {/* Course Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-[11px] font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Gyanix Scholar Community</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {course?.title || 'Course Community Forum'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/60">
              Ask questions, discuss technical architectures, and get verified
              answers from faculty & AI.
            </p>
          </div>
        </div>

        {/* Post Question Modal/Card */}
        {showNewTopic && (
          <form
            onSubmit={handleCreateTopic}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-teal-500/30 bg-teal-500/5 space-y-4 animate-in fade-in"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Start New Discussion or Ask a Question</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-indigo-200/80 mb-1.5">
                Topic Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How does the Docker networking bridge isolate container subnets?"
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-indigo-200/80 mb-1.5">
                Details & Code Snippet
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Provide code, error logs, or specific questions..."
                required
                className="w-full px-4 py-3 rounded-xl glass-input text-sm text-white placeholder-indigo-300/30 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-teal-300">
                <input
                  type="checkbox"
                  checked={askAi}
                  onChange={(e) => setAskAi(e.target.checked)}
                  className="rounded text-teal-500 focus:ring-teal-400"
                />
                <span className="flex items-center gap-1">
                  <Bot className="w-4 h-4 text-teal-400" />
                  <span>Request Instant Gyanix AI Assistant Answer</span>
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewTopic(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl glow-btn-teal font-semibold text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Posting...' : 'Publish Topic'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-indigo-400/50 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/3 border border-indigo-500/20">
            {(['all', 'unresolved', 'resolved'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-indigo-200/60 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Discussion Topic List */}
        {discussions.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-3 border border-indigo-500/20">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto text-indigo-300 text-xl font-bold">
              💬
            </div>
            <p className="text-white font-bold text-base">No discussions yet</p>
            <p className="text-xs text-indigo-200/60 max-w-sm mx-auto">
              Be the first scholar to ask a question or start a conversation in
              this curriculum!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((d: any) => (
              <div
                key={d._id}
                className="glass-card rounded-2xl p-6 border border-indigo-500/20 space-y-4 shadow-xl"
              >
                {/* Topic Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-white text-base">
                        {d.title}
                      </h3>
                      {d.isResolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Solved</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-200/60">
                      Posted by{' '}
                      <span className="text-white font-semibold">
                        {d.user?.name || 'Scholar'}
                      </span>{' '}
                      · {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleUpvote(d._id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-indigo-500/20 text-xs font-semibold text-indigo-200 hover:text-white transition cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-teal-400" />
                      <span>{d.upvotes?.length || 0}</span>
                    </button>

                    {(user?._id === d.user?._id ||
                      user?.role === 'instructor' ||
                      user?.role === 'admin') && (
                      <button
                        onClick={() => handleToggleResolve(d._id)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-teal-400 transition cursor-pointer"
                        title={d.isResolved ? 'Mark as Open' : 'Mark as Solved'}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Topic Description */}
                <p className="text-xs sm:text-sm text-indigo-100/90 whitespace-pre-wrap leading-relaxed">
                  {d.content}
                </p>

                {/* Replies Thread */}
                {d.replies?.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-indigo-500/15">
                    {d.replies.map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl text-xs space-y-1.5 ${
                          r.isAiAnswer
                            ? 'bg-teal-500/10 border border-teal-500/30'
                            : r.isInstructorReply
                              ? 'bg-indigo-500/15 border border-indigo-500/30'
                              : 'bg-white/3 border border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5 font-bold">
                            {r.isAiAnswer ? (
                              <span className="flex items-center gap-1 text-teal-300">
                                <Bot className="w-3.5 h-3.5 text-teal-400" />
                                <span>Gyanix AI Assistant</span>
                              </span>
                            ) : r.isInstructorReply ? (
                              <span className="flex items-center gap-1 text-amber-300">
                                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                                <span>
                                  {r.user?.name || 'Faculty Member'} (Faculty)
                                </span>
                              </span>
                            ) : (
                              <span className="text-white">
                                {r.user?.name || 'Scholar'}
                              </span>
                            )}
                          </div>
                          <span className="text-indigo-300/40">
                            {new Date(
                              r.createdAt || Date.now(),
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-indigo-100/90 whitespace-pre-wrap leading-relaxed">
                          {r.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Reply Input */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={replyContent[d._id] || ''}
                    onChange={(e) =>
                      setReplyContent({
                        ...replyContent,
                        [d._id]: e.target.value,
                      })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddReply(d._id);
                    }}
                    placeholder="Write a response or solution..."
                    className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-indigo-300/30 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddReply(d._id)}
                    className="px-4 py-2.5 rounded-xl glow-btn-teal text-xs font-semibold inline-flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
