'use client';

import { useEffect, useRef, memo } from 'react';

function LiveSpaceCosmos() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovered: false,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovered = true;
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn burst of cosmic stardust sparks on click
      for (let i = 0; i < 30; i++) {
        burstSparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          radius: Math.random() * 2.5 + 1,
          color: ['#38bdf8', '#2dd4bf', '#fbbf24', '#f472b6', '#a78bfa'][Math.floor(Math.random() * 5)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // ── 1. Starfield (220 stars with depth layers) ──────────────────
    interface Star {
      x: number;
      y: number;
      z: number; // depth 1 to 3
      radius: number;
      baseAlpha: number;
      phase: number;
      speed: number;
      color: string;
    }

    const starColors = ['#ffffff', '#c7d2fe', '#bae6fd', '#fef08a', '#fbcfe8', '#a7f3d0'];
    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 2 + 1,
      radius: Math.random() * 1.5 + 0.4,
      baseAlpha: Math.random() * 0.6 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.02 + 0.008,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // ── 2. Shooting Comets / Meteors ──────────────────────────────
    interface Meteor {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      alpha: number;
      active: boolean;
    }

    const meteors: Meteor[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.5,
      length: Math.random() * 100 + 80,
      speed: Math.random() * 8 + 12,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
      alpha: 0,
      active: false,
    }));

    let meteorTimer = 0;

    // ── 3. Click Burst Sparks ─────────────────────────────────────
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      decay: number;
    }
    const burstSparks: Spark[] = [];

    // ── 4. Roaming Roaming Astronauts & Objects (Physics Simulation) ──
    interface RoamingObject {
      type: 'scholar-astro' | 'spacewalker' | 'rocket' | 'saturn' | 'earth' | 'notebook' | 'pencil';
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      rotSpeed: number;
      scale: number;
      bobPhase: number;
      bobSpeed: number;
    }

    const roamingCrew: RoamingObject[] = [
      // 1. Scholar Astronaut sitting on mini Earth reading glowing book
      {
        type: 'scholar-astro',
        x: width * 0.12,
        y: height * 0.32,
        vx: 0.15,
        vy: 0.08,
        rotation: 0,
        rotSpeed: 0.002,
        scale: 1,
        bobPhase: 0,
        bobSpeed: 0.025,
      },
      // 2. Spacewalker Astronaut floating & roaming in deep space
      {
        type: 'spacewalker',
        x: width * 0.85,
        y: height * 0.65,
        vx: -0.18,
        vy: -0.1,
        rotation: 0.2,
        rotSpeed: -0.003,
        scale: 0.95,
        bobPhase: 2,
        bobSpeed: 0.03,
      },
      // 3. Cruising Retro Space Rocket
      {
        type: 'rocket',
        x: -100,
        y: height * 0.18,
        vx: 1.4,
        vy: 0.35,
        rotation: 0.25,
        rotSpeed: 0,
        scale: 0.85,
        bobPhase: 1,
        bobSpeed: 0.04,
      },
      // 4. Ringed Saturn Planet
      {
        type: 'saturn',
        x: width * 0.88,
        y: height * 0.22,
        vx: -0.05,
        vy: 0.03,
        rotation: -0.3,
        rotSpeed: 0.0008,
        scale: 1,
        bobPhase: 3,
        bobSpeed: 0.015,
      },
      // 5. Orbiting Earth Globe
      {
        type: 'earth',
        x: width * 0.08,
        y: height * 0.78,
        vx: 0.06,
        vy: -0.04,
        rotation: 0,
        rotSpeed: 0.001,
        scale: 0.9,
        bobPhase: 4,
        bobSpeed: 0.018,
      },
      // 6. Floating Zero-G Study Notebook
      {
        type: 'notebook',
        x: width * 0.35,
        y: height * 0.88,
        vx: 0.12,
        vy: -0.08,
        rotation: 0.4,
        rotSpeed: 0.004,
        scale: 0.75,
        bobPhase: 1.5,
        bobSpeed: 0.035,
      },
      // 7. Floating Neon Study Pencil
      {
        type: 'pencil',
        x: width * 0.68,
        y: height * 0.12,
        vx: -0.14,
        vy: 0.1,
        rotation: -0.6,
        rotSpeed: -0.005,
        scale: 0.75,
        bobPhase: 3.5,
        bobSpeed: 0.03,
      },
    ];

    // ── Vector Drawing Helpers for Roaming Entities ───────────────

    // Draw Scholar Astronaut with Glowing Book on Earth
    function drawScholarAstro(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Ambient Celestial Glow
      const glow = ctx.createRadialGradient(0, 0, 10, 0, 0, 70);
      glow.addColorStop(0, 'rgba(45, 212, 191, 0.25)');
      glow.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 70, 0, Math.PI * 2);
      ctx.fill();

      // Planet Earth Base
      const earthGrad = ctx.createRadialGradient(-10, 20, 5, 0, 30, 35);
      earthGrad.addColorStop(0, '#38bdf8');
      earthGrad.addColorStop(0.6, '#0284c7');
      earthGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(0, 32, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Continents on Earth
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(-8, 26, 10, 0, Math.PI * 2);
      ctx.arc(10, 36, 12, 0, Math.PI * 2);
      ctx.arc(-2, 46, 8, 0, Math.PI * 2);
      ctx.fill();

      // Backpack
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-18, -24, 36, 32, 6);
      ctx.fill();
      ctx.stroke();

      // Suit Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#818cf8';
      ctx.stroke();

      // Boots
      ctx.fillStyle = '#e0e7ff';
      ctx.beginPath();
      ctx.ellipse(-10, 22, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(10, 22, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glowing Book
      ctx.fillStyle = '#f97316';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.quadraticCurveTo(0, 4, 0, -4);
      ctx.quadraticCurveTo(0, 4, 16, 0);
      ctx.lineTo(14, 12);
      ctx.quadraticCurveTo(0, 16, 0, 8);
      ctx.quadraticCurveTo(0, 16, -14, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // White Pages
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-14, 2);
      ctx.quadraticCurveTo(0, 5, 0, -2);
      ctx.lineTo(0, 7);
      ctx.quadraticCurveTo(0, 14, -12, 10);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(14, 2);
      ctx.quadraticCurveTo(0, 5, 0, -2);
      ctx.lineTo(0, 7);
      ctx.quadraticCurveTo(0, 14, 12, 10);
      ctx.closePath();
      ctx.fill();

      // Glove Hands
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-14, 6, 3.5, 0, Math.PI * 2);
      ctx.arc(14, 6, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Visor with cyan gradient
      const visorGrad = ctx.createLinearGradient(-10, -24, 10, -12);
      visorGrad.addColorStop(0, '#38bdf8');
      visorGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = visorGrad;
      ctx.beginPath();
      ctx.ellipse(0, -18, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Visor reflection glint
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-3, -20, 5, -Math.PI / 4, Math.PI / 4);
      ctx.stroke();

      ctx.restore();
    }

    // Draw Spacewalker Waving in Zero-G
    function drawSpacewalker(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Thruster Flare
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.ellipse(-12, 16, 3, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(12, 16, 3, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Suit
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Legs
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = '#e0e7ff';
      ctx.beginPath();
      ctx.moveTo(-6, 14);
      ctx.lineTo(-10, 26);
      ctx.moveTo(6, 14);
      ctx.lineTo(10, 26);
      ctx.stroke();

      // Waving Arm
      ctx.beginPath();
      ctx.moveTo(12, -4);
      ctx.lineTo(24, -16);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(24, -16, 4, 0, Math.PI * 2);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#0b0d1e';
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -18, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Visor
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -18, 11, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw Cruising Retro Space Rocket with Fire Trails
    function drawRocket(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Rocket Exhaust Fire
      const flame = ctx.createLinearGradient(0, 25, 0, 60);
      flame.addColorStop(0, '#fef08a');
      flame.addColorStop(0.4, '#f59e0b');
      flame.addColorStop(1, '#ef4444');
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(-8, 25);
      ctx.quadraticCurveTo(0, 60 + Math.random() * 8, 0, 50);
      ctx.quadraticCurveTo(0, 60 + Math.random() * 8, 8, 25);
      ctx.closePath();
      ctx.fill();

      // Fins
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(-12, 18);
      ctx.lineTo(-24, 28);
      ctx.lineTo(-12, 28);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(12, 18);
      ctx.lineTo(24, 28);
      ctx.lineTo(12, 28);
      ctx.closePath();
      ctx.fill();

      // Body
      const rocketGrad = ctx.createLinearGradient(-14, 0, 14, 0);
      rocketGrad.addColorStop(0, '#ffffff');
      rocketGrad.addColorStop(0.6, '#f87171');
      rocketGrad.addColorStop(1, '#dc2626');
      ctx.fillStyle = rocketGrad;
      ctx.beginPath();
      ctx.moveTo(0, -32);
      ctx.bezierCurveTo(-14, -10, -14, 18, -12, 26);
      ctx.lineTo(12, 26);
      ctx.bezierCurveTo(14, 18, 14, -10, 0, -32);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Porthole
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    // Draw Saturn with Rings
    function drawSaturn(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      // Back of Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 16, 0, Math.PI, 0);
      ctx.stroke();

      // Planet Body
      const satGrad = ctx.createRadialGradient(-8, -8, 4, 0, 0, 24);
      satGrad.addColorStop(0, '#fde047');
      satGrad.addColorStop(0.5, '#f59e0b');
      satGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = satGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      // Front of Ring
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 48, 16, 0, 0, Math.PI);
      ctx.stroke();

      // Thin inner gold ring line
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 42, 14, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    // Draw Earth Globe
    function drawEarth(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      const earthGrad = ctx.createRadialGradient(-8, -8, 4, 0, 0, 26);
      earthGrad.addColorStop(0, '#38bdf8');
      earthGrad.addColorStop(0.6, '#0284c7');
      earthGrad.addColorStop(1, '#075985');
      ctx.fillStyle = earthGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      // Green Continents
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(-8, -6, 9, 0, Math.PI * 2);
      ctx.arc(8, 6, 10, 0, Math.PI * 2);
      ctx.fill();

      // Atmosphere Glow
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();
    }

    // Draw Floating Spiral Notebook
    function drawNotebook(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-16, -20, 32, 40, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-12, -16, 24, 32, 2);
      ctx.fill();

      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1.5;
      for (let i = -10; i <= 10; i += 5) {
        ctx.beginPath();
        ctx.moveTo(-8, i);
        ctx.lineTo(8, i);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw Floating Neon Pencil
    function drawPencil(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-3, -16, 6, 26);
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.moveTo(-3, 10);
      ctx.lineTo(3, 10);
      ctx.lineTo(0, 18);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // ── 5. Main Animation Loop ───────────────────────────────────
    const render = () => {
      // Ease mouse coordinates
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Dark Void Background with gradient nebulae
      ctx.fillStyle = '#05060f';
      ctx.fillRect(0, 0, width, height);

      // Deep Cosmic Nebula Light Pockets
      const neb1 = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, 400);
      neb1.addColorStop(0, 'rgba(99, 102, 241, 0.07)');
      neb1.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = neb1;
      ctx.fillRect(0, 0, width, height);

      const neb2 = ctx.createRadialGradient(width * 0.8, height * 0.7, 20, width * 0.8, height * 0.7, 450);
      neb2.addColorStop(0, 'rgba(45, 212, 191, 0.06)');
      neb2.addColorStop(1, 'rgba(45, 212, 191, 0)');
      ctx.fillStyle = neb2;
      ctx.fillRect(0, 0, width, height);

      // ── Draw Stars ───────────────────────────────────────────────
      stars.forEach((star) => {
        star.phase += star.speed;
        const twinkle = star.baseAlpha + 0.4 * Math.sin(star.phase);

        // Gentle Parallax offset from mouse
        const parallaxX = ((mouse.x - width / 2) / width) * 20 * (star.z / 3);
        const parallaxY = ((mouse.y - height / 2) / height) * 20 * (star.z / 3);

        ctx.fillStyle = star.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, twinkle));
        ctx.beginPath();
        ctx.arc(star.x + parallaxX, star.y + parallaxY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // ── Draw & Animate Shooting Comets ───────────────────────────
      meteorTimer++;
      if (meteorTimer % 180 === 0) {
        const available = meteors.find((m) => !m.active);
        if (available) {
          available.x = Math.random() * (width * 0.8) + width * 0.1;
          available.y = Math.random() * (height * 0.3);
          available.alpha = 1;
          available.active = true;
        }
      }

      meteors.forEach((m) => {
        if (!m.active) return;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha -= 0.015;

        const tailX = m.x - Math.cos(m.angle) * m.length;
        const tailY = m.y - Math.sin(m.angle) * m.length;

        const cometGrad = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        cometGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        cometGrad.addColorStop(0.7, `rgba(45, 212, 191, ${m.alpha * 0.6})`);
        cometGrad.addColorStop(1, `rgba(255, 255, 255, ${m.alpha})`);

        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();

        if (m.alpha <= 0 || m.x > width + 100 || m.y > height + 100) {
          m.active = false;
        }
      });

      // ── Draw Click Burst Sparks ──────────────────────────────────
      for (let i = burstSparks.length - 1; i >= 0; i--) {
        const s = burstSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();

        if (s.alpha <= 0) burstSparks.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      // ── Animate & Draw Roaming Space Entities ────────────────────
      roamingCrew.forEach((item) => {
        // Move entity
        item.x += item.vx;
        item.y += item.vy;
        item.rotation += item.rotSpeed;
        item.bobPhase += item.bobSpeed;

        // Wrap around viewport edges smoothly
        if (item.x < -120) item.x = width + 100;
        if (item.x > width + 120) item.x = -100;
        if (item.y < -120) item.y = height + 100;
        if (item.y > height + 120) item.y = -100;

        // Bobbing vertical offset
        const bobY = Math.sin(item.bobPhase) * 6;

        // Draw based on type
        switch (item.type) {
          case 'scholar-astro':
            drawScholarAstro(ctx, item.x, item.y + bobY, item.scale);
            break;
          case 'spacewalker':
            drawSpacewalker(ctx, item.x, item.y + bobY, item.scale);
            break;
          case 'rocket':
            drawRocket(ctx, item.x, item.y + bobY, item.scale, item.rotation);
            break;
          case 'saturn':
            drawSaturn(ctx, item.x, item.y + bobY, item.scale, item.rotation);
            break;
          case 'earth':
            drawEarth(ctx, item.x, item.y + bobY, item.scale);
            break;
          case 'notebook':
            drawNotebook(ctx, item.x, item.y + bobY, item.scale, item.rotation);
            break;
          case 'pencil':
            drawPencil(ctx, item.x, item.y + bobY, item.scale, item.rotation);
            break;
        }
      });

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
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1] overflow-hidden"
    />
  );
}

export default memo(LiveSpaceCosmos);
