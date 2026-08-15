import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface CurveDiagnosticIssue {
  id: string;
  type:
    | 'inflection'
    | 'local-max'
    | 'local-min'
    | 'velocity-peak'
    | 'acceleration-peak'
    | 'jerk-spike'
    | 'zero-crossing'
    | 'constant-velocity'
    | 'overshoot'
    | 'discontinuity';
  time: number;
  value: number;
  label: string;
  description: string;
  severity: 'info' | 'warning' | 'error';
  color: string;
}

/**
 * Runs a comprehensive algorithmic diagnostics scan on the curve.
 */
export function runCurveDiagnostics(
  keyframes: KeyframePoint[],
  sampleCount = 100
): CurveDiagnosticIssue[] {
  if (keyframes.length < 2) return [];

  const issues: CurveDiagnosticIssue[] = [];
  const samples: { time: number; value: number; velocity: number; acceleration: number; jerk: number }[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const time = (i / sampleCount) * 100;
    const value = evaluateGraphAtTime(keyframes, time);
    const d = evaluateDerivativeAtTime(keyframes, time);
    samples.push({ time, value, velocity: d.velocity, acceleration: d.acceleration, jerk: d.jerk });
  }

  // 1. Check Overshoot (< 0% or > 100%)
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    if (s.value > 102) {
      issues.push({
        id: `overshoot-max-${s.time}`,
        type: 'overshoot',
        time: s.time,
        value: s.value,
        label: `OVERSHOOT (${s.value.toFixed(1)}%)`,
        description: `Value exceeds 100% boundary target by +${(s.value - 100).toFixed(1)}%`,
        severity: 'warning',
        color: '#f59e0b',
      });
      break; // Report first peak overshoot
    } else if (s.value < -2) {
      issues.push({
        id: `overshoot-min-${s.time}`,
        type: 'overshoot',
        time: s.time,
        value: s.value,
        label: `UNDERSHOOT (${s.value.toFixed(1)}%)`,
        description: `Value dips below 0% floor target`,
        severity: 'warning',
        color: '#f59e0b',
      });
      break;
    }
  }

  // 2. Inflection Points & Jerk Spikes & Discontinuities
  for (let i = 1; i < samples.length - 1; i++) {
    const curr = samples[i];
    const prev = samples[i - 1];
    const next = samples[i + 1];

    // Inflection point: acceleration changes sign (d²V/dt² = 0)
    if ((prev.acceleration > 0 && next.acceleration < 0) || (prev.acceleration < 0 && next.acceleration > 0)) {
      issues.push({
        id: `inflection-${curr.time}`,
        type: 'inflection',
        time: curr.time,
        value: curr.value,
        label: `INFLECTION (${curr.time.toFixed(0)}f)`,
        description: `Curvature concavity reverses here (a=0)`,
        severity: 'info',
        color: '#38bdf8',
      });
    }

    // Jerk Spike (> 80 %/frame³)
    if (Math.abs(curr.jerk) > 80) {
      issues.push({
        id: `jerk-${curr.time}`,
        type: 'jerk-spike',
        time: curr.time,
        value: curr.value,
        label: `JERK SPIKE (${curr.time.toFixed(0)}f)`,
        description: `Sudden acceleration impulse causing unnatural motion`,
        severity: 'error',
        color: '#f43f5e',
      });
    }

    // Velocity Discontinuity
    if (Math.abs(next.velocity - prev.velocity) > 25) {
      issues.push({
        id: `discontinuity-${curr.time}`,
        type: 'discontinuity',
        time: curr.time,
        value: curr.value,
        label: `DISCONTINUITY (${curr.time.toFixed(0)}f)`,
        description: `Abrupt velocity step causing a noticeable visual pop`,
        severity: 'error',
        color: '#ef4444',
      });
    }
  }

  return issues;
}
