'use client';

import { useId } from 'react';
import { BookOpen, FileText, Brain, Award } from 'lucide-react';

interface DetailedProgressCardProps {
  overallPct?: number;
  completedUnits?: number;
  totalUnits?: number;
  coursesPct?: number;
  assignmentsPct?: number;
  quizzesPct?: number;
  certificatesPct?: number;
  className?: string;
}

export default function DetailedProgressCard({
  overallPct = 68,
  completedUnits = 24,
  totalUnits = 35,
  coursesPct = 68,
  assignmentsPct = 72,
  quizzesPct = 58,
  certificatesPct = 46,
  className = '',
}: DetailedProgressCardProps) {
  const gradId = useId();
  const r = 30;
  const circ = 2 * Math.PI * r;
  const strokeOffset = circ - (overallPct / 100) * circ;

  const categories = [
    {
      label: 'Courses',
      pct: coursesPct,
      icon: BookOpen,
      iconBg: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
    },
    {
      label: 'Assignments',
      pct: assignmentsPct,
      icon: FileText,
      iconBg: 'bg-cyan-600/20 text-cyan-300 border-cyan-500/30',
    },
    {
      label: 'Quizzes',
      pct: quizzesPct,
      icon: Brain,
      iconBg: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
    },
    {
      label: 'Certificates',
      pct: certificatesPct,
      icon: Award,
      iconBg: 'bg-violet-600/20 text-violet-300 border-violet-500/30',
    },
  ];

  return (
    <div
      className={`glass-card rounded-3xl p-4 sm:p-4.5 border border-cyan-500/25 bg-[#060a22]/90 space-y-3 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-cyan-400/50 ${className}`}
    >
      {/* ── Top Card Header ── */}
      <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
        Your Progress
      </h3>

      {/* ── Overall Progress Feature Box (Compact) ── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-2">
        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
          Overall Progress
        </h4>

        <div className="flex items-center gap-3.5">
          {/* Circular Progress Ring */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg
              width="68"
              height="68"
              viewBox="0 0 80 80"
              className="-rotate-90"
            >
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
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-white tracking-tight">
                {overallPct}%
              </span>
            </div>
          </div>

          {/* Metric Details & Horizontal Progress Bar */}
          <div className="flex-1 space-y-1.5 min-w-0">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Overall Completion</span>
              <span className="text-[11px] text-cyan-300 font-mono">
                {completedUnits}/{totalUnits} Courses
              </span>
            </div>

            {/* Glowing horizontal progress bar */}
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden p-0.5 border border-cyan-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_rgba(0,245,212,0.8)] transition-all duration-700 ease-out"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 4 Categorized Metric Rows (Compact) ── */}
      <div className="space-y-2 pt-0.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div key={cat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center border shadow-sm ${cat.iconBg}`}
                  >
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-white text-xs">
                    {cat.label}
                  </span>
                </div>
                <span className="font-bold text-cyan-300 text-xs">
                  {cat.pct}%
                </span>
              </div>

              {/* Individual Glowing Horizontal Bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden ml-7 pr-7">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.6)] transition-all duration-700 ease-out"
                  style={{ width: `${cat.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
