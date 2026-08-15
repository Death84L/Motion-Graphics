import { KeyframePoint } from '../../features/graph-editor/types';
import { simplifyKeyframes } from './rdpSimplifier';
import { computeAutoTangents } from './tangentMath';

/**
 * Converts a raw freehand drawn stroke of (time, value) points into clean Bézier keyframes.
 */
export function fitStrokeToBezierKeyframes(
  rawPoints: { time: number; value: number }[],
  epsilon = 1.8
): KeyframePoint[] {
  if (rawPoints.length < 2) return [];

  // Sort chronologically and clamp
  const sorted = [...rawPoints]
    .sort((a, b) => a.time - b.time)
    .map((p, idx) => ({
      id: Date.now() + idx,
      time: Math.max(0, Math.min(100, Math.round(p.time * 10) / 10)),
      value: Math.round(p.value * 10) / 10,
    }));

  // Deduplicate points with identical time
  const deduplicated: KeyframePoint[] = [];
  for (const pt of sorted) {
    if (deduplicated.length === 0 || Math.abs(deduplicated[deduplicated.length - 1].time - pt.time) >= 1.0) {
      deduplicated.push(pt);
    }
  }

  // 1. Apply Ramer-Douglas-Peucker reduction
  const simplified = simplifyKeyframes(deduplicated, epsilon);

  // 2. Compute smooth Bézier tangents for each simplified keyframe
  return simplified.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.35);

    return {
      ...kf,
      type: 'bezier' as const,
      ease: 'bezier' as const,
      handleIn,
      handleOut,
      symmetrical: true,
    };
  });
}
