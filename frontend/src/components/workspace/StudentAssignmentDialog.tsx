'use client';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import { X, Send, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { apiError } from '@/lib/errors';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { dateLabel, LoadingState, ErrorState, Badge } from './ui';
interface Submission {
  content: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}
interface Assignment {
  _id: string;
  title: string;
  description: string;
  rubric?: string;
  dueDate?: string;
  maxScore: number;
  submissions: Submission[];
}
export default function StudentAssignmentDialog({
  id,
  onClose,
  onSubmitted,
}: {
  id: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  const { data, error, isLoading, mutate } = useSWR<{ data: Assignment }>(
    `/assignments/${id}`,
  );
  const [answer, setAnswer] = useState(''),
    [sending, setSending] = useState(false);
  const assignment = data?.data,
    submission = assignment?.submissions?.[0],
    late = assignment?.dueDate && new Date(assignment.dueDate) < new Date();
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    try {
      await api.post(`/assignments/${id}/submit`, { content: answer });
      await mutate();
      onSubmitted();
      toast.success('Assignment submitted. Your instructor can review it.');
    } catch (e) {
      toast.error(apiError(e, 'Could not submit assignment'));
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="ws-dialog-backdrop">
      <div ref={ref} className="ws-dialog">
        <header>
          <div>
            <p className="ws-eyebrow">Course assignment</p>
            <h2>{assignment?.title || 'Assignment details'}</h2>
          </div>
          <button
            aria-label="Close assignment"
            onClick={onClose}
            className="ws-button ws-secondary"
          >
            <X size={18} />
          </button>
        </header>
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState retry={() => void mutate()} />
        ) : (
          assignment && (
            <div className="ws-stack">
              <div className="ws-actions">
                <Badge tone={late ? 'warning' : 'neutral'}>
                  Due: {dateLabel(assignment.dueDate)}
                </Badge>
                <Badge>{assignment.maxScore} points</Badge>
              </div>
              <p className="ws-description">{assignment.description}</p>
              {assignment.rubric && (
                <div>
                  <h3>Grading criteria</h3>
                  <p className="ws-description ws-muted">{assignment.rubric}</p>
                </div>
              )}
              {submission ? (
                <section className="ws-note">
                  <h3>
                    {submission.score !== undefined
                      ? `Your score: ${submission.score}/${assignment.maxScore}`
                      : 'Submitted · awaiting review'}
                  </h3>
                  <p className="ws-description">{submission.content}</p>
                  {submission.feedback && (
                    <p className="ws-description">
                      Feedback: {submission.feedback}
                    </p>
                  )}
                </section>
              ) : late ? (
                <p role="status" className="ws-note">
                  The submission deadline has passed. Contact your instructor.
                </p>
              ) : (
                <form className="ws-form" onSubmit={submit}>
                  <label className="ws-field">
                    Your answer
                    <textarea
                      className="ws-input"
                      rows={7}
                      required
                      maxLength={20000}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your answer or include a link to your work."
                    />
                  </label>
                  <div className="ws-actions">
                    <button
                      className="ws-button"
                      disabled={sending || !answer.trim()}
                    >
                      <Send size={16} />
                      {sending ? 'Submitting…' : 'Submit assignment'}
                    </button>
                    <span className="ws-small ws-muted">
                      <FileText size={13} className="inline mr-1" />
                      Your submission is private.
                    </span>
                  </div>
                </form>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
