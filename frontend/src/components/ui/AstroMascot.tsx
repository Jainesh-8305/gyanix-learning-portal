'use client';

interface MascotProps {
  role?: 'student' | 'instructor' | 'admin' | 'auth';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AstroMascot({ role = 'student', className = 'w-32 h-32' }: MascotProps) {
  if (role === 'instructor') {
    return (
      <div className={`relative flex items-center justify-center group ${className}`}>
        {/* Holographic Orbit Ring */}
        <div className="absolute -inset-4 rounded-full border border-teal-500/20 border-dashed animate-spin-slow pointer-events-none" />
        <div className="absolute -inset-1 rounded-full border border-indigo-500/30 animate-pulse pointer-events-none" />

        {/* Orbiting Moon Satellite */}
        <div className="absolute w-full h-full animate-spin-slow pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-teal-300 to-teal-100 shadow-[0_0_10px_#2dd4bf] absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>

        {/* SVG Captain Astronaut */}
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full animate-float drop-shadow-[0_12px_28px_rgba(20,184,166,0.5)] transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="suitCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="visorCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Jetpack with thruster exhaust */}
          <rect x="42" y="32" width="36" height="38" rx="8" fill="#1e293b" stroke="#14b8a6" strokeWidth="2" />
          <path d="M 46 70 Q 50 82 54 70" fill="#2dd4bf" className="animate-pulse" />
          <path d="M 66 70 Q 70 82 74 70" fill="#2dd4bf" className="animate-pulse" />

          {/* Antenna */}
          <line x1="60" y1="30" x2="60" y2="15" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="60" cy="14" r="4" fill="#2dd4bf" className="animate-ping opacity-75" />
          <circle cx="60" cy="14" r="3" fill="#ffffff" />

          {/* Suit Body */}
          <ellipse cx="60" cy="65" rx="22" ry="24" fill="url(#suitCapGrad)" stroke="#38bdf8" strokeWidth="2" />

          {/* Waving Right Hand */}
          <path d="M 82 60 Q 95 50 92 40" stroke="#a5b4fc" strokeWidth="6" strokeLinecap="round" fill="none" className="animate-pulse" />
          <circle cx="92" cy="40" r="4" fill="#ffffff" />

          {/* Left Hand */}
          <path d="M 38 60 Q 26 68 28 78" stroke="#a5b4fc" strokeWidth="6" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="78" r="4" fill="#ffffff" />

          {/* Helmet & Visor */}
          <circle cx="60" cy="45" r="20" fill="#0f172a" stroke="#14b8a6" strokeWidth="3" />
          <ellipse cx="60" cy="45" rx="14" ry="11" fill="url(#visorCapGrad)" />
          {/* Visor Glint */}
          <path d="M 52 40 Q 58 37 66 41" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.85" />

          {/* Stellar Badge */}
          <circle cx="60" cy="64" r="5" fill="#fbbf24" />
          <path d="M 57 70 L 60 77 L 63 70 Z" fill="#fbbf24" />
        </svg>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className={`relative flex items-center justify-center group ${className}`}>
        {/* Orbital Pulse Shields */}
        <div className="absolute -inset-4 rounded-full border border-pink-500/25 border-dashed animate-spin-slow pointer-events-none" />
        <div className="absolute -inset-1 rounded-full border border-indigo-500/30 animate-pulse pointer-events-none" />

        {/* Orbiting Quantum Star */}
        <div className="absolute w-full h-full animate-spin-reverse pointer-events-none">
          <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-pink-400 to-rose-200 shadow-[0_0_10px_#f43f5e] absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </div>

        <svg
          viewBox="0 0 120 120"
          className="w-full h-full animate-float drop-shadow-[0_12px_28px_rgba(236,72,153,0.5)] transition-transform duration-300 group-hover:scale-110"
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Outer Geometry */}
          <polygon points="60,18 96,80 24,80" fill="none" stroke="rgba(236,72,153,0.3)" strokeWidth="1.5" />
          <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(244,63,94,0.4)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Core Sphere */}
          <circle cx="60" cy="60" r="24" fill="url(#shieldGrad)" stroke="#f472b6" strokeWidth="2.5" />

          {/* Shield Emblem */}
          <path d="M 60 46 L 72 53 L 72 67 Q 60 77 60 77 Q 48 67 48 53 Z" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
          <circle cx="60" cy="60" r="5" fill="#f43f5e" className="animate-ping opacity-75" />
          <circle cx="60" cy="60" r="3.5" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // ── Student / Auth: Adorable Astronaut Scholar Sitting on Planet Earth Reading an Open Glowing Book (Matching Pinterest Ref 2) ──
  return (
    <div className={`relative flex items-center justify-center group ${className}`}>
      {/* Outer Cosmic Aura */}
      <div className="absolute -inset-3 rounded-full bg-teal-500/10 blur-xl animate-pulse-slow pointer-events-none" />
      <div className="absolute -inset-1 rounded-full border border-teal-400/30 animate-pulse pointer-events-none" />

      {/* Floating Orbiting Study Elements (Pencil & Star) */}
      <div className="absolute w-full h-full animate-spin-slow pointer-events-none">
        {/* Floating Pencil */}
        <div className="absolute -top-2 right-1 w-3 h-5 rotate-45 flex flex-col items-center">
          <div className="w-1.5 h-3 bg-amber-400 rounded-t-sm shadow-[0_0_8px_#fbbf24]" />
          <div className="w-1.5 h-1.5 bg-rose-400 rounded-b-sm" />
        </div>
      </div>

      <svg
        viewBox="0 0 140 140"
        className="w-full h-full animate-float drop-shadow-[0_16px_36px_rgba(45,212,191,0.45)] transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Earth Gradient */}
          <linearGradient id="earthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#082f49" />
          </linearGradient>

          {/* Continents Gradient */}
          <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>

          {/* Astronaut Suit Gradient */}
          <linearGradient id="scholarSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          {/* Visor Glint */}
          <linearGradient id="scholarVisorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Glowing Book Gradient */}
          <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* ── 1. Floating Study Sticky Notes (Zero-G) ── */}
        <rect x="12" y="30" width="14" height="14" rx="2" fill="#f472b6" className="animate-pulse opacity-80" transform="rotate(-15 19 37)" />
        <rect x="110" y="24" width="16" height="16" rx="2" fill="#fbbf24" className="animate-pulse opacity-80" transform="rotate(18 118 32)" />
        <rect x="114" y="80" width="12" height="12" rx="2" fill="#38bdf8" className="animate-pulse opacity-80" transform="rotate(-10 120 86)" />

        {/* ── 2. Planet Earth Base ── */}
        <circle cx="70" cy="100" r="32" fill="url(#earthGrad)" stroke="#38bdf8" strokeWidth="2.5" />
        
        {/* Earth Continents */}
        <path d="M 52 82 Q 62 78 68 85 Q 74 92 66 102 Q 54 100 52 88 Z" fill="url(#continentGrad)" />
        <path d="M 76 90 Q 88 88 92 98 Q 86 112 74 108 Q 72 98 76 90 Z" fill="url(#continentGrad)" />
        <path d="M 58 112 Q 68 114 70 124 Q 60 128 54 122 Z" fill="url(#continentGrad)" />

        {/* Earth Atmosphere Glow */}
        <ellipse cx="70" cy="74" rx="28" ry="6" fill="#38bdf8" opacity="0.3" />

        {/* ── 3. Life Support Backpack ── */}
        <rect x="50" y="32" width="40" height="38" rx="8" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />

        {/* ── 4. Astronaut Body Sitting on Earth ── */}
        <ellipse cx="70" cy="62" rx="19" ry="20" fill="url(#scholarSuitGrad)" stroke="#6366f1" strokeWidth="2" />

        {/* Left Leg & Boot sitting */}
        <path d="M 58 72 Q 54 84 56 90 L 64 92 Q 66 84 64 74 Z" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
        <ellipse cx="58" cy="92" rx="7" ry="4" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />

        {/* Right Leg & Boot sitting */}
        <path d="M 82 72 Q 86 84 84 90 L 76 92 Q 74 84 76 74 Z" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
        <ellipse cx="82" cy="92" rx="7" ry="4" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />

        {/* ── 5. Open Glowing Study Book in Hands ── */}
        <path
          d="M 52 64 Q 70 68 70 60 Q 70 68 88 64 L 86 78 Q 70 82 70 74 Q 70 82 54 78 Z"
          fill="url(#bookGrad)"
          stroke="#fef08a"
          strokeWidth="1.5"
          className="drop-shadow-[0_0_8px_#fbbf24]"
        />
        {/* Book White Pages */}
        <path d="M 54 66 Q 68 69 68 62 L 68 74 Q 68 80 56 76 Z" fill="#ffffff" />
        <path d="M 86 66 Q 72 69 72 62 L 72 74 Q 72 80 84 76 Z" fill="#ffffff" />
        {/* Page text lines */}
        <line x1="57" y1="69" x2="65" y2="70" stroke="#38bdf8" strokeWidth="1" />
        <line x1="57" y1="72" x2="65" y2="73" stroke="#38bdf8" strokeWidth="1" />
        <line x1="75" y1="69" x2="83" y2="70" stroke="#38bdf8" strokeWidth="1" />
        <line x1="75" y1="72" x2="83" y2="73" stroke="#38bdf8" strokeWidth="1" />

        {/* Glove Hands Holding the Book */}
        <circle cx="52" cy="70" r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />
        <circle cx="88" cy="70" r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="1.5" />

        {/* ── 6. Helmet & Head ── */}
        <circle cx="70" cy="40" r="18" fill="#0f172a" stroke="#818cf8" strokeWidth="2.5" />
        <ellipse cx="70" cy="40" rx="13" ry="10" fill="url(#scholarVisorGrad)" />
        {/* Visor Glint */}
        <path d="M 62 36 Q 68 33 76 37" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9" />

        {/* Oxygen Cord to Earth */}
        <path d="M 50 48 C 30 54 28 80 44 88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75" />
        <path d="M 90 48 C 110 54 112 80 96 88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.75" />

        {/* Shimmering Stars */}
        <polygon points="34,22 36,26 40,26 37,29 38,33 34,31 30,33 31,29 28,26 32,26" fill="#fbbf24" className="animate-ping opacity-75" />
        <polygon points="102,52 103,55 106,55 104,57 105,60 102,58 99,60 100,57 98,55 101,55" fill="#38bdf8" className="animate-ping opacity-75" />
      </svg>
    </div>
  );
}
