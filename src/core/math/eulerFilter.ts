import { KeyframePoint } from '../../features/graph-editor/types';

export interface EulerFilterReport {
  unwrappedCount: number;
  maxDiscontinuityDeg: number;
  fixedKeyframeIds: number[];
}

/**
 * Euler Filter unwraps angular phase discontinuities in rotation curves.
 * If consecutive keyframes jump by more than 180 degrees (e.g. +175° -> -170°),
 * it shifts the subsequent keyframes by ±360° multiples so the curve represents
 * continuous uninterrupted angular rotation without sudden visual flips or spikes.
 */
export function applyEulerFilter(
  keyframes: KeyframePoint[],
  discontinuityThreshold = 180
): { keyframes: KeyframePoint[]; report: EulerFilterReport } {
  if (!keyframes || keyframes.length < 2) {
    return {
      keyframes: [...keyframes],
      report: { unwrappedCount: 0, maxDiscontinuityDeg: 0, fixedKeyframeIds: [] },
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const result: KeyframePoint[] = [];
  const fixedIds: number[] = [];
  let unwrappedCount = 0;
  let maxDiscontinuity = 0;
  let cumulativeOffset = 0;

  result.push({ ...sorted[0] });

  for (let i = 1; i < sorted.length; i++) {
    const prev = result[i - 1];
    const curr = sorted[i];

    const currentVal = curr.value + cumulativeOffset;
    const diff = currentVal - prev.value;
    const absDiff = Math.abs(diff);

    if (absDiff > maxDiscontinuity) {
      maxDiscontinuity = absDiff;
    }

    if (absDiff > discontinuityThreshold) {
      // Find number of full 360-degree rotations needed to minimize distance
      const turns = Math.round(diff / 360);
      const correction = -turns * 360;
      cumulativeOffset += correction;
      unwrappedCount++;
      fixedIds.push(curr.id);
    }

    // Clone keyframe with continuous unwrapped value
    const newKeyframe: KeyframePoint = {
      ...curr,
      value: curr.value + cumulativeOffset,
    };

    result.push(newKeyframe);
  }

  return {
    keyframes: result,
    report: {
      unwrappedCount,
      maxDiscontinuityDeg: Math.round(maxDiscontinuity * 10) / 10,
      fixedKeyframeIds: fixedIds,
    },
  };
}

/**
 * Detects gimbal lock regions (where rotation approaches ±90° pitch singularity)
 * and normalizes the tangent velocity to prevent violent acceleration spikes.
 */
export function resolveGimbalLockTangents(keyframes: KeyframePoint[]): KeyframePoint[] {
  if (!keyframes || keyframes.length < 2) return keyframes;

  return keyframes.map((kf, idx, arr) => {
    // Check if keyframe value is near ±90° or ±270° gimbal singularities
    const normalizedMod = Math.abs(kf.value) % 180;
    const isNearSingularity = Math.abs(normalizedMod - 90) < 5;

    if (!isNearSingularity) return kf;

    // Smooth out handle extreme y slopes
    const prev = idx > 0 ? arr[idx - 1] : null;
    const next = idx < arr.length - 1 ? arr[idx + 1] : null;

    const avgSlope =
      prev && next
        ? (next.value - prev.value) / (next.time - prev.time || 1)
        : 0;

    const handleInX = kf.handleIn ? kf.handleIn.x : -10;
    const handleOutX = kf.handleOut ? kf.handleOut.x : 10;

    return {
      ...kf,
      handleIn: {
        x: handleInX,
        y: avgSlope * handleInX,
        angle: (Math.atan2(-avgSlope * handleInX, handleInX) * 180) / Math.PI,
        length: Math.abs(handleInX),
      },
      handleOut: {
        x: handleOutX,
        y: avgSlope * handleOutX,
        angle: (Math.atan2(-avgSlope * handleOutX, handleOutX) * 180) / Math.PI,
        length: Math.abs(handleOutX),
      },
    };
  });
}
