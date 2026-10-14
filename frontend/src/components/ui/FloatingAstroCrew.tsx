'use client';

import { useEffect, useState } from 'react';

export default function FloatingAstroCrew() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2] overflow-hidden">
      
      {/* ── 1. Top-Left: Retro Space Rocket with Fiery Jet Thrust Trails (Pinterest Ref 1) ── */}
      <div
        className="absolute top-16 left-6 sm:left-12 w-24 h-24 sm:w-28 sm:h-28 animate-float opacity-85 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -18}px) rotate(-25deg)`,
        }}
      >
        <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-xl animate-pulse-slow" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_24px_rgba(249,115,22,0.4)]">
          <defs>
            <linearGradient id="rocketBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f87171" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <linearGradient id="rocketFinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Fiery Exhaust Flames */}
          <path d="M 44 72 Q 50 96 50 90 Q 50 96 56 72 Z" fill="url(#flameGrad)" className="animate-pulse" />
          <path d="M 47 72 Q 50 86 53 72 Z" fill="#ffffff" className="animate-pulse" />

          {/* Rocket Fins */}
          <polygon points="32,68 44,56 44,70" fill="url(#rocketFinGrad)" />
          <polygon points="68,68 56,56 56,70" fill="url(#rocketFinGrad)" />

          {/* Rocket Fuselage */}
          <path d="M 50 16 C 42 32 40 54 42 70 L 58 70 C 60 54 58 32 50 16 Z" fill="url(#rocketBodyGrad)" stroke="#b91c1c" strokeWidth="1.5" />

          {/* Cockpit Porthole Glass */}
          <circle cx="50" cy="42" r="7" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="50" cy="42" r="5" fill="#38bdf8" />
          <path d="M 47 39 Q 50 37 53 40" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* Sparkles */}
          <circle cx="28" cy="35" r="2" fill="#fbbf24" className="animate-ping opacity-75" />
          <circle cx="72" cy="20" r="1.5" fill="#ffffff" />
        </svg>
      </div>

      {/* ── 2. Top-Right: Orbiting Ringed Saturn Planet (Pinterest Ref 1) ── */}
      <div
        className="absolute top-24 right-8 sm:right-16 w-24 h-24 sm:w-28 sm:h-28 animate-float opacity-80 transition-transform duration-700 ease-out"
        style={{
          animationDelay: '1.5s',
          transform: `translate(${mousePos.x * 22}px, ${mousePos.y * 22}px)`,
        }}
      >
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl animate-pulse-slow" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_24px_rgba(251,191,36,0.35)]">
          <defs>
            <linearGradient id="saturnBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="saturnRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Back of Planetary Ring */}
          <path d="M 12 50 C 12 40 88 40 88 50" stroke="url(#saturnRing)" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.7" />

          {/* Planet Body with Surface Atmosphere Bands */}
          <circle cx="50" cy="50" r="22" fill="url(#saturnBody)" stroke="#d97706" strokeWidth="1.5" />
          <path d="M 32 45 Q 50 48 68 45" stroke="#d97706" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 30 54 Q 50 58 70 54" stroke="#78350f" strokeWidth="1.5" fill="none" opacity="0.6" />

          {/* Front of Planetary Ring */}
          <path d="M 10 50 C 10 62 90 62 90 50" stroke="url(#saturnRing)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 14 50 C 14 58 86 58 86 50" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* Mini Orbiting Moon */}
          <circle cx="22" cy="30" r="3" fill="#38bdf8" className="animate-pulse" />
        </svg>
      </div>

      {/* ── 3. Bottom-Left: Floating Spiral Study Notebook & Neon Pencils (Pinterest Ref 2) ── */}
      <div
        className="absolute bottom-20 left-8 sm:left-16 w-22 h-22 sm:w-26 sm:h-26 animate-float opacity-80 transition-transform duration-700 ease-out"
        style={{
          animationDelay: '2.5s',
          transform: `translate(${mousePos.x * -16}px, ${mousePos.y * 16}px) rotate(12deg)`,
        }}
      >
        <div className="absolute inset-0 bg-teal-500/10 rounded-full blur-xl animate-pulse-slow" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_20px_rgba(45,212,191,0.35)]">
          {/* Floating Spiral Notebook */}
          <rect x="25" y="24" width="46" height="54" rx="4" fill="#1e1b4b" stroke="#38bdf8" strokeWidth="2" />
          <rect x="30" y="28" width="37" height="46" rx="2" fill="#0f172a" />
          
          {/* Notebook Lines */}
          <line x1="36" y1="36" x2="61" y2="36" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="44" x2="61" y2="44" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="52" x2="61" y2="52" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="36" y1="60" x2="55" y2="60" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" />

          {/* Spiral Bindings */}
          {[28, 36, 44, 52, 60, 68].map((y) => (
            <circle key={y} cx="25" cy={y} r="2.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          ))}

          {/* Floating Neon Study Pencil */}
          <g transform="translate(48, 16) rotate(40)">
            <rect x="0" y="0" width="8" height="32" rx="1" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <polygon points="0,32 8,32 4,40" fill="#f87171" />
            <polygon points="3,38 5,38 4,40" fill="#0f172a" />
          </g>

          {/* Sticky Notes */}
          <rect x="62" y="58" width="16" height="16" rx="2" fill="#ec4899" opacity="0.9" transform="rotate(-15 70 66)" />
        </svg>
      </div>

      {/* ── 4. Bottom-Right: Astronaut Standing on Yellow Cratered Moon Waving (Pinterest Ref 1) ── */}
      <div
        className="absolute bottom-16 right-10 sm:right-20 w-24 h-24 sm:w-28 sm:h-28 animate-float opacity-85 transition-transform duration-700 ease-out"
        style={{
          animationDelay: '3.2s',
          transform: `translate(${mousePos.x * 16}px, ${mousePos.y * -16}px)`,
        }}
      >
        <div className="absolute inset-0 bg-yellow-500/10 rounded-full blur-xl animate-pulse-slow" />
        
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_10px_28px_rgba(251,191,36,0.4)]">
          <defs>
            <linearGradient id="moonYellowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="astroWhiteSuit" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#e0e7ff" />
              <stop offset="100%" stopColor="#a5b4fc" />
            </linearGradient>
          </defs>

          {/* Yellow Cratered Moon Base (Ref 1) */}
          <path d="M 20 110 Q 60 76 100 110 Z" fill="url(#moonYellowGrad)" stroke="#b45309" strokeWidth="2" />
          <ellipse cx="44" cy="98" rx="5" ry="3" fill="#b45309" opacity="0.6" />
          <ellipse cx="76" cy="102" rx="7" ry="4" fill="#b45309" opacity="0.6" />
          <ellipse cx="60" cy="92" rx="3.5" ry="2" fill="#b45309" opacity="0.6" />

          {/* Astronaut Legs standing on Moon */}
          <path d="M 48 74 L 46 88" stroke="#818cf8" strokeWidth="7" strokeLinecap="round" />
          <path d="M 72 74 L 74 88" stroke="#818cf8" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="45" cy="90" rx="6" ry="3.5" fill="#ffffff" stroke="#4338ca" strokeWidth="1.5" />
          <ellipse cx="75" cy="90" rx="6" ry="3.5" fill="#ffffff" stroke="#4338ca" strokeWidth="1.5" />

          {/* Suit Body */}
          <ellipse cx="60" cy="58" rx="18" ry="20" fill="url(#astroWhiteSuit)" stroke="#6366f1" strokeWidth="2" />

          {/* Waving Hands */}
          <path d="M 42 54 Q 28 44 32 34" stroke="#c7d2fe" strokeWidth="5.5" strokeLinecap="round" fill="none" className="animate-bounce-subtle" />
          <circle cx="32" cy="34" r="4" fill="#ffffff" />
          <path d="M 78 54 Q 92 44 88 34" stroke="#c7d2fe" strokeWidth="5.5" strokeLinecap="round" fill="none" className="animate-bounce-subtle" />
          <circle cx="88" cy="34" r="4" fill="#ffffff" />

          {/* Helmet & Golden Visor */}
          <circle cx="60" cy="36" r="17" fill="#0f172a" stroke="#818cf8" strokeWidth="2.5" />
          <ellipse cx="60" cy="36" rx="12" ry="9" fill="#0284c7" />
          <path d="M 52 32 Q 58 29 66 33" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9" />

          {/* American / Space Patch on Arm */}
          <rect x="76" y="52" width="6" height="4" rx="1" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
}
