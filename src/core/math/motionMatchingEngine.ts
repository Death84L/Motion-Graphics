import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateCurveDerivatives } from './derivativesGraphEngine';

export interface MotionProfileMetrics {
  duration: number;
  peakVelocity: number;
  peakAcceleration: number;
  overshootPercent: number;
  settlingTimeSec: number;
  energyScore: number;
  dampingEstimate: number;
}

/**
 * Analyzes kinematic signature of a curve to extract its physical motion feel.
 */
export function extractMotionProfile(keyframes: KeyframePoint[]): MotionProfileMetrics {
  if (keyframes.length < 2) {
    return { duration: 1, peakVelocity: 0, peakAcceleration: 0, overshootPercent: 0, settlingTimeSec: 1, energyScore: 50, dampingEstimate: 0.5 };
  }

  const duration = Math.max(0.01, keyframes[keyframes.length - 1].time - keyframes[0].time);
  const derivatives = calculateCurveDerivatives(keyframes, 100);

  let maxVel = 0;
  let maxAcc = 0;
  let maxVal = keyframes[0].value;
  let minVal = keyframes[0].value;
  const startVal = keyframes[0].value;
  const endVal = keyframes[keyframes.length - 1].value;
  const deltaVal = endVal - startVal;

  derivatives.forEach((d) => {
    maxVel = Math.max(maxVel, Math.abs(d.velocity));
    maxAcc = Math.max(maxAcc, Math.abs(d.acceleration));
    maxVal = Math.max(maxVal, d.value);
    minVal = Math.min(minVal, d.value);
  });

  let overshootPercent = 0;
  if (deltaVal > 0 && maxVal > endVal) {
    overshootPercent = ((maxVal - endVal) / Math.abs(deltaVal)) * 100;
  } else if (deltaVal < 0 && minVal < endVal) {
    overshootPercent = ((endVal - minVal) / Math.abs(deltaVal)) * 100;
  }

  const energyScore = Math.min(100, Math.round((maxVel / (duration || 1)) * 0.4));
  const dampingEstimate = overshootPercent > 0 ? Math.max(0.1, 1 - overshootPercent / 100) : 0.8;

  return {
    duration: Math.round(duration * 100) / 100,
    peakVelocity: Math.round(maxVel * 10) / 10,
    peakAcceleration: Math.round(maxAcc * 10) / 10,
    overshootPercent: Math.round(overshootPercent),
    settlingTimeSec: Math.round(duration * 0.85 * 100) / 100,
    energyScore,
    dampingEstimate: Math.round(dampingEstimate * 100) / 100,
  };
}

/**
 * Transfers the kinetic feel and easing characteristics of source curve A onto target curve B.
 */
export function transferMotionFeel(
  sourceKeyframes: KeyframePoint[],
  targetKeyframes: KeyframePoint[],
  matchStrength = 1.0 // 0 to 1.0
): KeyframePoint[] {
  if (sourceKeyframes.length < 2 || targetKeyframes.length < 2) return targetKeyframes;

  const srcProfile = extractMotionProfile(sourceKeyframes);
  const targetStartT = targetKeyframes[0].time;
  const targetStartVal = targetKeyframes[0].value;
  const targetEndVal = targetKeyframes[targetKeyframes.length - 1].value;
  const targetDelta = targetEndVal - targetStartVal;

  // Remap source keyframes proportional to target value range and timing
  const srcStartT = sourceKeyframes[0].time;
  const srcDur = srcProfile.duration;
  const srcStartVal = sourceKeyframes[0].value;
  const srcEndVal = sourceKeyframes[sourceKeyframes.length - 1].value;
  const srcDelta = srcEndVal - srcStartVal || 1;

  return sourceKeyframes.map((k, idx) => {
    const normT = (k.time - srcStartT) / srcDur;
    const mappedT = targetStartT + normT * (srcProfile.duration * matchStrength + (targetKeyframes[targetKeyframes.length - 1].time - targetStartT) * (1 - matchStrength));
    const normVal = (k.value - srcStartVal) / srcDelta;
    const mappedVal = targetStartVal + normVal * targetDelta;

    const origK = targetKeyframes[Math.min(idx, targetKeyframes.length - 1)];

    return {
      id: idx + 1,
      time: Math.round(mappedT * 100) / 100,
      value: Math.round(mappedVal * 100) / 100,
      type: 'bezier',
      ease: k.ease,
      handleIn: {
        x: k.handleIn ? k.handleIn.x : origK.handleIn?.x ?? 0.25,
        y: k.handleIn ? k.handleIn.y : origK.handleIn?.y ?? 0.25,
      },
      handleOut: {
        x: k.handleOut ? k.handleOut.x : origK.handleOut?.x ?? 0.25,
        y: k.handleOut ? k.handleOut.y : origK.handleOut?.y ?? 0.25,
      },
    };
  });
}
