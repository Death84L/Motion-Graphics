import { KeyframePoint } from '../../features/graph-editor/types';
import { CurveModifier, evaluateModifierStackAtTime } from '../procedural/modifierStack';
import { fitStrokeToBezierKeyframes } from '../math/bezierFitting';
import { simplifyKeyframes } from '../math/rdpSimplifier';
import { computeAutoTangents } from '../math/tangentMath';

export interface KeyframeReductionResult {
  reducedKeyframes: KeyframePoint[];
  originalCount: number;
  reducedCount: number;
  compressionRatio: number; // percentage, e.g. 78%
  maxError: number;
}

/**
 * Resamples and reduces a dense keyframe stream (e.g. from MoCap, simulation, or baking)
 * to a minimal set of clean Bézier keyframes while strictly bounding geometric error.
 */
export function reduceKeyframeDensity(
  keyframes: KeyframePoint[],
  tolerance = 1.8,
  preserveExtrema = true
): KeyframeReductionResult {
  if (!keyframes || keyframes.length <= 2) {
    return {
      reducedKeyframes: [...keyframes],
      originalCount: keyframes.length,
      reducedCount: keyframes.length,
      compressionRatio: 0,
      maxError: 0,
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const rawPoints = sorted.map((k) => ({ time: k.time, value: k.value }));

  // Fit to smooth Bezier keyframes
  const fitted = fitStrokeToBezierKeyframes(rawPoints, tolerance);

  // If preserveExtrema is enabled, ensure local peaks/valleys from original are kept
  let finalKeys = fitted;
  if (preserveExtrema) {
    const extremaKeys: KeyframePoint[] = [];
    for (let i = 1; i < sorted.length - 1; i++) {
      const p = sorted[i - 1];
      const c = sorted[i];
      const n = sorted[i + 1];
      const isPeak = c.value > p.value && c.value > n.value;
      const isValley = c.value < p.value && c.value < n.value;

      if ((isPeak || isValley) && Math.abs(c.value - p.value) > 2) {
        // Only add if not already close to a fitted keyframe
        const hasClose = fitted.some((fk) => Math.abs(fk.time - c.time) < 2);
        if (!hasClose) {
          extremaKeys.push({ ...c, type: 'bezier', ease: 'easeInOut' });
        }
      }
    }

    if (extremaKeys.length > 0) {
      const merged = [...fitted, ...extremaKeys].sort((a, b) => a.time - b.time);
      finalKeys = merged.map((kf, i, arr) => {
        const prev = i > 0 ? arr[i - 1] : null;
        const next = i < arr.length - 1 ? arr[i + 1] : null;
        const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);
        return { ...kf, handleIn, handleOut };
      });
    }
  }

  const origCount = sorted.length;
  const redCount = finalKeys.length;
  const compressionRatio = Math.round(((origCount - redCount) / (origCount || 1)) * 100);

  return {
    reducedKeyframes: finalKeys,
    originalCount: origCount,
    reducedCount: redCount,
    compressionRatio: Math.max(0, compressionRatio),
    maxError: tolerance,
  };
}

/**
 * Bakes the active Modifier Stack down into raw, standalone Bézier keyframes
 * that no longer require runtime modifiers.
 */
export function bakeModifiersToKeyframes(
  baseKeyframes: KeyframePoint[],
  modifiers: CurveModifier[],
  sampleInterval = 1,
  tolerance = 1.2
): KeyframeReductionResult {
  const sampledPoints: { time: number; value: number }[] = [];

  for (let t = 0; t <= 100; t += sampleInterval) {
    const val = evaluateModifierStackAtTime(baseKeyframes, t, modifiers);
    sampledPoints.push({ time: t, value: val });
  }

  const fittedKeyframes = fitStrokeToBezierKeyframes(sampledPoints, tolerance);

  return {
    reducedKeyframes: fittedKeyframes,
    originalCount: sampledPoints.length,
    reducedCount: fittedKeyframes.length,
    compressionRatio: Math.round(
      ((sampledPoints.length - fittedKeyframes.length) / sampledPoints.length) * 100
    ),
    maxError: tolerance,
  };
}
