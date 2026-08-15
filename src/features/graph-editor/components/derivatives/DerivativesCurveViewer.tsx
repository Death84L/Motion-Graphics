import React, { useMemo } from 'react';
import { KeyframePoint } from '../../types';
import { calculateCurveDerivatives, DerivativeGraphType } from '../../../../core/math/derivativesGraphEngine';

interface DerivativesCurveViewerProps {
  keyframes: KeyframePoint[];
  graphType: DerivativeGraphType;
}

export function DerivativesCurveViewer({ keyframes, graphType }: DerivativesCurveViewerProps) {
  const points = useMemo(() => calculateCurveDerivatives(keyframes, 80), [keyframes]);

  if (graphType === 'value' || points.length === 0) return null;

  const width = 600;
  const height = 140;

  const values = points.map((p) =>
    graphType === 'velocity' ? p.velocity : graphType === 'acceleration' ? p.acceleration : p.jerk
  );

  const maxVal = Math.max(1, ...values.map(Math.abs));
  const strokeColor = graphType === 'velocity' ? '#38bdf8' : graphType === 'acceleration' ? '#f59e0b' : '#ec4899';

  const pathD = points
    .map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const val = graphType === 'velocity' ? p.velocity : graphType === 'acceleration' ? p.acceleration : p.jerk;
      const y = height / 2 - (val / maxVal) * (height * 0.4);
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        height: 80,
        background: 'rgba(9, 14, 26, 0.85)',
        backdropFilter: 'blur(6px)',
        border: `1px solid ${strokeColor}44`,
        borderRadius: 8,
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 9, fontWeight: 800, color: strokeColor, textTransform: 'uppercase' }}>
          {graphType} Derivative Curve (Max: ±{maxVal.toFixed(1)})
        </span>
        <span style={{ fontSize: 8, color: '#64748b' }}>d/dt numerical solver</span>
      </div>

      <svg width="100%" height="50" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Zero baseline */}
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
