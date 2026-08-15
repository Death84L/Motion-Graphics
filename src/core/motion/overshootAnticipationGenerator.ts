import { KeyframePoint } from '../../features/graph-editor/types';
import { computeAutoTangents } from '../math/tangentMath';

export interface OvershootMotionConfig {
  anticipationPercent: number; // e.g. 10% backwards wind-up
  overshootPercent: number; // e.g. 15% past target
  reboundPercent: number; // e.g. 5% rebound
  durationFrames: number; // total frames, e.g. 60
  startValue: number; // default 0%
  endValue: number; // default 100%
}

export const DEFAULT_OVERSHOOT_CONFIG: OvershootMotionConfig = {
  anticipationPercent: 12,
  overshootPercent: 16,
  reboundPercent: 6,
  durationFrames: 60,
  startValue: 0,
  endValue: 100,
};

/**
 * 1-Click Generator: Builds a complete 5-point organic motion trajectory:
 * Windup (Anticipation) -> Acceleration -> Primary Overshoot -> Secondary Rebound -> Perfect Settle.
 */
export function generateAnticipationOvershootCurve(
  config: OvershootMotionConfig = DEFAULT_OVERSHOOT_CONFIG
): KeyframePoint[] {
  const { anticipationPercent, overshootPercent, reboundPercent, startValue, endValue } = config;
  const deltaV = endValue - startValue;

  const keyframes: KeyframePoint[] = [
    // 1. Initial State
    {
      id: 9001,
      time: 0,
      value: startValue,
      type: 'bezier',
      ease: 'easeInOut',
    },
    // 2. Anticipation Wind-up (moves backward)
    {
      id: 9002,
      time: 15,
      value: Math.round((startValue - deltaV * (anticipationPercent / 100)) * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    },
    // 3. Primary Overshoot Peak (shoots past endValue)
    {
      id: 9003,
      time: 55,
      value: Math.round((endValue + deltaV * (overshootPercent / 100)) * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    },
    // 4. Secondary Rebound Dip
    {
      id: 9004,
      time: 78,
      value: Math.round((endValue - deltaV * (reboundPercent / 100)) * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    },
    // 5. Final Rest Settle
    {
      id: 9005,
      time: 100,
      value: endValue,
      type: 'bezier',
      ease: 'easeInOut',
    },
  ];

  // Auto compute smooth Bezier handles for realistic fluid organic elasticity
  return keyframes.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.35);
    return {
      ...kf,
      handleIn,
      handleOut,
      symmetrical: true,
    };
  });
}
