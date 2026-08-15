import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { computeAutoTangents } from '../math/tangentMath';

export interface MorphResult {
  keyframes: KeyframePoint[];
  interpolatedSamples: { time: number; value: number }[];
}

/**
 * Morphs seamlessly between Preset Curve A and Preset Curve B based on morphFactor (0 = 100% A, 1 = 100% B).
 */
export function morphBetweenCurves(
  curveA: KeyframePoint[],
  curveB: KeyframePoint[],
  morphFactor: number, // 0 to 1
  sampleCount = 25
): MorphResult {
  const clampedFactor = Math.max(0, Math.min(1, morphFactor));
  const samples: { time: number; value: number }[] = [];
  const keyframes: KeyframePoint[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const t = (i / sampleCount) * 100;
    const valA = evaluateGraphAtTime(curveA, t);
    const valB = evaluateGraphAtTime(curveB, t);

    // Linear blending of curve values
    const blendedVal = valA * (1 - clampedFactor) + valB * clampedFactor;
    const roundedVal = Math.round(blendedVal * 10) / 10;

    samples.push({ time: t, value: roundedVal });

    // Pick 5 primary keyframe knots
    if (i === 0 || i === Math.round(sampleCount * 0.25) || i === Math.round(sampleCount * 0.5) || i === Math.round(sampleCount * 0.75) || i === sampleCount) {
      keyframes.push({
        id: 7700 + i,
        time: t,
        value: roundedVal,
        type: 'bezier',
        ease: 'easeInOut',
      });
    }
  }

  // Smooth tangents on resulting morphed keyframes
  const smoothKeyframes = keyframes.map((k, idx, arr) => {
    const prev = idx > 0 ? arr[idx - 1] : null;
    const next = idx < arr.length - 1 ? arr[idx + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, k, next, 0.33);
    return {
      ...k,
      handleIn,
      handleOut,
      symmetrical: true,
    };
  });

  return {
    keyframes: smoothKeyframes,
    interpolatedSamples: samples,
  };
}
