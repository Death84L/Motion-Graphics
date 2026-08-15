import { KeyframePoint } from '../../features/graph-editor/types';

export type TimeAlignTarget = 'min' | 'max' | 'average' | 'playhead';
export type ValueAlignTarget = 'min' | 'max' | 'average' | 'zero' | 'top';

export type DistributionMode = 'time-even' | 'value-linear' | 'equalize-intervals';

/**
 * Aligns selected keyframes horizontally in time.
 */
export function alignKeyframesTime(
  allKeyframes: KeyframePoint[],
  selectedIds: number[],
  target: TimeAlignTarget,
  playheadTime = 0
): KeyframePoint[] {
  const selected = allKeyframes.filter((k) => selectedIds.includes(k.id));
  if (selected.length === 0) return allKeyframes;

  const times = selected.map((k) => k.time);
  let targetT = times[0];

  switch (target) {
    case 'min':
      targetT = Math.min(...times);
      break;
    case 'max':
      targetT = Math.max(...times);
      break;
    case 'average':
      targetT = times.reduce((acc, t) => acc + t, 0) / times.length;
      break;
    case 'playhead':
      targetT = playheadTime;
      break;
  }

  return allKeyframes.map((k) => {
    if (selectedIds.includes(k.id)) {
      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round(targetT * 10) / 10)),
      };
    }
    return k;
  });
}

/**
 * Aligns selected keyframes vertically in value.
 */
export function alignKeyframesValue(
  allKeyframes: KeyframePoint[],
  selectedIds: number[],
  target: ValueAlignTarget
): KeyframePoint[] {
  const selected = allKeyframes.filter((k) => selectedIds.includes(k.id));
  if (selected.length === 0) return allKeyframes;

  const vals = selected.map((k) => k.value);
  let targetV = vals[0];

  switch (target) {
    case 'min':
      targetV = Math.min(...vals);
      break;
    case 'max':
      targetV = Math.max(...vals);
      break;
    case 'average':
      targetV = vals.reduce((acc, v) => acc + v, 0) / vals.length;
      break;
    case 'zero':
      targetV = 0;
      break;
    case 'top':
      targetV = 100;
      break;
  }

  return allKeyframes.map((k) => {
    if (selectedIds.includes(k.id)) {
      return {
        ...k,
        value: Math.round(targetV * 10) / 10,
      };
    }
    return k;
  });
}

/**
 * Distributes selected keyframes evenly across time.
 */
export function distributeKeyframesTime(
  allKeyframes: KeyframePoint[],
  selectedIds: number[]
): KeyframePoint[] {
  const selected = allKeyframes.filter((k) => selectedIds.includes(k.id)).sort((a, b) => a.time - b.time);
  if (selected.length < 3) return allKeyframes;

  const minTime = selected[0].time;
  const maxTime = selected[selected.length - 1].time;
  const interval = (maxTime - minTime) / (selected.length - 1);

  const distributedMap = new Map<number, number>();
  selected.forEach((k, idx) => {
    distributedMap.set(k.id, minTime + idx * interval);
  });

  return allKeyframes.map((k) => {
    if (distributedMap.has(k.id)) {
      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round((distributedMap.get(k.id) || k.time) * 10) / 10)),
      };
    }
    return k;
  }).sort((a, b) => a.time - b.time);
}

/**
 * Distributes keyframe values linearly between first and last selected keyframes.
 */
export function distributeKeyframesValue(
  allKeyframes: KeyframePoint[],
  selectedIds: number[]
): KeyframePoint[] {
  const selected = allKeyframes.filter((k) => selectedIds.includes(k.id)).sort((a, b) => a.time - b.time);
  if (selected.length < 3) return allKeyframes;

  const minV = selected[0].value;
  const maxV = selected[selected.length - 1].value;
  const interval = (maxV - minV) / (selected.length - 1);

  const valueMap = new Map<number, number>();
  selected.forEach((k, idx) => {
    valueMap.set(k.id, minV + idx * interval);
  });

  return allKeyframes.map((k) => {
    if (valueMap.has(k.id)) {
      return {
        ...k,
        value: Math.round((valueMap.get(k.id) || k.value) * 10) / 10,
      };
    }
    return k;
  });
}

/**
 * Matches outgoing and incoming tangent velocities across consecutive keyframe boundaries.
 */
export function matchKeyframeVelocities(
  allKeyframes: KeyframePoint[],
  selectedIds: number[]
): KeyframePoint[] {
  const sorted = [...allKeyframes].sort((a, b) => a.time - b.time);

  return sorted.map((k, i, arr) => {
    if (!selectedIds.includes(k.id)) return k;
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;

    if (prev && next) {
      const avgSlope = (next.value - prev.value) / (next.time - prev.time || 1);
      const lenIn = k.handleIn?.length || 15;
      const lenOut = k.handleOut?.length || 15;

      return {
        ...k,
        handleIn: {
          x: -lenIn,
          y: -avgSlope * lenIn,
          angle: 180,
          length: lenIn,
        },
        handleOut: {
          x: lenOut,
          y: avgSlope * lenOut,
          angle: 0,
          length: lenOut,
        },
        symmetrical: true,
      };
    }
    return k;
  });
}
