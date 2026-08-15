import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface ComparisonReport {
  maxDeviation: number;
  averageDeviation: number; // RMSE
  peakVelocityDiff: number;
  peakAccelDiff: number;
  keyframeCountDiff: number;
  durationDiff: number;
  healthScoreA: number;
  healthScoreB: number;
  similarityPercentage: number; // 0 to 100%
  differencePoints: { time: number; delta: number; valA: number; valB: number }[];
}

/**
 * Computes deep differential comparison between Animation Curve A and Animation Curve B.
 */
export function compareAnimationCurves(
  curveA: KeyframePoint[],
  curveB: KeyframePoint[],
  samples = 100
): ComparisonReport {
  if (curveA.length === 0 || curveB.length === 0) {
    return {
      maxDeviation: 0,
      averageDeviation: 0,
      peakVelocityDiff: 0,
      peakAccelDiff: 0,
      keyframeCountDiff: Math.abs(curveA.length - curveB.length),
      durationDiff: 0,
      healthScoreA: 85,
      healthScoreB: 85,
      similarityPercentage: 100,
      differencePoints: [],
    };
  }

  const diffPoints: { time: number; delta: number; valA: number; valB: number }[] = [];
  let sumSqDiff = 0;
  let maxDev = 0;

  let peakVelA = 0;
  let peakVelB = 0;
  let peakAccA = 0;
  let peakAccB = 0;

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const vA = evaluateGraphAtTime(curveA, t);
    const vB = evaluateGraphAtTime(curveB, t);
    const diff = Math.abs(vA - vB);

    if (diff > maxDev) maxDev = diff;
    sumSqDiff += diff * diff;

    const derivA = evaluateDerivativeAtTime(curveA, t);
    const derivB = evaluateDerivativeAtTime(curveB, t);

    if (derivA.speed > peakVelA) peakVelA = derivA.speed;
    if (derivB.speed > peakVelB) peakVelB = derivB.speed;
    if (Math.abs(derivA.acceleration) > peakAccA) peakAccA = Math.abs(derivA.acceleration);
    if (Math.abs(derivB.acceleration) > peakAccB) peakAccB = Math.abs(derivB.acceleration);

    diffPoints.push({
      time: t,
      delta: Math.round(diff * 10) / 10,
      valA: Math.round(vA * 10) / 10,
      valB: Math.round(vB * 10) / 10,
    });
  }

  const rmse = Math.sqrt(sumSqDiff / (samples + 1));
  const similarity = Math.max(0, Math.min(100, Math.round(100 - (rmse / 100) * 100)));

  return {
    maxDeviation: Math.round(maxDev * 10) / 10,
    averageDeviation: Math.round(rmse * 10) / 10,
    peakVelocityDiff: Math.round(Math.abs(peakVelA - peakVelB) * 10) / 10,
    peakAccelDiff: Math.round(Math.abs(peakAccA - peakAccB) * 10) / 10,
    keyframeCountDiff: Math.abs(curveA.length - curveB.length),
    durationDiff: 0,
    healthScoreA: Math.min(98, Math.max(65, Math.round(100 - peakAccA / 500))),
    healthScoreB: Math.min(98, Math.max(65, Math.round(100 - peakAccB / 500))),
    similarityPercentage: similarity,
    differencePoints: diffPoints,
  };
}
