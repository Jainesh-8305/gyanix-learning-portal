'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Heart, Sparkles, Rocket, RefreshCw } from 'lucide-react';

interface MotivationalQuoteCardProps {
  userName?: string;
  imageSrc?: string;
  className?: string;
}

const CATALYST_QUOTES = [
  'The best version of you is still in progress...',
  'Small daily steps lead to massive cosmic leaps.',
  'Curiosity is the engine of intellectual mastery.',
  'Every expert was once a beginner who did not quit.',
  'Knowledge expands to fill the horizons of your wonder.',
  'Stay patient, stay persistent, your future self is watching.',
];

export default function MotivationalQuoteCard({
  userName = 'Scholar',
  imageSrc = '/images/gyanix_cosmic_earth_banner.jpg',
  className = '',
}: MotivationalQuoteCardProps) {
  const [liked, setLiked] = useState(false);
  const [cheerCount, setCheerCount] = useState(42);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLiked = localStorage.getItem('gyanix_catalyst_liked');
        const savedCount = localStorage.getItem('gyanix_catalyst_cheer_count');
        if (savedLiked === 'true') setLiked(true);
        if (savedCount) setCheerCount(parseInt(savedCount, 10));
      } catch {}
    }
  }, []);

  const handleCheer = () => {
    let newLiked = !liked;
    let newCount = cheerCount;
    if (newLiked) {
      newCount = cheerCount + 1;
    } else {
      newCount = Math.max(0, cheerCount - 1);
    }
    setLiked(newLiked);
    setCheerCount(newCount);
    setShowToast(true);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('gyanix_catalyst_liked', String(newLiked));
        localStorage.setItem('gyanix_catalyst_cheer_count', String(newCount));
      } catch {}
    }

    setTimeout(() => setShowToast(false), 2200);
  };

  const nextQuote = () => {
    setIsRotating(true);
    setQuoteIndex((prev) => (prev + 1) % CATALYST_QUOTES.length);
    setTimeout(() => setIsRotating(false), 400);
  };

  return (
    <div
      className={`glass-card rounded-3xl relative overflow-hidden border border-indigo-500/25 flex flex-col justify-between p-4 sm:p-4.5 min-h-[260px] sm:min-h-[280px] h-full flex-1 shadow-xl group transition-all duration-300 hover:border-indigo-400/50 ${className}`}
    >
      {/* ── Background Cosmic Art with Optimized Glass Darkening ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src={imageSrc}
          alt="Cosmic Study Inspiration"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 360px"
          className="object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-700 ease-out opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/90 via-[#060a22]/55 to-[#030712]/95" />
      </div>

      {/* ── Top Header ── */}
      <div className="relative z-10 flex items-center justify-between text-xs text-indigo-200/80">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white tracking-wide">
          <Sparkles className="w-3 h-3 text-teal-300 animate-pulse" />
          <span>Daily Catalyst</span>
        </span>
        <button
          onClick={nextQuote}
          title="Inspire me with another cosmic quote"
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/15 text-indigo-200 hover:text-white text-[10px] font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-2.5 h-2.5 text-cyan-300 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Inspire Me</span>
        </button>
      </div>

      {/* ── Center Quote & Heart ── */}
      <div className="relative z-10 my-auto py-2 text-center space-y-2.5">
        <h3 className={`font-cursive text-xl sm:text-2xl text-white font-bold leading-snug tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] max-w-[260px] mx-auto select-none transition-all duration-300 ${isRotating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          {CATALYST_QUOTES[quoteIndex]}
        </h3>

        <div className="flex flex-col items-center justify-center gap-1">
          <button
            onClick={handleCheer}
            aria-label="Give a spark of motivation"
            className="group/heart relative p-2 rounded-full bg-white/5 hover:bg-pink-500/15 border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 cursor-pointer active:scale-90"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                liked
                  ? 'fill-pink-500 text-pink-400 scale-125 drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]'
                  : 'text-pink-300/80 group-hover/heart:text-pink-300 group-hover/heart:scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]'
              }`}
            />
          </button>
          <span className="text-[10px] font-medium text-pink-200/70">
            {cheerCount} Scholars Inspired
          </span>

          {showToast && (
            <div className="text-[10px] font-bold text-teal-300 bg-teal-500/20 border border-teal-400/40 px-2.5 py-0.5 rounded-full animate-in fade-in zoom-in duration-150">
              {liked ? '✨ Cosmic Spark Ignited!' : 'Spark saved'}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Personalised Sign-off ── */}
      <div className="relative z-10 pt-2 border-t border-white/10 text-center space-y-0.5">
        <p className="text-xs font-bold text-white tracking-wide flex items-center justify-center gap-1.5">
          <span>&ldquo;Keep going, {userName}&rdquo;</span>
          <Rocket className="w-3.5 h-3.5 text-cyan-300 inline-block animate-bounce" />
        </p>
        <p className="text-[10px] font-semibold text-teal-300/90 tracking-wider">
          — Gyanix Academy
        </p>
      </div>
    </div>
  );
}
