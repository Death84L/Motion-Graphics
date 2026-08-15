import { KeyframePoint } from '../../features/graph-editor/types';
import { simplifyKeyframes } from '../math/rdpSimplifier';
import { denoiseKeyframes } from '../dynamics/noiseFilter';

/**
 * Parses and cleans raw motion capture CSV/JSON tracks into optimized smooth keyframes.
 */
export function importAndCleanMoCapData(
  rawPoints: { frame: number; value: number }[],
  tolerance = 1.2,
  filterRadius = 2
): KeyframePoint[] {
  if (rawPoints.length === 0) return [];

  // Convert to KeyframePoints
  const initialKeyframes: KeyframePoint[] = rawPoints.map((p, idx) => ({
    id: 23000 + idx,
    time: p.frame,
    value: p.value,
    type: 'bezier',
    ease: 'easeInOut',
  }));

  // 1. Denoise with Savitzky-Golay filter
  const denoised = denoiseKeyframes(initialKeyframes, 'savitzky-golay', filterRadius);

  // 2. Reduce keyframe density using RDP algorithm
  return simplifyKeyframes(denoised, tolerance);
}
