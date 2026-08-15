import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface CurvaturePoint {
  time: number;
  value: number;
  curvature: number; // kappa >= 0
  radiusOfCurvature: number; // 1 / kappa
  sharpnessCategory: 'flat' | 'smooth' | 'sharp' | 'cusp';
}

/**
 * Computes geometric curvature kappa(t) along the motion curve.
 * kappa = |y''| / (1 + y'²)^(3/2)
 */
export function evaluateCurvatureAtTime(
  keyframes: KeyframePoint[],
  time: number
): CurvaturePoint {
  const d = evaluateDerivativeAtTime(keyframes, time);
  const dy = d.velocity;
  const d2y = d.acceleration;

  const denominator = Math.pow(1 + dy * dy, 1.5);
  const kappa = denominator !== 0 ? Math.abs(d2y) / denominator : 0;
  const radius = kappa > 0.0001 ? 1 / kappa : 9999;

  let sharpnessCategory: 'flat' | 'smooth' | 'sharp' | 'cusp' = 'smooth';
  if (kappa < 0.05) sharpnessCategory = 'flat';
  else if (kappa < 0.4) sharpnessCategory = 'smooth';
  else if (kappa < 1.2) sharpnessCategory = 'sharp';
  else sharpnessCategory = 'cusp';

  return {
    time,
    value: d.value,
    curvature: Math.round(kappa * 1000) / 1000,
    radiusOfCurvature: Math.round(radius * 10) / 10,
    sharpnessCategory,
  };
}

/**
 * Samples curvature points across the entire timeline.
 */
export function sampleCurveCurvature(
  keyframes: KeyframePoint[],
  samples = 100
): CurvaturePoint[] {
  const result: CurvaturePoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const time = (i / samples) * 100;
    result.push(evaluateCurvatureAtTime(keyframes, time));
  }
  return result;
}
