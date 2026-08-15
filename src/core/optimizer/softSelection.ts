import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Calculates Gaussian bell-curve soft selection influence weights for neighboring keyframes.
 */
export function calculateSoftSelectionWeights(
  keyframes: KeyframePoint[],
  primaryKeyframeId: number,
  radiusFrames = 25
): Map<number, number> {
  const weights = new Map<number, number>();
  const primaryKf = keyframes.find((k) => k.id === primaryKeyframeId);
  if (!primaryKf) return weights;

  for (const k of keyframes) {
    const dist = Math.abs(k.time - primaryKf.time);
    if (dist <= radiusFrames) {
      // Gaussian bell curve falloff: exp(-dist² / (2 * (radius/2)²))
      const sigma = radiusFrames / 2.2;
      const weight = Math.exp(-(dist * dist) / (2 * sigma * sigma));
      weights.set(k.id, Math.round(weight * 100) / 100);
    } else {
      weights.set(k.id, 0);
    }
  }

  return weights;
}

/**
 * Moves primary keyframe while proportionally moving neighboring keyframes by soft selection weights.
 */
export function applySoftSelectionTransform(
  keyframes: KeyframePoint[],
  primaryKeyframeId: number,
  deltaValue: number,
  deltaTime: number,
  radiusFrames = 25
): KeyframePoint[] {
  const weights = calculateSoftSelectionWeights(keyframes, primaryKeyframeId, radiusFrames);

  return keyframes.map((k) => {
    const w = weights.get(k.id) || 0;
    if (w === 0) return k;

    return {
      ...k,
      time: Math.max(0, Math.min(100, Math.round((k.time + deltaTime * w) * 10) / 10)),
      value: Math.round((k.value + deltaValue * w) * 10) / 10,
    };
  }).sort((a, b) => a.time - b.time);
}
