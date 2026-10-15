'use client';

import React, { useRef, useState } from 'react';

interface MagneticElementProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // 0.1 to 0.4
}

export default function MagneticElement({
  children,
  className = '',
  strength = 0.25,
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const dx = (e.clientX - centerX) * strength;
    const dy = (e.clientY - centerY) * strength;

    setPosition({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      role="presentation"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        transition:
          position.x === 0
            ? 'transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)'
            : 'transform 0.1s ease-out',
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </div>
  );
}
