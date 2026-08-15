import { KeyframePoint } from '../../features/graph-editor/types';
import { simplifyKeyframes } from '../math/rdpSimplifier';

export interface DensityBucket {
  startFrame: number;
  endFrame: number;
  count: number;
  densityLevel: 'low' | 'optimal' | 'high' | 'excessive';
}

/**
 * Analyzes keyframe distribution across 10-frame time buckets to locate wasted/redundant nodes.
 */
export function analyzeKeyframeDensity(
  keyframes: KeyframePoint[],
  bucketSize = 10
): { buckets: DensityBucket[]; redundantCount: number; totalCount: number } {
  const buckets: DensityBucket[] = [];

  for (let t = 0; t < 100; t += bucketSize) {
    const inBucket = keyframes.filter((k) => k.time >= t && k.time < t + bucketSize);
    const count = inBucket.length;

    let densityLevel: 'low' | 'optimal' | 'high' | 'excessive' = 'optimal';
    if (count <= 1) densityLevel = 'low';
    else if (count === 2 || count === 3) densityLevel = 'optimal';
    else if (count <= 5) densityLevel = 'high';
    else densityLevel = 'excessive';

    buckets.push({
      startFrame: t,
      endFrame: t + bucketSize,
      count,
      densityLevel,
    });
  }

  const simplified = simplifyKeyframes(keyframes, 1.5);
  const redundantCount = Math.max(0, keyframes.length - simplified.length);

  return {
    buckets,
    redundantCount,
    totalCount: keyframes.length,
  };
}
