'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { useDialogFocus } from '@/hooks/useDialogFocus';
export default function PlatformGuideModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useDialogFocus(ref, onClose);
  return (
    <div className="ws-dialog-backdrop">
      <div ref={ref} className="ws-dialog">
        <header>
          <div>
            <p className="ws-eyebrow">Learning, organised</p>
            <h2>Welcome to Gyanix</h2>
          </div>
          <button
            aria-label="Close platform guide"
            className="ws-button ws-secondary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <div className="ws-stack">
          <p className="ws-description">
            Students enroll in published courses for free, watch lectures,
            submit assignments and take server-scored assessments. Completed
            course assessments can earn project course-completion certificates.
          </p>
          <p className="ws-description">
            Instructors create and review curricula, manage classroom quizzes,
            grade assignments and share resources. Administrators control
            publication and account access.
          </p>
          <p className="ws-description">
            Notes and spaced-repetition flashcards are private to your account.
            Use the small chat icon in the corner for help in your language. The
            assistant retrieves role-filtered help articles and authorized
            summaries. A configured LLM enables natural conversation; otherwise
            it clearly shows retrieved help.
          </p>
          <p className="ws-note">
            Review AI-generated study content. Offline templates are generic.
            Video notes require a pasted transcript or text-based PDF. The
            assistant cannot change permissions or access another account’s
            private data.
          </p>
          <div className="ws-actions">
            <Link href="/help" className="ws-button" onClick={onClose}>
              Read the help centre
              <ArrowRight size={16} />
            </Link>
            <button className="ws-button ws-secondary" onClick={onClose}>
              Start exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
