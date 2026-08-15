import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

/**
 * Freezes a specific time range [freezeStart, freezeEnd] at a constant value while leaving outside regions intact.
 */
export function freezeCurveRegion(
  keyframes: KeyframePoint[],
  freezeStart: number,
  freezeEnd: number
): KeyframePoint[] {
  const freezeVal = evaluateGraphAtTime(keyframes, freezeStart);

  const outside = keyframes.filter((k) => k.time < freezeStart || k.time > freezeEnd);

  const freezeNodes: KeyframePoint[] = [
    { id: 9001, time: freezeStart, value: freezeVal, type: 'hold' },
    { id: 9002, time: freezeEnd, value: freezeVal, type: 'bezier', ease: 'easeInOut' },
  ];

  return [...outside, ...freezeNodes].sort((a, b) => a.time - b.time);
}

/**
 * Applies a transformation strictly within [localStart, localEnd] with smooth Gaussian boundary falloff.
 */
export function applyLocalRegionTransform(
  keyframes: KeyframePoint[],
  localStart: number,
  localEnd: number,
  deltaValue: number
): KeyframePoint[] {
  const mid = (localStart + localEnd) / 2;
  const radius = (localEnd - localStart) / 2 || 1;

  return keyframes.map((k) => {
    if (k.time < localStart || k.time > localEnd) return k;

    // Smooth cosine bell-curve falloff
    const dist = Math.abs(k.time - mid) / radius;
    const weight = Math.cos(dist * Math.PI * 0.5);

    return {
      ...k,
      value: Math.round((k.value + deltaValue * weight) * 10) / 10,
    };
  });
}
