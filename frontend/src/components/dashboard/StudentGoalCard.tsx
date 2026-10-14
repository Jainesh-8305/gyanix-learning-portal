'use client';

import { useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

interface StudentGoalCardProps {
  completedToday?: number;
  dailyTarget?: number;
  nextLessonLink?: string;
  nextLessonTitle?: string;
  imageSrc?: string;
}

export default function StudentGoalCard({
  completedToday = 3,
  dailyTarget = 4,
  nextLessonLink = '/courses',
  nextLessonTitle = 'Complete 1 more lesson to reach your goal!',
  imageSrc = '/images/gyanix_cute_cosmic_ai_orb.jpg',
}: StudentGoalCardProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const gradId = useId();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const percentage = Math.min(100, Math.round((completedToday / dailyTarget) * 100));
  const r = 32;
  const circ = 2 * Math.PI * r;
  const strokeOffset = circ - (percentage / 100) * circ;

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-4.5 border border-cyan-500/25 bg-[#070b1f]/90 space-y-3.5 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/50">
      {/* ── Top Row: Date Pill & Calendar Action ── */}
      <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/15">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-200/90">
          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          <span>{todayFormatted}</span>
        </div>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          title="Study Calendar"
          className="p-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-indigo-500/20 text-indigo-200 hover:text-cyan-300 transition cursor-pointer"
        >
          <Calendar className="w-3 h-3" />
        </button>
      </div>

      {/* ── Center Content: Today's Learning Goal ── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/50 border border-cyan-500/20 space-y-2">
        <h4 className="text-xs font-extrabold text-white tracking-tight flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>Today&apos;s Learning Goal</span>
        </h4>

        <div className="flex items-center justify-between gap-3">
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg width="68" height="68" viewBox="0 0 80 80" className="-rotate-90">
              <circle
                cx="40"
                cy="40"
                r={r}
                fill="none"
                stroke="rgba(99, 102, 241, 0.18)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r={r}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth="6"
                strokeDasharray={circ}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f5d4" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-white tracking-tight">
                {completedToday}/{dailyTarget}
              </span>
              <span className="text-[8px] font-bold text-cyan-300 uppercase">Goal</span>
            </div>
          </div>

          {/* Goal Description & Action */}
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs font-semibold text-white leading-tight line-clamp-2">
              {completedToday >= dailyTarget
                ? '🎉 Daily goal achieved!'
                : nextLessonTitle}
            </p>
            <p className="text-[10px] text-indigo-200/70">
              {percentage}% daily completion
            </p>
          </div>

          {/* Chevron Jump Action */}
          <Link
            href={nextLessonLink}
            title="Continue Lesson"
            className="w-7 h-7 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-sm shadow-cyan-500/20 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Bottom Cosmic Companion Visual ── */}
      <div className="rounded-2xl p-2.5 bg-gradient-to-r from-indigo-950/60 via-[#0a0f2c]/80 to-indigo-950/60 border border-indigo-500/20 flex items-center gap-3 relative overflow-hidden group">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-cyan-400/40 shadow-md shadow-cyan-500/20">
          <Image
            src={imageSrc}
            alt="Cosmic Study Companion"
            fill
            sizes="48px"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider">
              Orbital Study Sync
            </span>
          </div>
          <p className="text-[11px] font-bold text-white truncate">
            Gyanix Orbit Mentor
          </p>
          <p className="text-[10px] text-indigo-200/70 truncate">
            {completedToday >= dailyTarget
              ? 'Trajectory optimal!'
              : 'You are on a 3-day streak!'}
          </p>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1 shrink-0">
          <Sparkles className="w-2.5 h-2.5" />
          <span>Active</span>
        </span>
      </div>
    </div>
  );
}
