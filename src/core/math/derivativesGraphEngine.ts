import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type DerivativeGraphType = 'value' | 'velocity' | 'acceleration' | 'jerk';

export interface DerivativeDataPoint {
  time: number;
  value: number;
  velocity: number;
  acceleration: number;
  jerk: number;
}

/**
 * Calculates continuous Value, Velocity, Acceleration, and Jerk sample points
 * along a keyframe curve for deep kinematic inspection.
 */
export function calculateCurveDerivatives(
  keyframes: KeyframePoint[],
  sampleCount = 120,
  minTime?: number,
  maxTime?: number
): DerivativeDataPoint[] {
  if (keyframes.length < 2) return [];

  const startT = minTime ?? keyframes[0].time;
  const endT = maxTime ?? keyframes[keyframes.length - 1].time;
  const totalDur = Math.max(0.01, endT - startT);
  const dt = totalDur / sampleCount;

  const results: DerivativeDataPoint[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = startT + i * dt;

    // Numerical finite-difference sampling
    const eps = Math.min(0.005, dt * 0.25);
    const v0 = evaluateGraphAtTime(keyframes, Math.max(startT, t - eps));
    const v1 = evaluateGraphAtTime(keyframes, t);
    const v2 = evaluateGraphAtTime(keyframes, Math.min(endT, t + eps));

    // Velocity (dv/dt)
    const vel = (v2 - v0) / (2 * eps);

    // Acceleration (d²v/dt²)
    const acc = (v2 - 2 * v1 + v0) / (eps * eps);

    // Jerk (d³v/dt³) by taking a wider delta
    const vM2 = evaluateGraphAtTime(keyframes, Math.max(startT, t - 2 * eps));
    const vP2 = evaluateGraphAtTime(keyframes, Math.min(endT, t + 2 * eps));
    const jerk = (vP2 - 2 * v2 + 2 * v0 - vM2) / (2 * eps * eps * eps);

    results.push({
      time: Math.round(t * 1000) / 1000,
      value: Math.round(v1 * 100) / 100,
      velocity: Math.round(vel * 10) / 10,
      acceleration: Math.round(acc * 10) / 10,
      jerk: Math.round(jerk * 10) / 10,
    });
  }

  return results;
}
