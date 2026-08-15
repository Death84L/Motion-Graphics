import { KeyframePoint } from '../../features/graph-editor/types';
import { fitToDuration, scaleValues } from './timeValueTransforms';

export type CurveMatchMode = 'timing' | 'amplitude' | 'shape' | 'full';

/**
 * Transforms target curve keyframes to match a reference curve.
 */
export function matchCurveToReference(
  target: KeyframePoint[],
  reference: KeyframePoint[],
  mode: CurveMatchMode
): KeyframePoint[] {
  if (target.length < 2 || reference.length < 2) return target;

  const refTimes = reference.map((k) => k.time);
  const refMinT = Math.min(...refTimes);
  const refMaxT = Math.max(...refTimes);
  const refDuration = refMaxT - refMinT;

  const refVals = reference.map((k) => k.value);
  const refMinV = Math.min(...refVals);
  const refMaxV = Math.max(...refVals);
  const refSpanV = refMaxV - refMinV || 1;

  let result = [...target];

  if (mode === 'timing' || mode === 'full') {
    result = fitToDuration(result, refDuration, refMinT);
  }

  if (mode === 'amplitude' || mode === 'full') {
    const targetVals = result.map((k) => k.value);
    const targetMinV = Math.min(...targetVals);
    const targetMaxV = Math.max(...targetVals);
    const targetSpanV = targetMaxV - targetMinV || 1;
    const scaleFactor = refSpanV / targetSpanV;

    result = scaleValues(result, scaleFactor, targetMinV);
  }

  if (mode === 'shape' || mode === 'full') {
    // Adopt easing types and normalized tangent slopes from nearest reference keyframes
    result = result.map((k, idx) => {
      const nearestRef = reference[Math.min(idx, reference.length - 1)];
      return {
        ...k,
        ease: nearestRef.ease,
        type: nearestRef.type,
        handleIn: nearestRef.handleIn ? { ...nearestRef.handleIn } : k.handleIn,
        handleOut: nearestRef.handleOut ? { ...nearestRef.handleOut } : k.handleOut,
      };
    });
  }

  return result;
}
