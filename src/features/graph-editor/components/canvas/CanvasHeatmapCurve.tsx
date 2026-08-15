import React from 'react';
import { KeyframePoint } from '../../types';
import { evaluateGraphAtTime } from '../../utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../../../../core/derivatives/derivativeEvaluation';
import { evaluateCurvatureAtTime } from '../../../../core/analysis/curvatureMath';

export type HeatmapMetric = 'speed' | 'acceleration' | 'jerk' | 'curvature';

interface CanvasHeatmapCurveProps {
  keyframes: KeyframePoint[];
  metric: HeatmapMetric;
  enabled: boolean;
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
}

export function CanvasHeatmapCurve({
  keyframes,
  metric,
  enabled,
  toSvgPoint,
}: CanvasHeatmapCurveProps) {
  if (!enabled || keyframes.length < 2) return null;

  const samples = 80;
  const segments: { d: string; color: string }[] = [];

  for (let i = 0; i < samples; i++) {
    const t1 = (i / samples) * 100;
    const t2 = ((i + 1) / samples) * 100;

    const v1 = evaluateGraphAtTime(keyframes, t1);
    const v2 = evaluateGraphAtTime(keyframes, t2);

    const pt1 = toSvgPoint({ time: t1, value: v1 });
    const pt2 = toSvgPoint({ time: t2, value: v2 });

    // Evaluate metric intensity
    let intensity = 0;
    if (metric === 'speed') {
      const s = evaluateDerivativeAtTime(keyframes, (t1 + t2) / 2).speed;
      intensity = Math.min(1, s / 3.0);
    } else if (metric === 'acceleration') {
      const a = Math.abs(evaluateDerivativeAtTime(keyframes, (t1 + t2) / 2).acceleration);
      intensity = Math.min(1, a / 0.5);
    } else if (metric === 'jerk') {
      const j = Math.abs(evaluateDerivativeAtTime(keyframes, (t1 + t2) / 2).jerk);
      intensity = Math.min(1, j / 50.0);
    } else {
      const k = evaluateCurvatureAtTime(keyframes, (t1 + t2) / 2).curvature;
      intensity = Math.min(1, k / 0.8);
    }

    // Map 0 -> Cyan (190 deg), 0.5 -> Yellow (50 deg), 1.0 -> Hot Pink (330 deg)
    const hue = 190 - intensity * 220;
    const color = `hsl(${Math.max(0, hue)}, 95%, 60%)`;

    segments.push({
      d: `M ${pt1.x.toFixed(1)} ${pt1.y.toFixed(1)} L ${pt2.x.toFixed(1)} ${pt2.y.toFixed(1)}`,
      color,
    });
  }

  return (
    <g className="canvas-heatmap-curve" style={{ pointerEvents: 'none' }}>
      {segments.map((seg, idx) => (
        <path
          key={idx}
          d={seg.d}
          fill="none"
          stroke={seg.color}
          strokeWidth={4.5}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}
