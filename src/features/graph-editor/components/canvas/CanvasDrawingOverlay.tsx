import React from 'react';

interface CanvasDrawingOverlayProps {
  drawingPoints: { x: number; y: number }[];
}

export function CanvasDrawingOverlay({ drawingPoints }: CanvasDrawingOverlayProps) {
  if (drawingPoints.length < 2) return null;

  const pathD = drawingPoints.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  return (
    <g className="canvas-drawing-overlay" style={{ pointerEvents: 'none' }}>
      {/* Outer Glow */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(16, 185, 129, 0.3)"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Core Stroke */}
      <path
        d={pathD}
        fill="none"
        stroke="#10b981"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 3"
      />
    </g>
  );
}
