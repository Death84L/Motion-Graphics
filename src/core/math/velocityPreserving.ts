import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateAngleAndLength, calculateDelta, computeAutoTangents } from './tangentMath';

/**
 * Adjusts keyframe handle lengths when time changes to preserve velocity (dy/dt).
 */
export function adjustHandlesToPreserveVelocity(
  kf: KeyframePoint,
  oldTime: number,
  newTime: number,
  prevTime?: number,
  nextTime?: number
): KeyframePoint {
  const dtOldIn = prevTime !== undefined ? oldTime - prevTime : 15;
  const dtNewIn = prevTime !== undefined ? newTime - prevTime : 15;
  const ratioIn = dtOldIn !== 0 ? Math.abs(dtNewIn / dtOldIn) : 1;

  const dtOldOut = nextTime !== undefined ? nextTime - oldTime : 15;
  const dtNewOut = nextTime !== undefined ? nextTime - newTime : 15;
  const ratioOut = dtOldOut !== 0 ? Math.abs(dtNewOut / dtOldOut) : 1;

  let newHandleIn = kf.handleIn ? { ...kf.handleIn } : undefined;
  if (newHandleIn) {
    const newX = newHandleIn.x * ratioIn;
    const newY = newHandleIn.y; // Keep Y delta fixed to keep slope constant
    const { angle, length } = calculateAngleAndLength(newX, newY);
    newHandleIn = { x: newX, y: newY, angle, length };
  }

  let newHandleOut = kf.handleOut ? { ...kf.handleOut } : undefined;
  if (newHandleOut) {
    const newX = newHandleOut.x * ratioOut;
    const newY = newHandleOut.y;
    const { angle, length } = calculateAngleAndLength(newX, newY);
    newHandleOut = { x: newX, y: newY, angle, length };
  }

  return {
    ...kf,
    time: newTime,
    handleIn: newHandleIn,
    handleOut: newHandleOut,
  };
}

/**
 * Deletes keyframes while recalculating adjacent tangents to preserve the curve shape.
 */
export function deleteKeyframesPreservingShape(
  allKeyframes: KeyframePoint[],
  idsToDelete: number[]
): KeyframePoint[] {
  const remaining = allKeyframes.filter((k) => !idsToDelete.includes(k.id));
  if (remaining.length < 2) return remaining;

  // Recompute auto tangents for the remaining keyframes to bridge the gap seamlessly
  return remaining.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);

    return {
      ...kf,
      handleIn: kf.handleIn ? handleIn : undefined,
      handleOut: kf.handleOut ? handleOut : undefined,
    };
  });
}
