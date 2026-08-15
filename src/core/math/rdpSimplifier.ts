import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Calculates perpendicular distance from point p to line segment (p1, p2).
 */
function perpendicularDistance(
  p: { time: number; value: number },
  p1: { time: number; value: number },
  p2: { time: number; value: number }
): number {
  const dx = p2.time - p1.time;
  const dy = p2.value - p1.value;

  if (dx === 0 && dy === 0) {
    const diffX = p.time - p1.time;
    const diffY = p.value - p1.value;
    return Math.sqrt(diffX * diffX + diffY * diffY);
  }

  const numerator = Math.abs(dy * p.time - dx * p.value + p2.time * p1.value - p2.value * p1.time);
  const denominator = Math.sqrt(dy * dy + dx * dx);
  return numerator / denominator;
}

/**
 * Ramer-Douglas-Peucker (RDP) algorithm for keyframe curve simplification.
 * Reduces dense keyframe arrays to essential inflection points within error epsilon.
 */
export function simplifyKeyframes(
  keyframes: KeyframePoint[],
  epsilon = 1.5
): KeyframePoint[] {
  if (keyframes.length <= 2) return [...keyframes];

  let maxDistance = 0;
  let maxIndex = 0;
  const lastIndex = keyframes.length - 1;

  for (let i = 1; i < lastIndex; i++) {
    const dist = perpendicularDistance(keyframes[i], keyframes[0], keyframes[lastIndex]);
    if (dist > maxDistance) {
      maxDistance = dist;
      maxIndex = i;
    }
  }

  if (maxDistance > epsilon) {
    const firstHalf = simplifyKeyframes(keyframes.slice(0, maxIndex + 1), epsilon);
    const secondHalf = simplifyKeyframes(keyframes.slice(maxIndex), epsilon);
    return [...firstHalf.slice(0, -1), ...secondHalf];
  }

  return [keyframes[0], keyframes[lastIndex]];
}
