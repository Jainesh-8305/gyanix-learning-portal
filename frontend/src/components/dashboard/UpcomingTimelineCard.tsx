'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Video,
  BookOpen,
  FileCheck2,
  Brain,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'live' | 'lecture' | 'assignment' | 'quiz';
  tag?: string;
  tagColor?: string;
  link: string;
}

interface UpcomingTimelineCardProps {
  events?: TimelineEvent[];
  className?: string;
}

const defaultEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    title: 'Web Development',
    subtitle: 'Live Class',
    time: '10:00 AM - 11:00 AM',
    type: 'live',
    link: '/courses',
  },
  {
    id: 'evt-2',
    title: 'Machine Learning',
    subtitle: 'Lecture',
    time: '02:00 PM - 03:00 PM',
    type: 'lecture',
    link: '/courses',
  },
  {
    id: 'evt-3',
    title: 'Assignment Submission',
    subtitle: 'Faculty Module Assessment',
    tag: 'Due Soon',
    tagColor: 'text-amber-300 bg-amber-500/20 border-amber-500/40',
    time: 'Tomorrow, 11:59 PM',
    type: 'assignment',
    link: '/dashboard/student',
  },
  {
    id: 'evt-4',
    title: 'Quiz - React Basics',
    subtitle: 'Interactive Recall Check',
    time: '15 Oct, 10:00 AM',
    type: 'quiz',
    link: '/dashboard/student/revision-quiz',
  },
];

export default function UpcomingTimelineCard({
  events = defaultEvents,
  className = '',
}: UpcomingTimelineCardProps) {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const getTypeIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'live':
        return <Video className="w-3.5 h-3.5 text-purple-300" />;
      case 'lecture':
        return <BookOpen className="w-3.5 h-3.5 text-cyan-300" />;
      case 'assignment':
        return <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />;
      case 'quiz':
        return <Brain className="w-3.5 h-3.5 text-indigo-300" />;
    }
  };

  const getTypeStyle = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'live':
        return 'bg-gradient-to-br from-purple-500/30 to-indigo-600/30 border-purple-400/40 shadow-purple-500/20';
      case 'lecture':
        return 'bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-cyan-400/40 shadow-cyan-500/20';
      case 'assignment':
        return 'bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-amber-400/40 shadow-amber-500/20';
      case 'quiz':
        return 'bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border-indigo-400/40 shadow-indigo-500/20';
    }
  };

  return (
    <div
      className={`glass-card rounded-3xl p-4 sm:p-5 border border-indigo-500/25 bg-[#080c22]/90 space-y-3 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-indigo-400/50 ${className}`}
    >
      {/* ── Top Header ── */}
      <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/15">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/15 text-indigo-300 flex items-center justify-center border border-indigo-500/30">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-300" />
          </div>
          <h3 className="text-sm font-extrabold text-white tracking-tight">
            Upcoming
          </h3>
        </div>

        <Link
          href="/courses"
          className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5 cursor-pointer"
        >
          <span>View All</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Vertical Glowing Timeline (Compact Spacing) ── */}
      <div className="relative pl-5 sm:pl-6 space-y-3 pt-0.5">
        <div className="absolute left-[10px] sm:left-[12px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-purple-500 via-cyan-400 to-indigo-500 rounded-full opacity-60" />

        {events.slice(0, 4).map((event) => (
          <div
            key={event.id}
            onClick={() => setSelectedEvent(event)}
            className="relative flex items-start gap-2.5 group cursor-pointer"
          >
            {/* Timeline Milestone Dot */}
            <div className="absolute -left-[16px] sm:-left-[18px] top-2 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-cyan-400 group-hover:scale-125 group-hover:border-white transition-all shadow-[0_0_6px_rgba(0,245,212,0.8)]" />

            {/* Event Icon Tile */}
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shadow-sm shrink-0 transition-transform group-hover:scale-105 ${getTypeStyle(
                event.type
              )}`}
            >
              {getTypeIcon(event.type)}
            </div>

            {/* Event Details */}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-1.5">
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                  {event.title}
                </h4>

                {event.tag && (
                  <span
                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full border shrink-0 ${event.tagColor}`}
                  >
                    {event.tag}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] font-medium text-indigo-300/80">
                <Clock className="w-2.5 h-2.5 text-indigo-400" />
                <span className="truncate">{event.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Event Quick Drawer */}
      {selectedEvent && (
        <div className="p-2.5 rounded-xl bg-white/5 border border-cyan-400/30 flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="space-y-0.5 min-w-0">
            <p className="text-[11px] font-bold text-white truncate">{selectedEvent.title}</p>
            <p className="text-[10px] text-indigo-200/70">{selectedEvent.time}</p>
          </div>
          <Link
            href={selectedEvent.link}
            className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[10px] transition shadow-sm shrink-0"
          >
            Launch →
          </Link>
        </div>
      )}
    </div>
  );
}
