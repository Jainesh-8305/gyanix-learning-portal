'use client';
import { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  Award,
  ShieldCheck,
  Layers,
  MessageCircle,
  Users,
  Library,
  CircleHelp,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Panel, Badge } from '@/components/workspace/ui';
const Guide = dynamic(() => import('@/components/guide/PlatformGuideModal'));
const content = {
  student: [
    [
      'Courses that move with you',
      'Enroll in a published course for free. Watch lectures, save progress and find your next lesson.',
      BookOpen,
    ],
    [
      'Tools for better practice',
      'Save private notes, practise quizzes and follow your spaced-repetition flashcard schedule.',
      Layers,
    ],
    [
      'Work you can track',
      'Submit assignments, read your own feedback and earn project completion certificates after passing assessments.',
      Award,
    ],
  ],
  instructor: [
    [
      'A focused teaching workspace',
      'Create curricula, preserve lesson media and submit complete courses for administrator review.',
      BookOpen,
    ],
    [
      'Assignments & assessment',
      'Draft classroom work, review generated questions and manually grade student submissions.',
      ClipboardList,
    ],
    [
      'Your classroom, organised',
      'Find your enrolled students, share course codes and curate books, videos and official documentation.',
      Users,
    ],
  ],
  assistant: [
    [
      'Grounded in the portal',
      'Reviewed help articles and authorized summaries provide context for website questions.',
      Library,
    ],
    [
      'Private by design',
      'Permissions are checked on the server before retrieval. Conversations are private to an account and role.',
      ShieldCheck,
    ],
    [
      'A conversation in your language',
      'Use the floating assistant with a configured LLM. Hindi, Gujarati, English and other languages are supported; unavailable AI is labelled honestly.',
      MessageCircle,
    ],
  ],
} as const;
export default function HomePage() {
  const [tab, setTab] = useState<keyof typeof content>('student'),
    [guide, setGuide] = useState(false),
    [question, setQuestion] = useState(
      'Explain how the virtual DOM helps React update a page.',
    ),
    [answer, setAnswer] = useState(
      'React compares the updated representation with the previous one and applies the necessary changes to the actual DOM.',
    );
  const user = useAuthStore((s) => s.user);
  return (
    <div className="public-home">
      <section className="public-hero">
        <Badge tone="success">Free learning · clear workspaces</Badge>
        <h1>
          Your learning.
          <br />
          <span>Clearly organised.</span>
        </h1>
        <p>
          Courses, classroom work and useful study tools in one place. A focused
          portal for students, instructors and the people supporting them.
        </p>
        <div className="ws-actions">
          <Link
            className="ws-button"
            href={user ? `/dashboard/${user.role}` : '/register'}
          >
            {user ? 'Open your workspace' : 'Get started'}
            <ArrowRight size={16} />
          </Link>
          <Link className="ws-button ws-secondary" href="/courses">
            <BookOpen size={17} />
            Explore free courses
          </Link>
          <button className="ws-link" onClick={() => setGuide(true)}>
            <CircleHelp size={17} />
            How it works
          </button>
        </div>
      </section>
      <div className="public-rule" />
      <section className="ws-stack">
        <div className="public-section-heading">
          <div>
            <p className="ws-eyebrow">Made for your role</p>
            <h2>One portal. A clear place for every task.</h2>
          </div>
          <div
            className="ws-filter-tabs"
            role="tablist"
            aria-label="Explore portal features"
          >
            {(
              [
                ['student', 'For students'],
                ['instructor', 'For instructors'],
                ['assistant', 'AI & privacy'],
              ] as const
            ).map(([value, label]) => (
              <button
                role="tab"
                aria-selected={tab === value}
                aria-controls="home-features"
                id={'tab-' + value}
                key={value}
                className={tab === value ? 'ws-filter-active' : ''}
                onClick={() => setTab(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          id="home-features"
          role="tabpanel"
          aria-labelledby={'tab-' + tab}
          className="public-feature-grid"
        >
          {content[tab].map(([title, description, Icon]) => (
            <Panel key={title}>
              <span className="ws-tool-icon inline-flex mb-5">
                <Icon size={23} />
              </span>
              <h3>{title}</h3>
              <p className="ws-description ws-muted mt-3">{description}</p>
            </Panel>
          ))}
        </div>
        <p className="ws-note">
          All published courses are free. Course access, assessment attempts and
          private learning records are protected by backend permissions. The
          assistant is a helper, not an administrator.
        </p>
      </section>
      <section className="public-bottom">
        <Panel
          title="Learning support, with clear expectations"
          description="Live model generation is optional. Your courses, private notes, flashcards and manual grading remain available."
        >
          <p className="ws-description ws-muted">
            AI-generated drafts need review. Without an available LLM, help
            articles and offline study templates are clearly identified.
            Course-completion certificates are issued by this project and are
            not external academic accreditation.
          </p>
          <details className="ws-grade mt-6">
            <summary>
              <strong>View an illustrative grading example</strong>
              <Brain size={16} />
            </summary>
            <div className="ws-form mt-5">
              <p className="ws-note">
                Illustration only: the sample score below is fixed and does not
                evaluate the text you enter. Instructor grading uses saved
                submissions and an optional live model.
              </p>
              <label className="ws-field">
                Sample question
                <input
                  className="ws-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </label>
              <label className="ws-field">
                Example answer
                <textarea
                  className="ws-input"
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </label>
              <Badge>Illustrative sample: 96 / 100</Badge>
            </div>
          </details>
        </Panel>
      </section>
      <footer className="public-footer">
        <span>Gyanix Academy · College learning portal</span>
        <Link className="ws-link" href="/courses">
          Browse published courses
          <ArrowRight size={14} />
        </Link>
      </footer>
      {guide && <Guide onClose={() => setGuide(false)} />}
    </div>
  );
}
