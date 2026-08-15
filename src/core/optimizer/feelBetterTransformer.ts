import { KeyframePoint } from '../../features/graph-editor/types';
import { smoothKeyframes } from '../math/smoothingAlgorithms';
import { generateSecondaryMotion } from '../dynamics/secondaryMotion';

export type FeelTransformation =
  | 'more-snappy'
  | 'more-smooth'
  | 'more-natural'
  | 'more-cinematic'
  | 'more-energetic'
  | 'more-heavy'
  | 'more-elastic';

/**
 * Transforms a curve's aesthetic feel based on human semantic intent.
 */
export function transformCurveFeel(
  keyframes: KeyframePoint[],
  transformation: FeelTransformation
): KeyframePoint[] {
  if (keyframes.length < 2) return keyframes;

  if (transformation === 'more-smooth') {
    return smoothKeyframes(keyframes, 2);
  }

  if (transformation === 'more-snappy') {
    return keyframes.map((k) => ({
      ...k,
      handleIn: k.handleIn ? { ...k.handleIn, length: (k.handleIn.length ?? 12) * 1.5 } : undefined,
      handleOut: k.handleOut ? { ...k.handleOut, length: (k.handleOut.length ?? 12) * 1.5 } : undefined,
    }));
  }

  if (transformation === 'more-elastic') {
    return generateSecondaryMotion(keyframes, { elasticity: 0.45, frequency: 0.4, decay: 0.08 });
  }

  if (transformation === 'more-heavy') {
    // Slower acceleration phase with long momentum tail
    return keyframes.map((k, idx) => {
      if (idx === 0 && k.handleOut) return { ...k, handleOut: { ...k.handleOut, length: 40 } };
      return k;
    });
  }

  if (transformation === 'more-cinematic') {
    // Elegant expansive deceleration
    return smoothKeyframes(keyframes, 1).map((k, idx, arr) => {
      if (idx === arr.length - 1 && k.handleIn) {
        return { ...k, handleIn: { ...k.handleIn, length: 45 } };
      }
      return k;
    });
  }

  return smoothKeyframes(keyframes, 1);
}
