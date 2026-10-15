'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulseVal: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

const COSMIC_COLORS = [
  'rgba(129, 140, 248, ', // Electric Indigo
  'rgba(45, 212, 191, ', // Neon Teal
  'rgba(244, 114, 182, ', // Nebula Rose
  'rgba(251, 191, 36, ', // Celestial Gold
  'rgba(167, 139, 250, ', // Purple Zodiac
  'rgba(255, 255, 255, ', // Starlight White
];

export default function CosmicCursorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Mouse coordinates
    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      isHovering: false,
      radius: 200, // Interaction radius for constellation webbing
    };

    const sparks: Spark[] = [];
    let shootingStarTimer = 0;
    const shootingStars: ShootingStar[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isHovering = true;

      // Spawn playful tiny stardust trail on fast mouse movement
      if (Math.random() > 0.4) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5 - 0.5,
          size: Math.random() * 2 + 1,
          color:
            COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
          alpha: 1,
          life: 30,
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      // Spawn bursting cosmic stardust explosion on click!
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1.5;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          color:
            COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
          alpha: 1,
          life: 45,
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.isHovering = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Generate stars
    const starCount = Math.min(130, Math.floor((width * height) / 10000));
    const particles: Particle[] = Array.from({ length: starCount }, () => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const baseAlpha = Math.random() * 0.7 + 0.2;
      return {
        x,
        y,
        originX: x,
        originY: y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.2 + 0.8,
        color: COSMIC_COLORS[Math.floor(Math.random() * COSMIC_COLORS.length)],
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.03 + 0.01,
        pulseVal: Math.random() * Math.PI * 2,
      };
    });

    const spawnShootingStar = () => {
      const startX = Math.random() * width;
      const startY = Math.random() * (height / 2);
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 80 + 60,
        speed: Math.random() * 12 + 10,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg
        opacity: 1,
        active: true,
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      // Shooting stars logic
      shootingStarTimer++;
      if (shootingStarTimer > 180 && Math.random() > 0.8) {
        spawnShootingStar();
        shootingStarTimer = 0;
      }

      // Draw shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        if (!s.active) continue;

        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity -= 0.015;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, 'rgba(45, 212, 191, 0)');
        grad.addColorStop(0.7, `rgba(129, 140, 248, ${s.opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();

        if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
          shootingStars.splice(i, 1);
        }
      }

      // Cursor Aurora Radial Glow
      if (mouse.isHovering) {
        const glowGradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius,
        );
        glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.12)');
        glowGradient.addColorStop(0.4, 'rgba(45, 212, 191, 0.05)');
        glowGradient.addColorStop(1, 'rgba(5, 6, 15, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Constellation Lines near mouse & between close stars
      if (mouse.isHovering) {
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          const dMouse = Math.hypot(mouse.x - p1.x, mouse.y - p1.y);

          if (dMouse < mouse.radius) {
            // Line from cursor to star
            const alpha = (1 - dMouse / mouse.radius) * 0.35;
            ctx.strokeStyle = `rgba(45, 212, 191, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();

            // Connect nearby stars into celestial constellation shapes
            for (let j = i + 1; j < particles.length; j++) {
              const p2 = particles[j];
              const dStars = Math.hypot(p1.x - p2.x, p1.y - p2.y);
              if (dStars < 85) {
                const lineAlpha =
                  (1 - dStars / 85) * (1 - dMouse / mouse.radius) * 0.25;
                ctx.strokeStyle = `rgba(129, 140, 248, ${lineAlpha})`;
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // Update & Draw Stars
      particles.forEach((p) => {
        // Star twinkling pulse
        p.pulseVal += p.pulseSpeed;
        const twinkle = Math.sin(p.pulseVal) * 0.3;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gravity pull towards mouse
        if (mouse.isHovering) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouse.radius && dist > 8) {
            const force = (1 - dist / mouse.radius) * 2;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
            p.alpha = Math.min(
              1,
              p.baseAlpha + (1 - dist / mouse.radius) * 0.6,
            );
          } else {
            p.alpha += (p.baseAlpha - p.alpha) * 0.05;
          }
        }

        const currentAlpha = Math.max(0.1, Math.min(1, p.alpha + twinkle));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${currentAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color}0.9)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Update & Draw Stardust Sparks from Click / Movement
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.vx *= 0.95;
        spark.vy *= 0.95;
        spark.alpha -= 1 / spark.life;

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fillStyle = `${spark.color}${Math.max(0, spark.alpha)})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `${spark.color}1)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (spark.alpha <= 0) {
          sparks.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[1]"
      aria-hidden="true"
    />
  );
}
