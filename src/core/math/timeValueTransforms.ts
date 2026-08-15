import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Scales the timing of selected keyframes by a factor relative to an origin frame.
 */
export function scaleTiming(
  keyframes: KeyframePoint[],
  scaleFactor: number,
  originTime = 0
): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    time: Math.max(0, Math.round((originTime + (k.time - originTime) * scaleFactor) * 10) / 10),
  }));
}

/**
 * Stretches or compresses keyframes to fit exactly within a target duration (0 to targetDuration).
 */
export function fitToDuration(
  keyframes: KeyframePoint[],
  targetDuration: number,
  startFrame = 0
): KeyframePoint[] {
  if (keyframes.length <= 1) return [...keyframes];

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const minT = sorted[0].time;
  const maxT = sorted[sorted.length - 1].time;
  const span = maxT - minT || 1;

  return sorted.map((k) => {
    const norm = (k.time - minT) / span;
    const newT = startFrame + norm * targetDuration;
    return {
      ...k,
      time: Math.round(newT * 10) / 10,
    };
  });
}

/**
 * Shifts all keyframes horizontally in time by deltaTime.
 */
export function offsetTime(keyframes: KeyframePoint[], deltaTime: number): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    time: Math.max(0, Math.round((k.time + deltaTime) * 10) / 10),
  }));
}

/**
 * Shifts all keyframes vertically in value by deltaValue.
 */
export function offsetValues(keyframes: KeyframePoint[], deltaValue: number): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    value: Math.round((k.value + deltaValue) * 10) / 10,
  }));
}

/**
 * Scales values around an origin (e.g. 50% or 0%).
 */
export function scaleValues(
  keyframes: KeyframePoint[],
  scaleFactor: number,
  originValue = 0
): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    value: Math.round((originValue + (k.value - originValue) * scaleFactor) * 10) / 10,
  }));
}

/**
 * Clamps keyframe values between minVal and maxVal.
 */
export function clampValues(
  keyframes: KeyframePoint[],
  minVal = 0,
  maxVal = 100
): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    value: Math.max(minVal, Math.min(maxVal, k.value)),
  }));
}

/**
 * Ripple timing: Shifts all keyframes occurring AFTER targetKeyframeId by deltaTime.
 */
export function rippleTiming(
  keyframes: KeyframePoint[],
  targetKeyframeId: number,
  deltaTime: number
): KeyframePoint[] {
  const targetKf = keyframes.find((k) => k.id === targetKeyframeId);
  if (!targetKf) return keyframes;

  return keyframes.map((k) => {
    if (k.time > targetKf.time) {
      return {
        ...k,
        time: Math.max(0, Math.round((k.time + deltaTime) * 10) / 10),
      };
    }
    return k;
  });
}
