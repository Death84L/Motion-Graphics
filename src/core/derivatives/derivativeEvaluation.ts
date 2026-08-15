import { KeyframePoint, GraphMode } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface DerivativeEvaluation {
  value: number;
  velocity: number;
  speed: number;
  acceleration: number;
  jerk: number;
}

/**
 * Numerically computes 1st, 2nd, and 3rd derivatives at a given time using central finite differences.
 */
export function evaluateDerivativeAtTime(
  keyframes: KeyframePoint[],
  time: number,
  dt = 0.1
): DerivativeEvaluation {
  const t = Math.max(0, Math.min(100, time));
  const tPrev = Math.max(0, t - dt);
  const tNext = Math.min(100, t + dt);
  const tPrev2 = Math.max(0, t - 2 * dt);
  const tNext2 = Math.min(100, t + 2 * dt);

  const v = evaluateGraphAtTime(keyframes, t);
  const vPrev = evaluateGraphAtTime(keyframes, tPrev);
  const vNext = evaluateGraphAtTime(keyframes, tNext);
  const vPrev2 = evaluateGraphAtTime(keyframes, tPrev2);
  const vNext2 = evaluateGraphAtTime(keyframes, tNext2);

  const actualDt1 = tNext - tPrev || 0.001;
  const actualDt2 = (tNext - t) * (t - tPrev) || 0.0001;

  // 1st derivative (velocity) in %/frame
  const velocity = (vNext - vPrev) / actualDt1;

  // 2nd derivative (acceleration) in %/frame²
  const acceleration = (vNext - 2 * v + vPrev) / actualDt2;

  // 3rd derivative (jerk) in %/frame³
  const jerk = (vNext2 - 2 * vNext + 2 * vPrev - vPrev2) / (2 * Math.pow(dt, 3) || 0.001);

  return {
    value: v,
    velocity,
    speed: Math.abs(velocity),
    acceleration,
    jerk,
  };
}

/**
 * Returns the evaluated number matching the active Graph Mode.
 */
export function evaluateModeValue(
  keyframes: KeyframePoint[],
  time: number,
  mode: GraphMode
): number {
  if (mode === 'value' || mode === 'time-remap') {
    return evaluateGraphAtTime(keyframes, time);
  }

  const d = evaluateDerivativeAtTime(keyframes, time);
  if (mode === 'velocity') return d.velocity;
  if (mode === 'speed') return d.speed;
  if (mode === 'acceleration') return d.acceleration;
  if (mode === 'jerk') return d.jerk;
  return d.value;
}

/**
 * Computes dynamic min and max range bounds for the current graph mode.
 */
export function computeGraphModeBounds(
  keyframes: KeyframePoint[],
  mode: GraphMode
): { min: number; max: number; unit: string } {
  if (mode === 'value' || mode === 'time-remap') {
    return { min: 0, max: 100, unit: '%' };
  }

  const samples: number[] = [];
  for (let t = 0; t <= 100; t += 1) {
    samples.push(evaluateModeValue(keyframes, t, mode));
  }

  const minVal = Math.min(...samples);
  const maxVal = Math.max(...samples);

  if (mode === 'velocity') {
    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal), 2);
    return { min: -absMax * 1.2, max: absMax * 1.2, unit: '%/s' };
  }

  if (mode === 'speed') {
    const maxSpeed = Math.max(maxVal, 2);
    return { min: 0, max: maxSpeed * 1.2, unit: '%/s' };
  }

  if (mode === 'acceleration') {
    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal), 5);
    return { min: -absMax * 1.25, max: absMax * 1.25, unit: '%/s²' };
  }

  if (mode === 'jerk') {
    const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal), 10);
    return { min: -absMax * 1.3, max: absMax * 1.3, unit: '%/s³' };
  }

  return { min: 0, max: 100, unit: '%' };
}
