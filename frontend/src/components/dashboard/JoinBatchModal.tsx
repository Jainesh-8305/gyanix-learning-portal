'use client';

import { useState, useRef } from 'react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { X, KeyRound, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import type { Course } from '@/types';
import { apiError } from '@/lib/errors';
import toast from 'react-hot-toast';

interface JoinBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: () => void;
}

export default function JoinBatchModal({
  isOpen,
  onClose,
  onJoined,
}: JoinBatchModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, onClose, isOpen);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [joinedCourse, setJoinedCourse] = useState<Course | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a classroom batch code');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/courses/join-batch', {
        classroomCode: code.trim().toUpperCase(),
      });
      if (res.data.alreadyEnrolled) {
        toast('You are already enrolled in this batch!', { icon: 'ℹ️' });
      } else {
        toast.success(
          res.data.message || 'Successfully joined classroom batch! 🚀',
        );
      }
      setJoinedCourse(
        res.data.course || res.data.data?.course || res.data.data,
      );
      onJoined();
    } catch (err: unknown) {
      toast.error(apiError(err, 'Invalid or expired classroom code'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJoinedCourse(null);
    setCode('');
    onClose();
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-[#0a0f24] border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-teal-500/10">
        {/* Close Button */}
        <button
          aria-label="Close dialog"
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl text-indigo-300/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {joinedCourse ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Batch Unlocked!</h3>
              <p className="text-sm text-teal-300/80 mt-1">
                You have successfully joined{' '}
                <span className="text-white font-semibold">
                  {joinedCourse.title}
                </span>
                .
              </p>
            </div>
            <p className="text-xs text-indigo-300/60">
              All instructor course modules, AI assignments, and study materials
              are now available in your dashboard.
            </p>
            <button
              onClick={handleReset}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to Study Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/15 text-teal-300 flex items-center justify-center border border-teal-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Join Classroom Batch</span>
                  <Sparkles className="w-4 h-4 text-teal-400" />
                </h3>
                <p className="text-xs text-indigo-200/60">
                  Enter your instructor&apos;s code for instant free enrollment.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">
                Classroom / Batch Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. GYX-7821"
                maxLength={10}
                disabled={loading}
                className="w-full px-4 py-3.5 bg-black/50 border border-teal-500/40 rounded-xl text-white placeholder-indigo-300/30 font-mono tracking-widest text-center text-lg uppercase focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
              <p className="text-[11px] text-indigo-300/50 text-center">
                Ask your faculty or mentor for their 10-character course batch
                code.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-200 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-600 hover:brightness-110 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Join Batch'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
