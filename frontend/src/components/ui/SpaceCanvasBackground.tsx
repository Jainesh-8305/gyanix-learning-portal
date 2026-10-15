'use client';

import { useEffect, useRef, memo } from 'react';
import { usePathname } from 'next/navigation';

export type SpaceIntensity = 'full' | 'medium' | 'subtle' | 'minimal';

interface SpaceCanvasBackgroundProps {
  forcedIntensity?: SpaceIntensity;
}

interface PlanetDef {
  orbitRX: number;
  orbitRY: number;
  orbitCX: number;
  orbitCY: number;
  startAngle: number;
  speed: number;
  radius: number;
  colors: [string, string, string];
  glow: string;
  hasRing: boolean;
  ringColor: string;
  ringColor2: string;
  tilt: number;
  drawOrbit: boolean;
}

const PLANETS: PlanetDef[] = [
  // 1. Orange Sun-like – large, orbits upper-right corner
  {
    orbitRX: 0.25,
    orbitRY: 0.14,
    orbitCX: 0.75,
    orbitCY: 0.2,
    startAngle: 0.4,
    speed: 0.0008,
    radius: 90,
    colors: ['#fef9c3', '#fb923c', '#7c2d12'],
    glow: '#f97316',
    hasRing: false,
    ringColor: '',
    ringColor2: '',
    tilt: 0,
    drawOrbit: false,
  },
  // 2. Cyan-teal Saturn-ring – mid-size, orbits left-mid
  {
    orbitRX: 0.2,
    orbitRY: 0.12,
    orbitCX: 0.2,
    orbitCY: 0.42,
    startAngle: 2.1,
    speed: 0.0006,
    radius: 70,
    colors: ['#a5f3fc', '#0891b2', '#164e63'],
    glow: '#22d3ee',
    hasRing: true,
    ringColor: 'rgba(103,232,249,0.75)',
    ringColor2: 'rgba(251,146,60,0.65)',
    tilt: -0.45,
    drawOrbit: true,
  },
  // 3. Hot pink – medium, orbits bottom-right
  {
    orbitRX: 0.22,
    orbitRY: 0.1,
    orbitCX: 0.8,
    orbitCY: 0.75,
    startAngle: 3.5,
    speed: 0.001,
    radius: 60,
    colors: ['#fce7f3', '#ec4899', '#831843'],
    glow: '#f472b6',
    hasRing: false,
    ringColor: '',
    ringColor2: '',
    tilt: 0,
    drawOrbit: false,
  },
  // 4. Purple-violet ringed – large, orbits lower-left
  {
    orbitRX: 0.18,
    orbitRY: 0.1,
    orbitCX: 0.2,
    orbitCY: 0.76,
    startAngle: 1.2,
    speed: 0.0005,
    radius: 78,
    colors: ['#ede9fe', '#7c3aed', '#2e1065'],
    glow: '#a855f7',
    hasRing: true,
    ringColor: 'rgba(192,132,252,0.75)',
    ringColor2: 'rgba(244,114,182,0.65)',
    tilt: 0.35,
    drawOrbit: true,
  },
  // 5. Small teal-green – top-left accent
  {
    orbitRX: 0.1,
    orbitRY: 0.06,
    orbitCX: 0.12,
    orbitCY: 0.14,
    startAngle: 5.0,
    speed: 0.0014,
    radius: 42,
    colors: ['#bbf7d0', '#10b981', '#064e3b'],
    glow: '#34d399',
    hasRing: false,
    ringColor: '',
    ringColor2: '',
    tilt: 0,
    drawOrbit: false,
  },
];

