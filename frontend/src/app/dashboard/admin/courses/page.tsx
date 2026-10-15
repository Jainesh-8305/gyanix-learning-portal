'use client';
import { useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { useSWRConfig } from 'swr';
import {
  Check,
  X,
  Eye,
  Archive,
  MessageSquare,
  Search,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { apiError } from '@/lib/errors';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  PageHeading,
  Panel,
  Badge,
  EmptyState,
  LoadingState,
  ErrorState,
  dateLabel,
} from '@/components/workspace/ui';
interface Course {
  _id: string;
  title: string;
  category: string;
  status: string;
  totalLessons: number;
  totalStudents: number;
  instructor?: { name: string; email: string };
  adminFeedback?: string;
  createdAt: string;
}
function Decision({
  course,
  onClose,
  onSaved,
}: {
  course: Course;
  onClose: () => void;
  onSaved: () => void;
}) {
  const ref = useRef<HTMLFormElement>(null);
  useDialogFocus(ref, onClose);
  const [feedback, setFeedback] = useState(''),
    [status, setStatus] = useState('rejected'),
    [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post(`/admin/courses/${course._id}/request-changes`, {
        feedback,
        status,
      });
      toast.success('Review feedback saved');
      onSaved();
      onClose();
    } catch (e) {
      toast.error(apiError(e, 'Could not save review'));
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="ws-dialog-backdrop">
      <form ref={ref} className="ws-dialog" onSubmit={submit}>
        <header>
          <div>
            <p className="ws-eyebrow">Course review</p>
            <h2>Request instructor changes</h2>
          </div>
          <button
            type="button"
            className="ws-button ws-secondary"
            onClick={onClose}
            aria-label="Close review dialog"
          >
            <X size={17} />
          </button>
        </header>
        <div className="ws-form">
          <p className="ws-note">{course.title}</p>
          <label className="ws-field">
            Instructions for the instructor
            <textarea
              className="ws-input"
              rows={5}
              required
              minLength={3}
              maxLength={5000}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe what needs to change before this course is ready."
            />
          </label>
          <label className="ws-field">
            Course status
            <select
              className="ws-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="rejected">Changes requested</option>
              <option value="draft">Return to draft</option>
              <option value="hidden">Hide from students</option>
            </select>
          </label>
          <div className="ws-actions">
            <button className="ws-button" disabled={saving}>
              {saving ? 'Saving…' : 'Send review feedback'}
            </button>
            <button
              type="button"
              className="ws-button ws-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
export default function CourseGovernance() {
  const params = useSearchParams(),
    filter = params.get('status') || 'all';
  const [search, setSearch] = useState(''),
    [decision, setDecision] = useState<Course>(),
    [busy, setBusy] = useState('');
  const settled = useDebouncedValue(search),
    { mutate: refresh } = useSWRConfig();
  const query = new URLSearchParams({
    status: filter,
    ...(settled ? { search: settled } : {}),
  }).toString();
  const { data, error, isLoading, mutate } = useSWR<{ data: Course[] }>(
    '/admin/courses?' + query,
  );
  const filters = [
    ['all', 'All courses'],
    ['pending', 'Pending review'],
    ['published', 'Published'],
    ['draft', 'Drafts'],
    ['hidden', 'Hidden'],
    ['rejected', 'Changes requested'],
    ['archived', 'Archived'],
  ];
  async function action(course: Course, status: string) {
    setBusy(course._id);
    try {
      if (status === 'archived')
        await api.delete('/admin/courses/' + course._id);
      else await api.put(`/admin/courses/${course._id}/status`, { status });
      await Promise.all([mutate(), refresh('/admin/dashboard')]);
      toast.success(
        status === 'published'
          ? 'Course published'
          : status === 'archived'
            ? 'Course archived; learning records retained'
            : 'Course visibility updated',
      );
    } catch (e) {
      toast.error(apiError(e, 'Could not update course'));
    } finally {
      setBusy('');
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="Administration"
        title="Course governance"
        description="Review curricula, manage publication and give instructors clear feedback."
      />
      <Panel
        title="Course directory"
        description="All enrollments are free. Access still follows publication and enrollment permissions."
      >
        <nav aria-label="Course status filters" className="ws-filter-tabs">
          {filters.map(([value, label]) => (
            <Link
              className={filter === value ? 'ws-filter-active' : ''}
              aria-current={filter === value ? 'page' : undefined}
              key={value}
              href={`/dashboard/admin/courses${value === 'all' ? '' : '?status=' + value}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <label className="ws-field mb-6">
          <span className="sr-only">Search course directory</span>
          <span className="flex items-center gap-2">
            <Search size={17} />
            <input
              className="ws-input"
              placeholder="Search title or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              maxLength={100}
            />
          </span>
        </label>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState retry={() => void mutate()} />
        ) : data?.data.length ? (
          <div className="ws-stack">
            {data.data.map((c) => (
              <article key={c._id} className="ws-governance-course">
                <header>
                  <div>
                    <div className="ws-actions mb-3">
                      <Badge
                        tone={
                          c.status === 'published'
                            ? 'success'
                            : c.status === 'pending'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className="ws-small ws-muted">{c.category}</span>
                    </div>
                    <h3>{c.title}</h3>
                    <p className="ws-small ws-muted mt-2">
                      {c.instructor?.name || 'Instructor'} ·{' '}
                      {c.totalLessons || 0} lessons · {c.totalStudents}{' '}
                      enrollments · {dateLabel(c.createdAt)}
                    </p>
                  </div>
                  <Link
                    className="ws-button ws-secondary"
                    href={`/courses/${c._id}`}
                  >
                    <Eye size={15} />
                    Preview
                  </Link>
                </header>
                {c.adminFeedback && (
                  <p className="ws-note mt-4">
                    Review feedback: {c.adminFeedback}
                  </p>
                )}
                <div className="ws-actions mt-5">
                  {c.status !== 'published' && c.status !== 'archived' && (
                    <button
                      className="ws-button"
                      disabled={busy === c._id}
                      onClick={() => void action(c, 'published')}
                    >
                      <Check size={15} />
                      Publish course
                    </button>
                  )}
                  {c.status === 'published' && (
                    <button
                      className="ws-button ws-secondary"
                      disabled={busy === c._id}
                      onClick={() => void action(c, 'hidden')}
                    >
                      <Eye size={15} />
                      Hide course
                    </button>
                  )}
                  <button
                    className="ws-button ws-secondary"
                    onClick={() => setDecision(c)}
                    disabled={busy === c._id}
                  >
                    <MessageSquare size={15} />
                    Request edits
                  </button>
                  {c.status !== 'archived' && (
                    <button
                      className="ws-link"
                      disabled={busy === c._id}
                      onClick={() => void action(c, 'archived')}
                    >
                      <Archive size={14} />
                      Archive
                    </button>
                  )}
                  {busy === c._id && (
                    <span role="status" className="ws-small ws-muted">
                      Saving…
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No courses found"
            description="Try a different status filter or search."
          />
        )}
      </Panel>
      {decision && (
        <Decision
          course={decision}
          onClose={() => setDecision(undefined)}
          onSaved={() => {
            void mutate();
            void refresh('/admin/dashboard');
          }}
        />
      )}
      <Link className="ws-link mt-6" href="/dashboard/admin">
        Back to overview
        <ArrowRight size={14} />
      </Link>
    </>
  );
}
