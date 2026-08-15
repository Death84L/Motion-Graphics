import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Smooths keyframe values using a 3-point weighted Laplacian filter.
 */
export function smoothKeyframes(keyframes: KeyframePoint[], iterations = 1): KeyframePoint[] {
  if (keyframes.length <= 2) return [...keyframes];

  let result = [...keyframes];

  for (let iter = 0; iter < iterations; iter++) {
    result = result.map((kf, i, arr) => {
      if (i === 0 || i === arr.length - 1) return { ...kf };
      const prev = arr[i - 1];
      const next = arr[i + 1];
      // Weighted Gaussian average (0.25 prev + 0.5 curr + 0.25 next)
      const smoothedVal = 0.25 * prev.value + 0.5 * kf.value + 0.25 * next.value;
      return {
        ...kf,
        value: Math.round(smoothedVal * 100) / 100,
        handleIn: kf.handleIn ? { ...kf.handleIn, y: kf.handleIn.y * 0.8 } : undefined,
        handleOut: kf.handleOut ? { ...kf.handleOut, y: kf.handleOut.y * 0.8 } : undefined,
      };
    });
  }

  return result;
}

/**
 * Sharpens keyframe transitions by accentuating local peaks/valleys.
 */
export function sharpenKeyframes(keyframes: KeyframePoint[], factor = 1.3): KeyframePoint[] {
  if (keyframes.length <= 2) return [...keyframes];

  return keyframes.map((kf, i, arr) => {
    if (i === 0 || i === arr.length - 1) return { ...kf };
    const prev = arr[i - 1];
    const next = arr[i + 1];
    const avg = (prev.value + next.value) / 2;
    const diff = kf.value - avg;
    const sharpenedVal = avg + diff * factor;
    return {
      ...kf,
      value: Math.round(sharpenedVal * 100) / 100,
    };
  });
}

/**
 * Normalizes all keyframes so min value becomes minTarget (0) and max value becomes maxTarget (100).
 */
export function normalizeKeyframes(
  keyframes: KeyframePoint[],
  minTarget = 0,
  maxTarget = 100
): KeyframePoint[] {
  if (keyframes.length === 0) return [];

  const values = keyframes.map((k) => k.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  if (range === 0) {
    return keyframes.map((k) => ({ ...k, value: minTarget }));
  }

  return keyframes.map((k) => {
    const norm = (k.value - minVal) / range;
    const newVal = minTarget + norm * (maxTarget - minTarget);
    return {
      ...k,
      value: Math.round(newVal * 100) / 100,
    };
  });
}

/**
 * Reverses the chronological timing of keyframes.
 */
export function reverseKeyframes(keyframes: KeyframePoint[]): KeyframePoint[] {
  if (keyframes.length <= 1) return [...keyframes];

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const minT = sorted[0].time;
  const maxT = sorted[sorted.length - 1].time;

  return sorted
    .map((k) => ({
      ...k,
      time: Math.round((minT + (maxT - k.time)) * 100) / 100,
      handleIn: k.handleOut ? { ...k.handleOut, x: -k.handleOut.x } : undefined,
      handleOut: k.handleIn ? { ...k.handleIn, x: -k.handleIn.x } : undefined,
    }))
    .sort((a, b) => a.time - b.time);
}

/**
 * Inverts values of keyframes upside down around min/max or 50% midpoint.
 */
export function invertKeyframes(keyframes: KeyframePoint[], midpoint = 50): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    value: Math.round((2 * midpoint - k.value) * 100) / 100,
    handleIn: k.handleIn ? { ...k.handleIn, y: -k.handleIn.y } : undefined,
    handleOut: k.handleOut ? { ...k.handleOut, y: -k.handleOut.y } : undefined,
  }));
}

/**
 * Flattens all handles to 0 slope.
 */
export function flattenKeyframes(keyframes: KeyframePoint[]): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    ease: 'bezier',
    handleIn: k.handleIn ? { ...k.handleIn, y: 0, angle: 180 } : { x: -15, y: 0, angle: 180, length: 15 },
    handleOut: k.handleOut ? { ...k.handleOut, y: 0, angle: 0 } : { x: 15, y: 0, angle: 0, length: 15 },
  }));
}

/**
 * Quantizes time and value of keyframes to discrete intervals.
 */
export function quantizeKeyframes(
  keyframes: KeyframePoint[],
  timeStep = 5,
  valueStep = 10
): KeyframePoint[] {
  return keyframes.map((k) => ({
    ...k,
    time: Math.round(k.time / timeStep) * timeStep,
    value: Math.round(k.value / valueStep) * valueStep,
  }));
}