function SpaceCanvasBackground({
  forcedIntensity,
}: SpaceCanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();

  const getIntensity = (): SpaceIntensity => {
    if (forcedIntensity) return forcedIntensity;
    if (pathname === '/') return 'full';
    if (pathname?.startsWith('/certificates')) return 'full';
    if (pathname?.includes('/quiz')) return 'minimal';
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile'))
      return 'subtle';
    if (
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/register') ||
      pathname?.startsWith('/forgot-password') ||
      pathname?.startsWith('/reset-password')
    )
      return 'medium';
    if (pathname?.startsWith('/courses')) return 'medium';
    return 'medium';
  };

  const intensity = getIntensity();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 200,
    };

    let isAiThinking = false;
    let aiSwirlAngle = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    // Celebratory & click star sparks
    const burstSparks: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      alpha: number;
      decay: number;
      rotation: number;
      rotSpeed: number;
    }> = [];

    const triggerStarBurst = (
      x: number,
      y: number,
      count = 25,
      colors?: string[],
    ) => {
      const palette = colors || [
        '#38bdf8',
        '#2dd4bf',
        '#fbbf24',
        '#f472b6',
        '#a78bfa',
        '#ffffff',
      ];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        burstSparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 3,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.012,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.1,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (intensity === 'minimal') return;
      triggerStarBurst(e.clientX, e.clientY, 20);
    };

    const handleAiStart = () => {
      isAiThinking = true;
    };
    const handleAiEnd = () => {
      isAiThinking = false;
    };
    window.addEventListener('gyanix:ai-start', handleAiStart);
    window.addEventListener('gyanix:ai-end', handleAiEnd);

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    if (pathname?.startsWith('/certificates')) {
      setTimeout(() => {
        triggerStarBurst(width / 2, height / 3, 50, [
          '#fbbf24',
          '#f59e0b',
          '#2dd4bf',
          '#ffffff',
          '#c6a664',
        ]);
      }, 400);
    }

    // ── 1. Starfield Particles with 4-point Diamond Cross Stars ─────────
    const starCount =
      intensity === 'full'
        ? 280
        : intensity === 'medium'
          ? 180
          : intensity === 'subtle'
            ? 110
            : 60;
    const starPalette = [
      '#ffffff',
      '#bae6fd',
      '#c7d2fe',
      '#fef08a',
      '#fbcfe8',
      '#a7f3d0',
      '#e0e7ff',
    ];

    interface Star {
      x: number;
      y: number;
      originX: number;
      originY: number;
      z: number; // 1 = far, 2 = mid, 3 = near
      size: number;
      baseAlpha: number;
      phase: number;
      speed: number;
      color: string;
      isCrossStar: boolean;
    }

    const stars: Star[] = Array.from({ length: starCount }, (_, i) => {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      return {
        x: rx,
        y: ry,
        originX: rx,
        originY: ry,
        z: Math.random() * 2.5 + 0.8,
        size: Math.random() * 2.2 + 0.6,
        baseAlpha: Math.random() * 0.5 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        color: starPalette[Math.floor(Math.random() * starPalette.length)],
        isCrossStar: i % 7 === 0, // 1 in every 7 stars is a radiant 4-point cross star
      };
    });

    // ── 2. Shooting Comets / Meteors ──────────────────────────────────
    const meteorCount =
      intensity === 'full' ? 3 : intensity === 'medium' ? 2 : 1;
    const meteors = Array.from({ length: meteorCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.4,
      length: Math.random() * 110 + 80,
      speed: Math.random() * 6 + 11,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      alpha: 0,
      active: false,
      delay: Math.random() * 300 + 60,
    }));

    // ── 3. Nebula Cloud Physics (Matching Attached Reference Images) ───
    const nebulaClouds = [
      {
        x: width * 0.25,
        y: height * 0.3,
        radius: width * 0.35,
        color: 'rgba(99, 102, 241, 0.14)',
      }, // Indigo
      {
        x: width * 0.75,
        y: height * 0.4,
        radius: width * 0.4,
        color: 'rgba(236, 72, 153, 0.12)',
      }, // Magenta/Pink (Ref 2/3)
      {
        x: width * 0.5,
        y: height * 0.8,
        radius: width * 0.45,
        color: 'rgba(6, 182, 212, 0.13)',
      }, // Neon Cyan (Ref 2/3)
      {
        x: width * 0.85,
        y: height * 0.2,
        radius: width * 0.3,
        color: 'rgba(168, 85, 247, 0.12)',
      }, // Purple
    ];

    const planetAngles = PLANETS.map((p) => p.startAngle);
    let astroAngle = 0;
    let waveTime = 0;

    // ── DRAWING HELPERS ───────────────────────────────────────────────

    // Draw radiant 4-point diamond star (✦)
    function drawCrossStar(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      size: number,
      color: string,
      alpha: number,
    ) {
      context.save();
      context.translate(cx, cy);
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 10;

      // Draw horizontal & vertical flare diamond spikes
      context.beginPath();
      context.moveTo(0, -size * 2);
      context.quadraticCurveTo(0, 0, size * 2, 0);
      context.quadraticCurveTo(0, 0, 0, size * 2);
      context.quadraticCurveTo(0, 0, -size * 2, 0);
      context.quadraticCurveTo(0, 0, 0, -size * 2);
      context.closePath();
      context.fill();

      // Center glowing core pin
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(0, 0, size * 0.45, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }

    // Draw Giant Celestial Moon / Planet (Matching Image 3)
    function drawCelestialOrb(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
    ) {
      context.save();
      context.translate(x, y);

      // Outer Atmospheric Glowing Halo
      const outerGlow = context.createRadialGradient(
        0,
        0,
        radius * 0.85,
        0,
        0,
        radius * 1.5,
      );
      outerGlow.addColorStop(0, 'rgba(147, 51, 234, 0.28)');
      outerGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
      outerGlow.addColorStop(1, 'transparent');
      context.fillStyle = outerGlow;
      context.beginPath();
      context.arc(0, 0, radius * 1.5, 0, Math.PI * 2);
      context.fill();

      // Planet Sphere with Cosmic Nebula Gradient
      const planetGrad = context.createRadialGradient(
        -radius * 0.35,
        -radius * 0.35,
        radius * 0.1,
        0,
        0,
        radius,
      );
      planetGrad.addColorStop(0, '#38bdf8');
      planetGrad.addColorStop(0.35, '#6366f1');
      planetGrad.addColorStop(0.7, '#3b0764');
      planetGrad.addColorStop(1, '#090a1a');
      context.fillStyle = planetGrad;
      context.beginPath();
      context.arc(0, 0, radius, 0, Math.PI * 2);
      context.fill();

      // Atmospheric Rim Light Arc
      context.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      context.lineWidth = 3;
      context.beginPath();
      context.arc(0, 0, radius, -Math.PI * 0.8, Math.PI * 0.2);
      context.stroke();

      context.restore();
    }

    // Draw Cosmic Astronaut Floating in Nebula Ocean
    function drawCosmicAstronaut(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number,
      alpha = 1,
    ) {
      context.save();
      context.globalAlpha = alpha;
      context.translate(x, y);
      context.scale(scale, scale);

      // Visor Glow Aura
      context.shadowColor = '#ec4899';
      context.shadowBlur = 18;

      // Backpack Life Support Unit
      context.fillStyle = '#1e1b4b';
      context.strokeStyle = '#6366f1';
      context.lineWidth = 2;
      context.beginPath();
      context.roundRect(-24, -38, 48, 44, 10);
      context.fill();
      context.stroke();

      // Spacesuit Torso
      const suitGrad = context.createLinearGradient(-18, -32, 18, 10);
      suitGrad.addColorStop(0, '#f8fafc');
      suitGrad.addColorStop(0.6, '#cbd5e1');
      suitGrad.addColorStop(1, '#475569');
      context.fillStyle = suitGrad;
      context.beginPath();
      context.roundRect(-18, -32, 36, 38, 8);
      context.fill();

      // Chest Control Plate & Lights
      context.fillStyle = '#0f172a';
      context.beginPath();
      context.roundRect(-10, -20, 20, 14, 3);
      context.fill();

      context.fillStyle = '#38bdf8';
      context.beginPath();
      context.arc(-5, -13, 2, 0, Math.PI * 2);
      context.fill();

      context.fillStyle = '#ec4899';
      context.beginPath();
      context.arc(5, -13, 2, 0, Math.PI * 2);
      context.fill();

      // Helmet
      context.fillStyle = '#f8fafc';
      context.beginPath();
      context.arc(0, -42, 22, 0, Math.PI * 2);
      context.fill();

      // Radiant Multi-Color Visor (Matching Image 3 Iridescent Reflection)
      const visorGrad = context.createLinearGradient(-15, -52, 15, -32);
      visorGrad.addColorStop(0, '#ec4899'); // Magenta
      visorGrad.addColorStop(0.45, '#8b5cf6'); // Violet
      visorGrad.addColorStop(0.85, '#06b6d4'); // Cyan
      visorGrad.addColorStop(1, '#fbbf24'); // Gold
      context.fillStyle = visorGrad;
      context.beginPath();
      context.roundRect(-15, -50, 30, 18, 7);
      context.fill();

      // Visor Glass Reflection Highlight
      context.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(-4, -44, 9, -Math.PI * 0.7, -Math.PI * 0.1);
      context.stroke();

      // Oxygen Hose / Tether
      context.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      context.lineWidth = 2.5;
      context.beginPath();
      context.moveTo(18, -10);
      context.bezierCurveTo(36, -5, 45, 18, 32, 38);
      context.stroke();

      context.shadowBlur = 0;
      context.restore();
    }

    // Draw individual planet with rings, glow, sphere, and highlight
    function drawPlanet(
      context: CanvasRenderingContext2D,
      px: number,
      py: number,
      def: PlanetDef,
      globalAlpha: number,
    ) {
      context.save();
      context.globalAlpha = globalAlpha;
      const r = def.radius;

      // Outer glow halo — massive, atmospheric
      const halo = context.createRadialGradient(
        px,
        py,
        r * 0.5,
        px,
        py,
        r * 3.5,
      );
      halo.addColorStop(0, def.glow + '55');
      halo.addColorStop(0.4, def.glow + '22');
      halo.addColorStop(1, 'transparent');
      context.fillStyle = halo;
      context.beginPath();
      context.arc(px, py, r * 3.5, 0, Math.PI * 2);
      context.fill();

      // Back ring half (rendered BEHIND planet)
      if (def.hasRing) {
        context.save();
        context.translate(px, py);
        context.rotate(def.tilt);
        context.strokeStyle = def.ringColor;
        context.lineWidth = r * 0.28;
        context.beginPath();
        context.ellipse(0, 0, r * 2.1, r * 0.52, 0, Math.PI, Math.PI * 2);
        context.stroke();
        context.restore();
      }

      // Planet sphere with rich radial gradient
      const grad = context.createRadialGradient(
        px - r * 0.35,
        py - r * 0.35,
        r * 0.05,
        px,
        py,
        r,
      );
      grad.addColorStop(0, def.colors[0]);
      grad.addColorStop(0.45, def.colors[1]);
      grad.addColorStop(1, def.colors[2]);
      context.fillStyle = grad;
      context.beginPath();
      context.arc(px, py, r, 0, Math.PI * 2);
      context.fill();

      // Atmospheric limb (rim) light
      context.strokeStyle = def.glow + 'aa';
      context.lineWidth = 3.5;
      context.beginPath();
      context.arc(px, py, r - 1, -Math.PI * 0.75, Math.PI * 0.25);
      context.stroke();

      // Specular highlight — bright white flare
      context.fillStyle = 'rgba(255,255,255,0.28)';
      context.beginPath();
      context.ellipse(
        px - r * 0.3,
        py - r * 0.32,
        r * 0.28,
        r * 0.2,
        -0.65,
        0,
        Math.PI * 2,
      );
      context.fill();

      // Front ring half (rendered IN FRONT of planet)
      if (def.hasRing) {
        context.save();
        context.translate(px, py);
        context.rotate(def.tilt);
        context.strokeStyle = def.ringColor2;
        context.lineWidth = r * 0.22;
        context.beginPath();
        context.ellipse(0, 0, r * 2.1, r * 0.52, 0, 0, Math.PI);
        context.stroke();
        context.restore();
      }

      context.restore();
    }

    // Draw dashed elliptical orbit path
    function drawOrbitPath(
      context: CanvasRenderingContext2D,
      def: PlanetDef,
      alpha: number,
    ) {
      context.save();
      context.globalAlpha = alpha;
      context.strokeStyle = 'rgba(255,255,255,0.08)';
      context.lineWidth = 1;
      context.setLineDash([4, 12]);
      context.beginPath();
      context.ellipse(
        def.orbitCX * width,
        def.orbitCY * height,
        def.orbitRX * width,
        def.orbitRY * height,
        0,
        0,
        Math.PI * 2,
      );
      context.stroke();
      context.setLineDash([]);
      context.restore();
    }

    // Draw Undulating Cosmic Waves / Ocean
    function drawCosmicNebulaOcean(
      context: CanvasRenderingContext2D,
      time: number,
      alpha: number,
    ) {
      if (alpha <= 0) return;
      context.save();
      context.globalAlpha = alpha;
      const waveY = height * 0.82;
      const oceanGrad = context.createLinearGradient(0, waveY, 0, height);
      oceanGrad.addColorStop(0, 'rgba(236, 72, 153, 0.08)');
      oceanGrad.addColorStop(0.4, 'rgba(99, 102, 241, 0.12)');
      oceanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.18)');
      context.fillStyle = oceanGrad;
      context.beginPath();
      context.moveTo(0, height);
      context.lineTo(0, waveY);
      for (let x = 0; x <= width; x += 30) {
        const y =
          waveY +
          Math.sin(x * 0.005 + time * 0.8) * 16 +
          Math.cos(x * 0.01 - time * 0.5) * 8;
        context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.closePath();
      context.fill();
      context.restore();
    }

    // ── MAIN RENDER LOOP (60 FPS) ─────────────────────────────────────

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const parallaxX = (mouse.x - width / 2) * 0.035;
      const parallaxY = (mouse.y - height / 2) * 0.035;

      waveTime += 0.015;

      // Per-intensity alpha multipliers — planets are ALWAYS bold and visible
      const nebulaAlpha =
        intensity === 'full'
          ? 1
          : intensity === 'medium'
            ? 0.9
            : intensity === 'subtle'
              ? 0.7
              : 0;
      const planetAlpha =
        intensity === 'full'
          ? 1
          : intensity === 'medium'
            ? 1
            : intensity === 'subtle'
              ? 0.95
              : 0;
      const orbAlpha =
        intensity === 'full'
          ? 1
          : intensity === 'medium'
            ? 0.9
            : intensity === 'subtle'
              ? 0.7
              : 0;
      const astroAlpha =
        intensity === 'full'
          ? 1
          : intensity === 'medium'
            ? 1
            : intensity === 'subtle'
              ? 0.85
              : 0;
      const waveAlpha =
        intensity === 'full' ? 1 : intensity === 'medium' ? 0.7 : 0;

      // ── Layer 1: Cosmic Nebula Clouds ────────────────────────────────
      if (nebulaAlpha > 0) {
        nebulaClouds.forEach((cloud, i) => {
          const shiftX =
            Math.sin(waveTime * 0.4 + i) * 20 - parallaxX * (i + 1) * 0.5;
          const shiftY =
            Math.cos(waveTime * 0.3 + i) * 15 - parallaxY * (i + 1) * 0.5;
          const radGrad = ctx.createRadialGradient(
            cloud.x + shiftX,
            cloud.y + shiftY,
            0,
            cloud.x + shiftX,
            cloud.y + shiftY,
            cloud.radius,
          );
          radGrad.addColorStop(0, cloud.color);
          radGrad.addColorStop(
            0.6,
            cloud.color.replace('0.1', '0.04').replace('0.12', '0.05'),
          );
          radGrad.addColorStop(1, 'transparent');
          ctx.save();
          ctx.globalAlpha = nebulaAlpha;
          ctx.fillStyle = radGrad;
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        });
      }

      // ── Layer 2: Background Celestial Orb ────────────────────────────
      if (orbAlpha > 0) {
        ctx.save();
        ctx.globalAlpha = orbAlpha;
        drawCelestialOrb(
          ctx,
          width * 0.82 - parallaxX * 1.2,
          height * 0.28 - parallaxY * 1.2,
          width * (intensity === 'subtle' ? 0.1 : 0.16),
        );
        ctx.restore();
      }

      // ── Layer 3: Fluid Nebula Wave Sea ───────────────────────────────
      drawCosmicNebulaOcean(ctx, waveTime, waveAlpha);

      // ── AI Thinking Swirl (if active) ─────────────────────────────────
      if (isAiThinking) {
        aiSwirlAngle += 0.05;
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.rotate(aiSwirlAngle);
        for (let i = 0; i < 14; i++) {
          const r = 60 + i * 9;
          ctx.strokeStyle = `rgba(236, 72, 153, ${0.45 - i * 0.03})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, r, i * 0.5, i * 0.5 + Math.PI / 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Layer 4: Starfield with 4-Point Radiant Cross Stars ───────────
      stars.forEach((star) => {
        star.phase += prefersReducedMotion ? 0.002 : star.speed;
        const twinkle = Math.sin(star.phase) * 0.4 + 0.6;

        let currentX = star.originX - parallaxX * star.z;
        let currentY = star.originY - parallaxY * star.z;

        let scaleBoost = 1;
        let alphaBoost = 1;

        if (
          !prefersReducedMotion &&
          !isTouchDevice &&
          intensity !== 'minimal'
        ) {
          const dx = mouse.x - currentX;
          const dy = mouse.y - currentY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = 1 - dist / mouse.radius;
            currentX += (dx / dist) * force * 16 * (star.z / 3);
            currentY += (dy / dist) * force * 16 * (star.z / 3);
            scaleBoost = 1 + force * 0.9;
            alphaBoost = 1 + force * 0.7;
          }
        }

        const finalAlpha = Math.min(1, star.baseAlpha * twinkle * alphaBoost);

        if (star.isCrossStar) {
          // Render radiant 4-point cross diamond star (✦)
          drawCrossStar(
            ctx,
            currentX,
            currentY,
            star.size * 1.8 * scaleBoost,
            star.color,
            finalAlpha,
          );
        } else {
          // Standard twinkling stardust
          ctx.fillStyle = star.color;
          ctx.globalAlpha = finalAlpha;
          ctx.beginPath();
          ctx.arc(currentX, currentY, star.size * scaleBoost, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.globalAlpha = 1;

      // ── Layer 5: Orbit Paths (dashed ellipses) ────────────────────────
      if (planetAlpha > 0 && !prefersReducedMotion) {
        PLANETS.forEach((def) => {
          if (def.drawOrbit) drawOrbitPath(ctx, def, planetAlpha * 0.6);
        });
      }

      // ── Layer 6: Orbiting Colorful Planets ────────────────────────────
      if (planetAlpha > 0) {
        PLANETS.forEach((def, i) => {
          if (!prefersReducedMotion) planetAngles[i] += def.speed;
          const angle = planetAngles[i];
          const px =
            def.orbitCX * width +
            Math.cos(angle) * def.orbitRX * width -
            parallaxX * 1.4;
          const py =
            def.orbitCY * height +
            Math.sin(angle) * def.orbitRY * height -
            parallaxY * 1.4;
          drawPlanet(ctx, px, py, def, planetAlpha);
        });
      }

      // ── Layer 7: Shooting Comets with Neon Trails ────────────────────
      if (!prefersReducedMotion && intensity !== 'minimal') {
        meteors.forEach((m) => {
          if (!m.active) {
            m.delay--;
            if (m.delay <= 0) {
              m.active = true;
              m.x = Math.random() * width * 0.8 + width * 0.1;
              m.y = Math.random() * height * 0.35;
              m.alpha = 1;
              m.delay = Math.random() * 400 + 200;
            }
          } else {
            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;
            m.alpha -= 0.014;
            if (m.alpha <= 0) {
              m.active = false;
            } else {
              const cometGrad = ctx.createLinearGradient(
                m.x,
                m.y,
                m.x - Math.cos(m.angle) * m.length,
                m.y - Math.sin(m.angle) * m.length,
              );
              cometGrad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
              cometGrad.addColorStop(
                0.3,
                `rgba(236, 72, 153, ${m.alpha * 0.8})`,
              );
              cometGrad.addColorStop(
                0.7,
                `rgba(56, 189, 248, ${m.alpha * 0.5})`,
              );
              cometGrad.addColorStop(1, 'transparent');
              ctx.strokeStyle = cometGrad;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(m.x, m.y);
              ctx.lineTo(
                m.x - Math.cos(m.angle) * m.length,
                m.y - Math.sin(m.angle) * m.length,
              );
              ctx.stroke();
            }
          }
        });
      }

      // ── Layer 8: Floating Astronaut ───────────────────────────────────
      if (!prefersReducedMotion && astroAlpha > 0) {
        astroAngle += 0.008;
        const floatY = Math.sin(astroAngle) * 14;
        const astroScale =
          intensity === 'full' ? 1.15 : intensity === 'medium' ? 0.9 : 0.75;
        const astroX =
          intensity === 'full'
            ? width * 0.16 - parallaxX * 2
            : intensity === 'medium'
              ? width * 0.1 - parallaxX * 1.5
              : width * 0.06 - parallaxX;
        const astroY =
          (intensity === 'full' ? height * 0.42 : height * 0.38) +
          floatY -
          parallaxY * 2;
        drawCosmicAstronaut(ctx, astroX, astroY, astroScale, astroAlpha);
      }

      // ── Layer 7: Burst Sparks (All Stars, No Balls) ───────────────────
      for (let i = burstSparks.length - 1; i >= 0; i--) {
        const p = burstSparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) {
          burstSparks.splice(i, 1);
        } else {
          drawCrossStar(ctx, p.x, p.y, p.size, p.color, p.alpha);
        }
      }

      if (!document.hidden) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('gyanix:ai-start', handleAiStart);
      window.removeEventListener('gyanix:ai-end', handleAiEnd);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, [intensity, pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] overflow-hidden"
    />
  );
}

export default memo(SpaceCanvasBackground);
