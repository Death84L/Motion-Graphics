import React from 'react';
import { KeyframePoint } from '../../types';
import { evaluateGraphAtTime } from '../../utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../../../../core/derivatives/derivativeEvaluation';

interface CanvasTelemetryHUDProps {
  hoverTime: number | null;
  hoverX: number;
  hoverY: number;
  keyframes: KeyframePoint[];
  width: number;
  height: number;
}

export function CanvasTelemetryHUD({
  hoverTime,
  hoverX,
  hoverY,
  keyframes,
  width,
  height,
}: CanvasTelemetryHUDProps) {
  if (hoverTime === null || keyframes.length < 2) return null;

  const value = evaluateGraphAtTime(keyframes, hoverTime);
  const derivative = evaluateDerivativeAtTime(keyframes, hoverTime);

  const hudX = Math.max(10, Math.min(width - 190, hoverX + 16));
  const hudY = Math.max(10, Math.min(height - 130, hoverY - 60));

  return (
    <foreignObject
      x={hudX}
      y={hudY}
      width={180}
      height={115}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <div
        style={{
          background: 'rgba(10, 15, 29, 0.92)',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '8px 10px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: 3 }}>
          <span>FRAME</span>
          <strong style={{ color: '#f8fafc' }}>{hoverTime.toFixed(1)}f</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Value:</span>
          <strong style={{ color: '#38bdf8' }}>{value.toFixed(1)}%</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Velocity:</span>
          <strong style={{ color: derivative.velocity >= 0 ? '#10b981' : '#f43f5e' }}>
            {derivative.velocity >= 0 ? '+' : ''}{derivative.velocity.toFixed(1)}%/s
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Speed:</span>
          <strong style={{ color: '#f59e0b' }}>{derivative.speed.toFixed(1)}%/s</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#64748b' }}>Accel:</span>
          <strong style={{ color: '#a855f7' }}>
            {derivative.acceleration >= 0 ? '+' : ''}{derivative.acceleration.toFixed(1)}%/s²
          </strong>
        </div>
      </div>
    </foreignObject>
  );
}
