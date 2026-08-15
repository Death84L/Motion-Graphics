import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { computeAutoTangents } from './tangentMath';

/**
 * Morphs dynamically between Curve A and Curve B based on blendFactor (0.0 = Curve A, 1.0 = Curve B).
 */
export function morphCurves(
  curveAKeyframes: KeyframePoint[],
  curveBKeyframes: KeyframePoint[],
  blendFactor: number, // 0 to 1
  sampleStep = 10
): KeyframePoint[] {
  const t = Math.max(0, Math.min(1, blendFactor));
  if (t === 0) return curveAKeyframes;
  if (t === 1) return curveBKeyframes;

  // Generate blended keyframes across time
  const morphedPoints: KeyframePoint[] = [];
  for (let time = 0; time <= 100; time += sampleStep) {
    const valA = evaluateGraphAtTime(curveAKeyframes, time);
    const valB = evaluateGraphAtTime(curveBKeyframes, time);
    const blendedVal = valA * (1 - t) + valB * t;

    morphedPoints.push({
      id: 1000 + time,
      time,
      value: Math.round(blendedVal * 10) / 10,
      type: 'bezier',
      ease: 'bezier',
    });
  }

  // Compute smooth tangents for the morphed curve
  return morphedPoints.map((kf, idx, arr) => {
    const prev = idx > 0 ? arr[idx - 1] : null;
    const next = idx < arr.length - 1 ? arr[idx + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);

    return {
      ...kf,
      handleIn,
      handleOut,
      symmetrical: true,
    };
  });
}
