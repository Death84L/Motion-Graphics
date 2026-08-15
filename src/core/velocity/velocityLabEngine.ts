import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateCurveDerivatives, DerivativeDataPoint } from '../math/derivativesGraphEngine';

export interface VelocityAnalysisSummary {
  peakVelocity: number; // e.g. 3.42
  averageVelocity: number; // e.g. 1.42
  peakAcceleration: number; // e.g. 8.2
  jerkScore: number; // e.g. 11
  smoothnessScore: number; // e.g. 93
  zeroVelocityCrossingFrames: number[];
  discontinuityCount: number;
}

/**
 * Calculates comprehensive velocity, acceleration, and jerk statistics for a keyframe curve.
 */
export function analyzeVelocityProfile(
  keyframes: KeyframePoint[],
  sampleCount = 60
): { derivatives: DerivativeDataPoint[]; summary: VelocityAnalysisSummary } {
  const derivatives = calculateCurveDerivatives(keyframes, sampleCount);

  if (derivatives.length === 0) {
    return {
      derivatives: [],
      summary: {
        peakVelocity: 0,
        averageVelocity: 0,
        peakAcceleration: 0,
        jerkScore: 0,
        smoothnessScore: 100,
        zeroVelocityCrossingFrames: [],
        discontinuityCount: 0,
      },
    };
  }

  const velocities = derivatives.map((d) => Math.abs(d.velocity));
  const accelerations = derivatives.map((d) => Math.abs(d.acceleration));
  const jerks = derivatives.map((d) => Math.abs(d.jerk));

  const peakVel = Math.max(...velocities);
  const avgVel = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const peakAccel = Math.max(...accelerations);
  const maxJerk = Math.max(...jerks);

  // Find zero crossings
  const zeroCrossings: number[] = [];
  let discontinuities = 0;
  for (let i = 1; i < derivatives.length; i++) {
    if (derivatives[i - 1].velocity * derivatives[i].velocity < 0) {
      zeroCrossings.push(derivatives[i].time);
    }
    if (Math.abs(derivatives[i].jerk) > 250) {
      discontinuities++;
    }
  }

  const smoothnessScore = Math.max(0, Math.min(100, Math.round(100 - maxJerk * 0.1)));

  return {
    derivatives,
    summary: {
      peakVelocity: Math.round(peakVel * 100) / 100,
      averageVelocity: Math.round(avgVel * 100) / 100,
      peakAcceleration: Math.round(peakAccel * 100) / 100,
      jerkScore: Math.round(maxJerk * 10) / 10,
      smoothnessScore,
      zeroVelocityCrossingFrames: zeroCrossings,
      discontinuityCount: discontinuities,
    },
  };
}

/**
 * Normalizes peak velocity to a target value (e.g. 3.42 -> 2.00) by adjusting Bézier handle weights.
 */
export function normalizeVelocityPeak(
  keyframes: KeyframePoint[],
  targetPeakVelocity = 2.0
): KeyframePoint[] {
  const { summary } = analyzeVelocityProfile(keyframes);
  if (summary.peakVelocity <= 0) return keyframes;

  const ratio = Math.min(1.5, Math.max(0.3, targetPeakVelocity / summary.peakVelocity));

  return keyframes.map((k) => ({
    ...k,
    handleIn: k.handleIn ? { x: Math.min(0.9, k.handleIn.x * ratio), y: k.handleIn.y } : undefined,
    handleOut: k.handleOut ? { x: Math.min(0.9, k.handleOut.x * ratio), y: k.handleOut.y } : undefined,
  }));
}

/**
 * Clamps maximum velocity to prevent harsh jarring speed spikes.
 */
export function clampVelocityProfile(
  keyframes: KeyframePoint[],
  maxVelocityCap = 2.5
): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    handleIn: k.handleIn ? { x: Math.min(0.5, k.handleIn.x), y: Math.min(maxVelocityCap * 0.5, k.handleIn.y) } : undefined,
    handleOut: k.handleOut ? { x: Math.min(0.5, k.handleOut.x), y: Math.min(maxVelocityCap * 0.5, k.handleOut.y) } : undefined,
  }));
}

/**
 * Velocity-preserving retiming: changes duration from origMs to targetMs while maintaining relative acceleration shape.
 */
export function retimePreservingVelocityCharacter(
  keyframes: KeyframePoint[],
  targetDurationMs: number
): KeyframePoint[] {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const origDur = sorted[sorted.length - 1].time - sorted[0].time || 30;
  const targetDurFrames = (targetDurationMs / 1000) * 30;
  const scale = targetDurFrames / origDur;

  return sorted.map((k) => ({
    ...k,
    time: Math.round(k.time * scale * 10) / 10,
    handleIn: k.handleIn ? { x: k.handleIn.x, y: k.handleIn.y } : undefined,
    handleOut: k.handleOut ? { x: k.handleOut.x, y: k.handleOut.y } : undefined,
  }));
}
