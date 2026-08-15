import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';
import { simplifyKeyframes } from '../math/rdpSimplifier';
import { smoothKeyframes } from '../math/smoothingAlgorithms';
import { applyEulerFilter } from '../math/eulerFilter';

export interface CurveIssue {
  id: string;
  type: 'redundant-key' | 'bad-tangent' | 'high-jerk' | 'overshoot-spike' | 'discontinuity';
  severity: 'warning' | 'error' | 'info';
  time: number;
  message: string;
  suggestedFix: string;
}

export interface CurveDiagnosticsReport {
  keyframeCount: number;
  segmentCount: number;
  durationFrames: number;
  peakVelocity: number;
  averageVelocity: number;
  peakAcceleration: number;
  peakJerk: number;
  smoothnessScore: number; // 0 to 100%
  velocityScore: number;
  jerkScore: number;
  overallScore: number; // e.g. 88/100
  redundantKeysCount: number;
  overshootPct: number;
  issues: CurveIssue[];
}

/**
 * Deterministic local algorithmic assistant and diagnostic analyzer (zero API cost).
 */
export function analyzeCurveHealthDiagnostics(keyframes: KeyframePoint[]): CurveDiagnosticsReport {
  if (!keyframes || keyframes.length < 2) {
    return {
      keyframeCount: keyframes.length,
      segmentCount: Math.max(0, keyframes.length - 1),
      durationFrames: 0,
      peakVelocity: 0,
      averageVelocity: 0,
      peakAcceleration: 0,
      peakJerk: 0,
      smoothnessScore: 100,
      velocityScore: 100,
      jerkScore: 100,
      overallScore: 95,
      redundantKeysCount: 0,
      overshootPct: 0,
      issues: [],
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const issues: CurveIssue[] = [];
  const duration = sorted[sorted.length - 1].time - sorted[0].time;

  // 1. Detect Redundant Collinear Keyframes
  let redundantCount = 0;
  for (let i = 1; i < sorted.length - 1; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const next = sorted[i + 1];

    const slope1 = (curr.value - prev.value) / (curr.time - prev.time || 1);
    const slope2 = (next.value - curr.value) / (next.time - curr.time || 1);

    if (Math.abs(slope1 - slope2) < 0.05) {
      redundantCount++;
      issues.push({
        id: `red-${curr.id}`,
        type: 'redundant-key',
        severity: 'info',
        time: curr.time,
        message: `Redundant keyframe at ${curr.time}f (collinear with neighbors)`,
        suggestedFix: 'Remove or simplify keyframe',
      });
    }
  }

  // 2. Kinematic Analysis across samples
  const samples = 60;
  let peakVel = 0;
  let sumVel = 0;
  let peakAccel = 0;
  let peakJerk = 0;

  for (let s = 0; s <= samples; s++) {
    const time = (s / samples) * 100;
    const deriv = evaluateDerivativeAtTime(sorted, time);

    if (deriv.speed > peakVel) peakVel = deriv.speed;
    sumVel += deriv.speed;
    if (Math.abs(deriv.acceleration) > peakAccel) peakAccel = Math.abs(deriv.acceleration);
    if (Math.abs(deriv.jerk) > peakJerk) peakJerk = Math.abs(deriv.jerk);

    if (Math.abs(deriv.jerk) > 400 && issues.length < 5) {
      issues.push({
        id: `jerk-${s}`,
        type: 'high-jerk',
        severity: 'warning',
        time: Math.round(time),
        message: `High jerk acceleration spike (${Math.round(Math.abs(deriv.jerk))} px/s³) at ${time.toFixed(1)}f`,
        suggestedFix: 'Apply gentle smoothing or continuous tangent',
      });
    }
  }

  const avgVel = Math.round((sumVel / (samples + 1)) * 10) / 10;

  // 3. Overshoot Detection
  const maxVal = Math.max(...sorted.map((k) => k.value));
  const endVal = sorted[sorted.length - 1].value;
  const overshootPct = endVal > 0 ? Math.max(0, Math.round(((maxVal - endVal) / endVal) * 100)) : 0;

  // 4. Calculate Scores
  const smoothnessScore = Math.max(50, Math.min(99, Math.round(100 - (peakJerk / 100) * 8)));
  const velocityScore = Math.max(60, Math.min(99, Math.round(100 - (peakVel / 800) * 10)));
  const jerkScore = Math.max(40, Math.min(99, Math.round(100 - (peakJerk / 250) * 15)));
  const overallScore = Math.round(smoothnessScore * 0.4 + velocityScore * 0.3 + jerkScore * 0.3);

  return {
    keyframeCount: sorted.length,
    segmentCount: sorted.length - 1,
    durationFrames: duration,
    peakVelocity: Math.round(peakVel * 10) / 10,
    averageVelocity: avgVel,
    peakAcceleration: Math.round(peakAccel * 10) / 10,
    peakJerk: Math.round(peakJerk * 10) / 10,
    smoothnessScore,
    velocityScore,
    jerkScore,
    overallScore,
    redundantKeysCount: redundantCount,
    overshootPct,
    issues: issues.slice(0, 6),
  };
}

/**
 * 1-Click Auto Fix for detected curve issues.
 */
export function autoFixCurveHealth(keyframes: KeyframePoint[]): KeyframePoint[] {
  const { keyframes: eulerFixed } = applyEulerFilter(keyframes);
  const simplified = simplifyKeyframes(eulerFixed, 1.2);
  const smoothed = smoothKeyframes(simplified, 0.4);
  return smoothed;
}
