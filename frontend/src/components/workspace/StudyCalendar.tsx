'use client';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { dateLabel } from './ui';
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
}
export default function StudyCalendar({
  events,
  onClose,
}: {
  events: CalendarEvent[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(),
    offset = month.getDay();
  const visible = events.filter((e) => {
    const date = new Date(e.date);
    return (
      date.getMonth() === month.getMonth() &&
      date.getFullYear() === month.getFullYear()
    );
  });
  return (
    <div className="ws-dialog-backdrop">
      <div className="ws-dialog" ref={ref}>
        <header>
          <div>
            <p className="ws-eyebrow">Study planner</p>
            <h2>Assignment & quiz calendar</h2>
          </div>
          <button
            className="ws-button ws-secondary"
            onClick={onClose}
            aria-label="Close study calendar"
          >
            <X size={18} />
          </button>
        </header>
        <div className="ws-toolbar">
          <button
            aria-label="Previous month"
            className="ws-button ws-secondary"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
          >
            <ChevronLeft size={16} />
          </button>
          <h3>
            {month.toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button
            aria-label="Next month"
            className="ws-button ws-secondary"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="ws-calendar" aria-label="Deadline calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <span className="ws-small ws-muted text-center mb-2" key={day}>
              {day}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={'offset' + i} />
          ))}
          {Array.from({ length: last }, (_, i) => {
            const items = visible.filter(
              (e) => new Date(e.date).getDate() === i + 1,
            );
            return (
              <div key={i} aria-label={`${i + 1}: ${items.length} deadlines`}>
                {i + 1}
                {items.length > 0 && <small>{items.length} due</small>}
              </div>
            );
          })}
        </div>
        <div className="ws-list mt-5">
          {visible.length ? (
            visible.map((e) => (
              <div className="ws-list-item" key={e.id}>
                <h3>{e.title}</h3>
                <span className="ws-small ws-muted">{dateLabel(e.date)}</span>
              </div>
            ))
          ) : (
            <p className="ws-note mt-4">
              No saved assignment or quiz deadlines this month.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
