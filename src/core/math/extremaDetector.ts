import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface CurveExtremaMarker {
  id: string;
  type: 'max' | 'min' | 'vel-peak' | 'zero-x' | 'accel-peak';
  time: number;
  value: number;
  label: string;
  color: string;
  associatedKeyframeId?: number;
}

/**
 * Automatically detects curve maxima, minima, velocity peaks, and zero crossings.
 */
export function detectCurveExtrema(
  keyframes: KeyframePoint[],
  sampleCount = 100
): CurveExtremaMarker[] {
  if (keyframes.length < 2) return [];

  const markers: CurveExtremaMarker[] = [];
  const samples: { time: number; value: number; velocity: number; acceleration: number }[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const time = (i / sampleCount) * 100;
    const value = evaluateGraphAtTime(keyframes, time);
    const d = evaluateDerivativeAtTime(keyframes, time);
    samples.push({ time, value, velocity: d.velocity, acceleration: d.acceleration });
  }

  // 1. Find Global Max & Min
  let maxSample = samples[0];
  let minSample = samples[0];

  for (const s of samples) {
    if (s.value > maxSample.value) maxSample = s;
    if (s.value < minSample.value) minSample = s;
  }

  markers.push({
    id: `extrema-max-${maxSample.time}`,
    type: 'max',
    time: Math.round(maxSample.time * 10) / 10,
    value: Math.round(maxSample.value * 10) / 10,
    label: `MAX (${maxSample.value.toFixed(1)}%)`,
    color: '#38bdf8',
  });

  markers.push({
    id: `extrema-min-${minSample.time}`,
    type: 'min',
    time: Math.round(minSample.time * 10) / 10,
    value: Math.round(minSample.value * 10) / 10,
    label: `MIN (${minSample.value.toFixed(1)}%)`,
    color: '#ec4899',
  });

  // 2. Find Peak Velocity & Zero Crossing
  let maxVelSample = samples[0];
  for (let i = 1; i < samples.length - 1; i++) {
    const curr = samples[i];
    const prev = samples[i - 1];
    const next = samples[i + 1];

    // Local peak velocity
    if (Math.abs(curr.velocity) > Math.abs(maxVelSample.velocity)) {
      maxVelSample = curr;
    }

    // Zero crossing in velocity (inflection point / directional reversal)
    if ((prev.velocity > 0 && next.velocity < 0) || (prev.velocity < 0 && next.velocity > 0)) {
      markers.push({
        id: `zero-x-${curr.time}`,
        type: 'zero-x',
        time: Math.round(curr.time * 10) / 10,
        value: Math.round(curr.value * 10) / 10,
        label: `ZERO-X (${curr.time.toFixed(0)}f)`,
        color: '#f59e0b',
      });
    }
  }

  if (Math.abs(maxVelSample.velocity) > 0.5) {
    markers.push({
      id: `vel-peak-${maxVelSample.time}`,
      type: 'vel-peak',
      time: Math.round(maxVelSample.time * 10) / 10,
      value: Math.round(maxVelSample.value * 10) / 10,
      label: `PEAK VEL (${maxVelSample.velocity > 0 ? '+' : ''}${maxVelSample.velocity.toFixed(1)}%/s)`,
      color: '#10b981',
    });
  }

  return markers;
}
