import { KeyframePoint } from '../../features/graph-editor/types';

export interface RetimingOptions {
  anchorTime?: number; // Pivot anchor time (defaults to selection start)
  scaleFactor?: number; // 0.5x, 1.5x, 2x, etc.
  preserveTangentsRatio?: boolean;
}

/**
 * Stretches or compresses keyframe duration while strictly maintaining normalized Bézier tangent curves.
 */
export function retimeKeyframeSpan(
  keyframes: KeyframePoint[],
  targetDuration: number,
  options: RetimingOptions = {}
): KeyframePoint[] {
  if (keyframes.length < 2) return keyframes;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const minTime = sorted[0].time;
  const maxTime = sorted[sorted.length - 1].time;
  const currentDuration = maxTime - minTime || 1;
  const scale = targetDuration / currentDuration;

  return sorted.map((k) => {
    const norm = (k.time - minTime) / currentDuration;
    const newTime = minTime + norm * targetDuration;

    // Scale tangent handle X offsets proportionally so easing curvature is preserved
    let handleIn = k.handleIn;
    let handleOut = k.handleOut;

    if (k.handleIn) {
      handleIn = {
        ...k.handleIn,
        x: k.handleIn.x * scale,
      };
    }

    if (k.handleOut) {
      handleOut = {
        ...k.handleOut,
        x: k.handleOut.x * scale,
      };
    }

    return {
      ...k,
      time: Math.max(0, Math.min(100, Math.round(newTime * 10) / 10)),
      handleIn,
      handleOut,
    };
  });
}

/**
 * Speeds up or slows down a specific time region [startFrame, endFrame]
 * and automatically ripples / shifts downstream keyframes.
 */
export function retimeRegionWithRipple(
  allKeyframes: KeyframePoint[],
  regionStart: number,
  regionEnd: number,
  speedMultiplier = 2.0 // >1 = faster (shorter duration), <1 = slower
): KeyframePoint[] {
  if (regionEnd <= regionStart || speedMultiplier <= 0) return allKeyframes;

  const originalSpan = regionEnd - regionStart;
  const newSpan = originalSpan / speedMultiplier;
  const deltaShift = newSpan - originalSpan;

  return allKeyframes.map((k) => {
    if (k.time < regionStart) {
      return k;
    } else if (k.time >= regionStart && k.time <= regionEnd) {
      // Inside region: compress or stretch time
      const norm = (k.time - regionStart) / originalSpan;
      const newTime = regionStart + norm * newSpan;
      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round(newTime * 10) / 10)),
        handleIn: k.handleIn ? { ...k.handleIn, x: k.handleIn.x / speedMultiplier } : undefined,
        handleOut: k.handleOut ? { ...k.handleOut, x: k.handleOut.x / speedMultiplier } : undefined,
      };
    } else {
      // Downstream keyframes: ripple shift time
      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round((k.time + deltaShift) * 10) / 10)),
      };
    }
  }).sort((a, b) => a.time - b.time);
}

/**
 * Reverses a selected time segment in-place without altering surrounding keyframes.
 */
export function reverseKeyframeSection(
  allKeyframes: KeyframePoint[],
  sectionKeyframeIds: number[]
): KeyframePoint[] {
  const selected = allKeyframes.filter((k) => sectionKeyframeIds.includes(k.id));
  if (selected.length < 2) return allKeyframes;

  const sortedSel = [...selected].sort((a, b) => a.time - b.time);
  const minT = sortedSel[0].time;
  const maxT = sortedSel[sortedSel.length - 1].time;

  return allKeyframes.map((k) => {
    if (!sectionKeyframeIds.includes(k.id)) return k;

    // Invert time position relative to bounds
    const reversedTime = maxT - (k.time - minT);

    // Swap In and Out handles with inverted X
    const handleIn = k.handleOut ? { ...k.handleOut, x: -k.handleOut.x } : undefined;
    const handleOut = k.handleIn ? { ...k.handleIn, x: -k.handleIn.x } : undefined;

    return {
      ...k,
      time: Math.max(0, Math.min(100, Math.round(reversedTime * 10) / 10)),
      handleIn,
      handleOut,
    };
  }).sort((a, b) => a.time - b.time);
}

/**
 * Inserts a freeze/hold duration at target time and ripples all subsequent keyframes.
 */
export function insertFreezeHold(
  allKeyframes: KeyframePoint[],
  freezeTime: number,
  holdDurationFrames = 15
): KeyframePoint[] {
  const sorted = [...allKeyframes].sort((a, b) => a.time - b.time);

  // Find value at freeze time
  let freezeValue = 0;
  const priorKey = sorted.filter((k) => k.time <= freezeTime).pop();
  if (priorKey) freezeValue = priorKey.value;

  const shifted: KeyframePoint[] = [];

  // Keyframes before freeze
  for (const k of sorted) {
    if (k.time < freezeTime) {
      shifted.push(k);
    } else {
      shifted.push({
        ...k,
        time: Math.max(0, Math.min(100, Math.round((k.time + holdDurationFrames) * 10) / 10)),
      });
    }
  }

  // Insert Hold Boundary Keyframes
  const holdStart: KeyframePoint = {
    id: Date.now() + 1,
    time: freezeTime,
    value: freezeValue,
    type: 'hold',
    ease: 'hold',
  };

  const holdEnd: KeyframePoint = {
    id: Date.now() + 2,
    time: Math.min(100, freezeTime + holdDurationFrames),
    value: freezeValue,
    type: 'linear',
  };

  return [...shifted, holdStart, holdEnd].sort((a, b) => a.time - b.time);
}
