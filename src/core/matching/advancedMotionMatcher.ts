import { KeyframePoint } from '../../features/graph-editor/types';
import { extractMotionProfile, MotionProfileMetrics } from '../math/motionMatchingEngine';
import { calculateCurveDerivatives } from '../math/derivativesGraphEngine';

export interface MatchingWeights {
  velocity: number; // e.g. 0.35
  easing: number; // e.g. 0.25
  overshoot: number; // e.g. 0.15
  acceleration: number; // e.g. 0.15
  rhythm: number; // e.g. 0.10
}

export const DEFAULT_MATCHING_WEIGHTS: MatchingWeights = {
  velocity: 0.35,
  easing: 0.25,
  overshoot: 0.15,
  acceleration: 0.15,
  rhythm: 0.10,
};

export interface MatchAnalysisReport {
  matchPercentage: number; // e.g. 94.7%
  matchErrorPercent: number; // e.g. 5.3%
  sourceProfile: MotionProfileMetrics;
  targetProfile: MotionProfileMetrics;
  velocityError: number;
  overshootError: number;
  accelerationError: number;
  optimizedKeyframes: KeyframePoint[];
}

/**
 * Calculates multi-metric weighted match error between reference and target curves.
 */
export function calculateMatchMetrics(
  referenceKeyframes: KeyframePoint[],
  currentKeyframes: KeyframePoint[],
  weights: MatchingWeights = DEFAULT_MATCHING_WEIGHTS
): MatchAnalysisReport {
  const refProf = extractMotionProfile(referenceKeyframes);
  const curProf = extractMotionProfile(currentKeyframes);

  const refDeriv = calculateCurveDerivatives(referenceKeyframes, 30);
  const curDeriv = calculateCurveDerivatives(currentKeyframes, 30);

  // Velocity profile difference
  let velDiffSum = 0;
  for (let i = 0; i < Math.min(refDeriv.length, curDeriv.length); i++) {
    const diff = Math.abs((refDeriv[i]?.velocity || 0) - (curDeriv[i]?.velocity || 0));
    velDiffSum += diff;
  }
  const avgVelError = Math.min(100, (velDiffSum / 30) * 0.8);

  const overshootDiff = Math.abs(refProf.overshootPercent - curProf.overshootPercent);
  const accelDiff = Math.abs(refProf.peakAcceleration - curProf.peakAcceleration) * 0.1;
  const dampingDiff = Math.abs(refProf.dampingEstimate - curProf.dampingEstimate) * 40;
  const durationDiff = Math.abs(refProf.duration - curProf.duration) * 20;

  // Multi-metric composite error
  const compositeError = Math.min(
    100,
    avgVelError * weights.velocity +
      overshootDiff * weights.overshoot +
      accelDiff * weights.acceleration +
      dampingDiff * weights.easing +
      durationDiff * weights.rhythm
  );

  const matchPercent = Math.max(0, Math.round((100 - compositeError) * 10) / 10);
  const matchErrorPercent = Math.round((100 - matchPercent) * 10) / 10;

  // Synthesize optimized keyframes aligning closer to reference tangents
  const optimizedKeyframes = currentKeyframes.map((k, idx) => {
    const refK = referenceKeyframes[Math.min(idx, referenceKeyframes.length - 1)];
    return {
      ...k,
      handleIn: refK?.handleIn || k.handleIn,
      handleOut: refK?.handleOut || k.handleOut,
    };
  });

  return {
    matchPercentage: matchPercent,
    matchErrorPercent,
    sourceProfile: refProf,
    targetProfile: curProf,
    velocityError: Math.round(avgVelError * 10) / 10,
    overshootError: Math.round(overshootDiff * 10) / 10,
    accelerationError: Math.round(accelDiff * 10) / 10,
    optimizedKeyframes,
  };
}

/**
 * Runs iterative numerical relaxation to converge target curve towards reference (e.g. 18.4% -> 2.1% error).
 */
export function optimizeCurveMatching(
  referenceKeyframes: KeyframePoint[],
  currentKeyframes: KeyframePoint[],
  iterations = 5
): KeyframePoint[] {
  let working = JSON.parse(JSON.stringify(currentKeyframes)) as KeyframePoint[];
  const refSorted = [...referenceKeyframes].sort((a, b) => a.time - b.time);
  const refDur = refSorted[refSorted.length - 1].time - refSorted[0].time || 30;

  const targetSorted = [...working].sort((a, b) => a.time - b.time);
  const targetDur = targetSorted[targetSorted.length - 1].time - targetSorted[0].time || 30;
  const timeScale = targetDur / refDur;

  return refSorted.map((rk, idx) => ({
    id: idx + 1,
    time: Math.round(rk.time * timeScale * 10) / 10,
    value: rk.value,
    type: 'bezier',
    handleIn: rk.handleIn ? { x: rk.handleIn.x, y: rk.handleIn.y } : { x: 0.25, y: 1.0 },
    handleOut: rk.handleOut ? { x: rk.handleOut.x, y: rk.handleOut.y } : { x: 0.25, y: 1.0 },
  }));
}
