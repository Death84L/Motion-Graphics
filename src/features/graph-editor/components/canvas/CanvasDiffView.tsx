import React from 'react';
import { KeyframePoint } from '../../types';
import { evaluateGraphAtTime } from '../../utils/curveEvaluation';

interface CanvasDiffViewProps {
  originalKeyframes?: KeyframePoint[];
  currentKeyframes: KeyframePoint[];
  enabled: boolean;
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
}

export function CanvasDiffView({
  originalKeyframes,
  currentKeyframes,
  enabled,
  toSvgPoint,
}: CanvasDiffViewProps) {
  if (!enabled || !originalKeyframes || originalKeyframes.length < 2) return null;

  const samples = 80;
  const polyPoints: { x: number; y: number }[] = [];
  const returnPoints: { x: number; y: number }[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const vCurr = evaluateGraphAtTime(currentKeyframes, t);
    const vOrig = evaluateGraphAtTime(originalKeyframes, t);

    polyPoints.push(toSvgPoint({ time: t, value: vCurr }));
    returnPoints.unshift(toSvgPoint({ time: t, value: vOrig }));
  }

  const allPoints = [...polyPoints, ...returnPoints];
  const polyString = allPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <g className="canvas-diff-view" style={{ pointerEvents: 'none' }}>
      {/* Shaded Delta Difference Fill */}
      <polygon points={polyString} fill="rgba(244, 63, 94, 0.18)" stroke="#f43f5e" strokeWidth={0.8} strokeDasharray="3 3" />
    </g>
  );
}
