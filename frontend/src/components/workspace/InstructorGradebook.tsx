'use client';
import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { apiError } from '@/lib/errors';
import {
  Panel,
  Badge,
  EmptyState,
  ErrorState,
  LoadingState,
  dateLabel,
} from './ui';
interface Submission {
  _id: string;
  student?: { name: string; email: string };
  content: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}
interface Assignment {
  _id: string;
  title: string;
  course?: { title: string };
  maxScore: number;
  dueDate?: string;
  submissions: Submission[];
}
function Grade({
  assignment,
  submission,
  onSaved,
}: {
  assignment: Assignment;
  submission: Submission;
  onSaved: () => void;
}) {
  const [score, setScore] = useState(submission.score?.toString() || ''),
    [feedback, setFeedback] = useState(submission.feedback || ''),
    [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.put(`/assignments/${assignment._id}/grade/${submission._id}`, {
        score: Number(score),
        feedback,
      });
      toast.success('Grade saved');
      onSaved();
    } catch (e) {
      toast.error(apiError(e, 'Could not save grade'));
    } finally {
      setSaving(false);
    }
  }
  return (
    <details className="ws-grade">
      <summary>
        <div>
          <strong>{submission.student?.name || 'Student'}</strong>
          <span className="ws-small ws-muted">
            {dateLabel(submission.submittedAt)}
          </span>
        </div>
        <Badge tone={submission.score !== undefined ? 'success' : 'warning'}>
          {submission.score !== undefined
            ? `${submission.score}/${assignment.maxScore}`
            : 'Needs review'}
        </Badge>
      </summary>
      <div className="ws-stack mt-5">
        <div>
          <h3>Student answer</h3>
          <p className="ws-description ws-muted mt-3">{submission.content}</p>
        </div>
        <form className="ws-form" onSubmit={save}>
          <div className="ws-grid">
            <label className="ws-field">
              Score for {submission.student?.name || 'student'} (out of{' '}
              {assignment.maxScore})
              <input
                className="ws-input"
                type="number"
                min={0}
                max={assignment.maxScore}
                step="0.5"
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </label>
            <label className="ws-field">
              Feedback
              <textarea
                className="ws-input"
                rows={2}
                maxLength={5000}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </label>
          </div>
          <button className="ws-button w-fit" disabled={saving || score === ''}>
            {saving ? 'Saving…' : 'Save grade'}
          </button>
        </form>
      </div>
    </details>
  );
}
export default function InstructorGradebook() {
  const { data, error, isLoading, mutate } = useSWR<{ data: Assignment[] }>(
    '/assignments/instructor/my',
  );
  if (isLoading) return <LoadingState label="Loading your gradebook…" />;
  if (error) return <ErrorState retry={() => void mutate()} />;
  return (
    <Panel
      title="Gradebook & submissions"
      description="Only your assignments and enrolled students. Open a submission to review or grade it."
    >
      {data?.data.length ? (
        <div className="ws-stack">
          {data.data.map((a) => (
            <section key={a._id}>
              <div className="ws-panel-heading">
                <div>
                  <h3>{a.title}</h3>
                  <p className="ws-small ws-muted">
                    {a.course?.title} · {dateLabel(a.dueDate)} · {a.maxScore}{' '}
                    points
                  </p>
                </div>
                <Badge>{a.submissions.length} submissions</Badge>
              </div>
              {a.submissions.length ? (
                a.submissions.map((s) => (
                  <Grade
                    key={s._id}
                    assignment={a}
                    submission={s}
                    onSaved={() => void mutate()}
                  />
                ))
              ) : (
                <p className="ws-note">No submissions received yet.</p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No assignments created yet"
          description="Open the assignment studio to create and review an assignment for one of your courses."
        />
      )}
    </Panel>
  );
}
