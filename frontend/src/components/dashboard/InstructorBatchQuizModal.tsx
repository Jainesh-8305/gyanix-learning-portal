'use client';

import { useState } from 'react';
import { X, Sparkles, Brain, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface CourseOption {
  _id: string;
  title: string;
  classroomCode?: string;
}

interface InstructorBatchQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseOption[];
  onQuizCreated?: () => void;
}

export default function InstructorBatchQuizModal({
  isOpen,
  onClose,
  courses,
  onQuizCreated,
}: InstructorBatchQuizModalProps) {
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?._id || '');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [timeLimit, setTimeLimit] = useState(15);
  const [dueDays, setDueDays] = useState(7);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error('Please select a course batch');
      return;
    }

    const selectedCourse = courses.find((c) => c._id === selectedCourseId);
    const effectiveTopic = topic.trim() || selectedCourse?.title || 'Core Syllabus Revision';

    setLoading(true);
    const toastId = toast.loading('AI Synthesizer generating syllabus-aligned quiz questions...');

    try {
      const dueDate = new Date(Date.now() + dueDays * 24 * 60 * 60 * 1000).toISOString();
      const res = await api.post(`/courses/${selectedCourseId}/batch-quiz`, {
        topic: effectiveTopic,
        difficulty,
        timeLimit,
        dueDate,
      });

      toast.success(res.data.message || 'AI Batch Quiz successfully created and assigned! 🎯', {
        id: toastId,
      });
      if (onQuizCreated) onQuizCreated();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate batch quiz. Try again.', {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0a0f24] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-indigo-300/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-300 flex items-center justify-center border border-amber-500/30">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Create AI Batch Quiz</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-xs text-indigo-200/60">
                Generate and dispatch an AI recall assignment for enrolled students.
              </p>
            </div>
          </div>

          {/* Select Course Batch */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
              Target Course Batch
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-4 py-3 bg-black/50 border border-indigo-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#0e1226]">
                  {c.title} {c.classroomCode ? `[${c.classroomCode}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Specific Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
              Topic or Exam Focus (Optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Memory Management & Paging / React Hooks"
              className="w-full px-4 py-3 bg-black/50 border border-indigo-500/30 rounded-xl text-white text-sm placeholder-indigo-300/40 focus:outline-none focus:border-amber-400"
            />
            <p className="text-[11px] text-indigo-300/50">
              Leave blank to automatically calibrate to the entire course title.
            </p>
          </div>

          {/* Difficulty & Time Limit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-black/50 border border-indigo-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="easy" className="bg-[#0e1226]">Easy (Foundations)</option>
                <option value="medium" className="bg-[#0e1226]">Medium (Applied)</option>
                <option value="hard" className="bg-[#0e1226]">Hard (Exam Cram)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Timer</span>
              </label>
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-black/50 border border-indigo-500/30 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400"
              >
                <option value={10} className="bg-[#0e1226]">10 Minutes (Rapid)</option>
                <option value={15} className="bg-[#0e1226]">15 Minutes (Standard)</option>
                <option value={30} className="bg-[#0e1226]">30 Minutes (Deep Cram)</option>
              </select>
            </div>
          </div>

          {/* Due Window */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Submission Due Window</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 7, 14].map((days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDueDays(days)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    dueDays === days
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                      : 'bg-white/5 text-indigo-200/70 border-white/5 hover:bg-white/10'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            Students enrolled in this classroom batch will immediately receive this AI assignment with adaptive distractor analysis and instant score delivery.
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-200 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Assign to Batch</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
