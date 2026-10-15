'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import api from '@/lib/api';
import toast from 'react-hot-toast';
interface Card {
  _id: string;
  front: string;
  back: string;
  subject: string;
  dueAt: string;
  interval: number;
}
export default function FlashcardsPage() {
  const { data, mutate } = useSWR('/ai/flashcards');
  const { data: stats, mutate: refreshStats } = useSWR(
    '/ai/flashcards/due-count',
  );
  const cards: Card[] = data?.data || [];
  const [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false),
    [saving, setSaving] = useState(false);
  const [front, setFront] = useState(''),
    [back, setBack] = useState(''),
    [subject, setSubject] = useState('General');
  const card = cards[index % Math.max(cards.length, 1)];
  const next = () => {
    setIndex((i) => (i + 1) % Math.max(cards.length, 1));
    setFlipped(false);
  };
  const rate = async (quality: number) => {
    if (!card || saving) return;
    setSaving(true);
    try {
      const r = await api.post(`/ai/flashcards/${card._id}/review`, {
        quality,
      });
      await Promise.all([mutate(), refreshStats()]);
      toast.success(
        `Review saved. Next review: ${new Date(r.data.data.dueAt).toLocaleDateString()}`,
      );
      next();
    } catch {
      toast.error('Could not save review');
    } finally {
      setSaving(false);
    }
  };
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement)?.closest('input,textarea,select'))
        return;
      if (
        event.code === 'Space' &&
        !(event.target as HTMLElement)?.closest('button,a')
      ) {
        event.preventDefault();
        setFlipped((f) => !f);
      }
      if (flipped && ['1', '2', '3', '4'].includes(event.key)) {
        event.preventDefault();
        void rate([1, 3, 4, 5][Number(event.key) - 1]);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  async function add(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post('/ai/flashcards', { front, back, subject });
      setFront('');
      setBack('');
      await Promise.all([mutate(), refreshStats()]);
    } catch {
      toast.error('Could not create card');
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-8 text-white space-y-6">
      <Link href="/dashboard/student" className="text-teal-300">
        Student dashboard
      </Link>
      <h1 className="text-2xl font-bold">Cosmic Flashcards (SRS Engine)</h1>
      <p>
        SuperMemo-2 reviews saved to your account. Space flips; 1-4 rate a
        revealed card.
      </p>
      <p>
        {stats?.data?.reviewedToday || 0} Reviewed Today ·{' '}
        {stats?.data?.dueCount || 0} due · {cards.length} cards
      </p>
      {card ? (
        <section className="space-y-4">
          <p>
            Card {(index % cards.length) + 1} of {cards.length} · {card.subject}{' '}
            · Next review: {new Date(card.dueAt).toLocaleDateString()}
          </p>
          <button
            type="button"
            aria-label={flipped ? 'Show question' : 'Reveal answer'}
            aria-pressed={flipped}
            onClick={() => setFlipped((f) => !f)}
            className="min-h-64 w-full p-8 rounded-3xl border border-indigo-400 bg-[#0c0f24] text-xl"
          >
            {flipped ? card.back : card.front}
          </button>
          {flipped && (
            <div className="flex gap-2 flex-wrap">
              {[
                ['Again', 1],
                ['Hard', 3],
                ['Good', 4],
                ['Easy', 5],
              ].map(([label, q]) => (
                <button
                  key={label}
                  disabled={saving}
                  onClick={() => void rate(Number(q))}
                  className="p-3 rounded-xl bg-indigo-700"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <button onClick={next} className="p-3 rounded-xl bg-teal-800">
            Next Card
          </button>
        </section>
      ) : (
        <p>No flashcards yet. Create your first card below.</p>
      )}
      <form onSubmit={add} className="glass-card p-6 rounded-2xl space-y-3">
        <h2 className="text-xl">Create a flashcard</h2>
        <label className="block">
          Question
          <input
            required
            maxLength={2000}
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="block w-full glass-input p-3"
          />
        </label>
        <label className="block">
          Answer
          <textarea
            required
            maxLength={10000}
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="block w-full glass-input p-3"
          />
        </label>
        <label className="block">
          Subject
          <input
            required
            maxLength={100}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="block w-full glass-input p-3"
          />
        </label>
        <button disabled={saving} className="glow-btn-teal p-3 rounded-xl">
          Create Card
        </button>
      </form>
    </main>
  );
}
