'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  Clock,
  Plus,
  BookOpen,
  Brain,
  Award,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const fetcher = (url: string) => api.get(url).then((r) => r.data);

interface Flashcard {
  id: string;
  front: string;
  back: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
}

const DEFAULT_CARDS: Flashcard[] = [
  {
    id: 'fc-1',
    front: 'What is the role of JWT Authorization headers in stateless authentication?',
    back: 'JWT (JSON Web Token) is sent in the "Authorization: Bearer <token>" header with every HTTP request. The backend verifies the cryptographic signature without querying session tables in the database.',
    subject: 'Web Development',
    difficulty: 'medium',
    nextReview: 'Today',
  },
  {
    id: 'fc-2',
    front: 'What is the main benefit of using Server Components in Next.js App Router?',
    back: 'Server Components execute exclusively on the server and stream pre-rendered HTML to the client, reducing bundle size to 0 KB JavaScript for that component.',
    subject: 'Web Development',
    difficulty: 'easy',
    nextReview: 'Tomorrow',
  },
  {
    id: 'fc-3',
    front: 'Why is Mongoose .populate() useful in relational document queries?',
    back: 'It automatically substitutes specified paths in the document with documents from other collections using ObjectIds (similar to an SQL JOIN).',
    subject: 'Database Systems',
    difficulty: 'medium',
    nextReview: 'In 2 days',
  },
  {
    id: 'fc-4',
    front: 'What is Overfitting in Machine Learning and how do you mitigate it?',
    back: 'Overfitting occurs when a model learns noise in training data instead of general patterns. Mitigate using Dropout, L1/L2 Regularization, Early Stopping, or more training data.',
    subject: 'AI & Machine Learning',
    difficulty: 'hard',
    nextReview: 'Today',
  },
];

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const { data: srsData } = useSWR('/ai/flashcards/due-count', fetcher);

  const filteredCards = cards.filter(
    (c) => filterSubject === 'all' || c.subject.toLowerCase() === filterSubject.toLowerCase()
  );

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleRate = (interval: string) => {
    setIsFlipped(false);
    setStudiedCount((prev) => prev + 1);
    toast.success(`Card reviewed! Scheduled for ${interval}`);
    handleNext();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 relative overflow-hidden bg-[#040714]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-indigo-500/20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-300/80 font-medium">
              <Link href="/dashboard/student" className="hover:text-teal-300 transition flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Student Cockpit</span>
              </Link>
              <span>/</span>
              <span className="text-white font-bold">Spaced Repetition Flashcards</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-teal-500 to-indigo-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/25">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span>Cosmic Flashcards (SRS Engine)</span>
            </h1>
            <p className="text-xs text-indigo-200/80">
              Active recall system powered by spaced repetition memory curves.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              {studiedCount} Reviewed Today
            </span>
          </div>
        </div>

        {/* Card Arena */}
        {filteredCards.length > 0 && currentCard ? (
          <div className="space-y-5">
            {/* Card Progress */}
            <div className="flex items-center justify-between text-xs text-indigo-200">
              <span className="font-semibold">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-cyan-300 font-bold text-[10px]">
                {currentCard.subject}
              </span>
            </div>

            {/* Flip Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative min-h-[300px] sm:min-h-[340px] rounded-3xl p-6 sm:p-10 border border-indigo-500/30 bg-[#070b22]/95 hover:border-teal-400/50 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  {isFlipped ? 'Answer & Explanation' : 'Concept Question (Click to Reveal)'}
                </span>
                <span className="text-[10px] text-indigo-300/70 flex items-center gap-1">
                  <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                  <span>Flip</span>
                </span>
              </div>

              <div className="my-auto py-4 text-center">
                <h3 className="text-base sm:text-xl font-bold text-white leading-relaxed max-w-xl mx-auto">
                  {isFlipped ? currentCard.back : currentCard.front}
                </h3>
              </div>

              <div className="pt-3 border-t border-indigo-500/15 flex items-center justify-between text-[11px] text-indigo-300/70">
                <span>Next SRS Review: {currentCard.nextReview}</span>
                <span className="text-teal-300 font-semibold">Tap to flip card</span>
              </div>
            </div>

            {/* SRS Rating Actions (Visible on flip) */}
            {isFlipped && (
              <div className="flex items-center justify-center gap-3 animate-in fade-in duration-200">
                <button
                  onClick={() => handleRate('1 day')}
                  className="px-4 py-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 font-bold text-xs transition cursor-pointer"
                >
                  Hard (1 day)
                </button>
                <button
                  onClick={() => handleRate('3 days')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs transition cursor-pointer"
                >
                  Good (3 days)
                </button>
                <button
                  onClick={() => handleRate('7 days')}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs transition cursor-pointer"
                >
                  Easy (7 days)
                </button>
              </div>
            )}

            {/* Prev / Next Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl glow-btn-teal font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Card</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-3 glass-card rounded-3xl p-8 border border-indigo-500/20">
            <p className="text-sm font-bold text-white">All flashcards caught up for today!</p>
          </div>
        )}
      </div>
    </div>
  );
}
