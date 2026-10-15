'use client';

import { useEffect, useRef, memo } from 'react';

interface StarSpark {
  x: number;
  y: number;
  alpha: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  points: number;
}

function CosmicCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (isTouch || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -100, y: -100, isVisible: false };
    const starTrail: StarSpark[] = [];

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const palette = [
      '#ffffff',
      '#38bdf8',
      '#2dd4bf',
      '#fbbf24',
      '#f472b6',
      '#c084fc',
      '#e0e7ff',
    ];

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isVisible = true;

      // Spawn 1-2 sparkling 4-point stars on cursor movement
      for (let i = 0; i < 2; i++) {
        starTrail.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          alpha: 1,
          size: Math.random() * 6 + 4, // Star size
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          color: palette[Math.floor(Math.random() * palette.length)],
          points: Math.random() > 0.3 ? 4 : 5, // 4-pointed radiant cross star
        });
      }
    };

    const handleMouseLeave = () => {
      mouse.isVisible = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Draw radiant 4-point or 5-point sparkling star
    function drawStar(
      context: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string,
      rotation: number,
    ) {
      context.save();
      context.translate(cx, cy);
      context.rotate(rotation);

      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 8;

      let rot = (Math.PI / 2) * 3;
      let x = 0;
      let y = 0;
      const step = Math.PI / spikes;

      context.beginPath();
      context.moveTo(0, -outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = Math.cos(rot) * outerRadius;
        y = Math.sin(rot) * outerRadius;
        context.lineTo(x, y);
        rot += step;

        x = Math.cos(rot) * innerRadius;
        y = Math.sin(rot) * innerRadius;
        context.lineTo(x, y);
        rot += step;
      }

      context.lineTo(0, -outerRadius);
      context.closePath();
      context.fill();

      // Center bright flare pin
      context.fillStyle = '#ffffff';
      context.beginPath();
      context.arc(0, 0, innerRadius * 0.6, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }

    let animId: number;
    let lastFrame = -Infinity;

    const render = (now = performance.now()) => {
      if (document.hidden) return;
      if (now - lastFrame < 1000 / 30) {
        animId = requestAnimationFrame(render);
        return;
      }
      lastFrame = now;
      ctx.clearRect(0, 0, width, height);

      // Render & decay sparkling stars
      for (let i = starTrail.length - 1; i >= 0; i--) {
        const p = starTrail[i];
        p.alpha -= 0.03;
        p.size *= 0.97;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0 || p.size <= 0.8) {
          starTrail.splice(i, 1);
        } else {
          ctx.globalAlpha = p.alpha;
          drawStar(
            ctx,
            p.x,
            p.y,
            p.points,
            p.size,
            p.size * 0.28,
            p.color,
            p.rotation,
          );
        }
      }

      // Render leading glowing cross star at cursor position
      if (mouse.isVisible && mouse.x > 0 && mouse.y > 0) {
        ctx.globalAlpha = 1;
        const time = Date.now() * 0.004;
        drawStar(ctx, mouse.x, mouse.y, 4, 7.5, 2, '#38bdf8', time);
      }

      ctx.globalAlpha = 1;

      if (!document.hidden) {
        animId = requestAnimationFrame(render);
      }
    };

    const handleVisibility = () => {
      cancelAnimationFrame(animId);
      if (!document.hidden) animId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999] overflow-hidden"
    />
  );
}

export default memo(CosmicCursor);
