import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

/**
 * Conforms Curve B's tangent slopes so its speed profile |v(t)| matches reference Curve A.
 */
export function matchSpeedProfile(
  targetKeyframes: KeyframePoint[],
  referenceKeyframes: KeyframePoint[]
): KeyframePoint[] {
  if (targetKeyframes.length < 2 || referenceKeyframes.length < 2) {
    return targetKeyframes;
  }

  return targetKeyframes.map((kf) => {
    const refDeriv = evaluateDerivativeAtTime(referenceKeyframes, kf.time);
    const speed = refDeriv.speed;

    const len = Math.max(5, Math.min(35, speed * 12));
    return {
      ...kf,
      handleIn: kf.handleIn ? { ...kf.handleIn, length: len, x: -len } : undefined,
      handleOut: kf.handleOut ? { ...kf.handleOut, length: len, x: len } : undefined,
    };
  });
}
