import React from 'react';
import { KeyframePoint, GraphViewport } from '../../types';
import { generateSvgPath } from '../../utils/curveEvaluation';

interface CanvasMinimapProps {
  keyframes: KeyframePoint[];
  viewport: GraphViewport;
  onNavigate: (newX: number) => void;
}

export function CanvasMinimap({ keyframes, viewport, onNavigate }: CanvasMinimapProps) {
  const mmWidth = 140;
  const mmHeight = 50;

  const toMiniPoint = (pt: { time: number; value: number }) => ({
    x: (pt.time / 100) * (mmWidth - 12) + 6,
    y: mmHeight - 6 - (pt.value / 120) * (mmHeight - 12),
  });

  const miniPath = generateSvgPath(keyframes, toMiniPoint, 30);

  // Viewport window overlay on minimap
  const viewWidthFraction = Math.min(1, 1 / viewport.scaleX);
  const viewLeftFraction = Math.max(0, Math.min(1 - viewWidthFraction, -viewport.x / (900 * viewport.scaleX)));

  const winX = 6 + viewLeftFraction * (mmWidth - 12);
  const winW = Math.max(16, viewWidthFraction * (mmWidth - 12));

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        width: mmWidth,
        height: mmHeight,
        background: 'rgba(12, 18, 34, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #1e293b',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        pointerEvents: 'auto',
      }}
    >
      <svg width={mmWidth} height={mmHeight} style={{ display: 'block' }}>
        <path d={miniPath} fill="none" stroke="#38bdf8" strokeWidth={1.5} strokeOpacity={0.6} />

        {/* Viewport Lens */}
        <rect
          x={winX}
          y={4}
          width={winW}
          height={mmHeight - 8}
          fill="rgba(56, 189, 248, 0.15)"
          stroke="#38bdf8"
          strokeWidth={1}
          rx={3}
          style={{ cursor: 'grab' }}
        />
      </svg>
    </div>
  );
}
