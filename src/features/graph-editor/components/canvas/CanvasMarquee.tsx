import React from 'react';

interface CanvasMarqueeProps {
  marquee: {
    type: 'box' | 'lasso';
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    points?: { x: number; y: number }[];
  } | null;
}

export function CanvasMarquee({ marquee }: CanvasMarqueeProps) {
  if (!marquee) return null;

  if (marquee.type === 'box') {
    const x = Math.min(marquee.startX, marquee.currentX);
    const y = Math.min(marquee.startY, marquee.currentY);
    const width = Math.abs(marquee.currentX - marquee.startX);
    const height = Math.abs(marquee.currentY - marquee.startY);

    return (
      <g className="canvas-marquee" style={{ pointerEvents: 'none' }}>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="rgba(56, 189, 248, 0.12)"
          stroke="#38bdf8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          rx={4}
        />
      </g>
    );
  }

  if (marquee.type === 'lasso' && marquee.points && marquee.points.length > 1) {
    const d = marquee.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    return (
      <g className="canvas-marquee" style={{ pointerEvents: 'none' }}>
        <path
          d={d}
          fill="rgba(56, 189, 248, 0.12)"
          stroke="#38bdf8"
          strokeWidth={1.5}
          strokeDasharray="4 4"
        />
      </g>
    );
  }

  return null;
}
