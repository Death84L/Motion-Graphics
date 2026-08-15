import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Finds all local peak keyframes (higher than both immediate neighbours).
 */
export function getPeakKeyframes(keyframes: KeyframePoint[]): number[] {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const ids: number[] = [];

  for (let i = 1; i < sorted.length - 1; i++) {
    if (sorted[i].value > sorted[i - 1].value && sorted[i].value > sorted[i + 1].value) {
      ids.push(sorted[i].id);
    }
  }
  return ids;
}

/**
 * Finds all local valley keyframes (lower than both immediate neighbours).
 */
export function getValleyKeyframes(keyframes: KeyframePoint[]): number[] {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const ids: number[] = [];

  for (let i = 1; i < sorted.length - 1; i++) {
    if (sorted[i].value < sorted[i - 1].value && sorted[i].value < sorted[i + 1].value) {
      ids.push(sorted[i].id);
    }
  }
  return ids;
}

/**
 * Finds all extrema keyframes (peaks + valleys).
 */
export function getExtremaKeyframes(keyframes: KeyframePoint[]): number[] {
  return [...getPeakKeyframes(keyframes), ...getValleyKeyframes(keyframes)];
}

/**
 * Finds flat keyframes where tangent handles are horizontal.
 */
export function getFlatKeyframes(keyframes: KeyframePoint[]): number[] {
  return keyframes
    .filter((k) => {
      const inFlat = !k.handleIn || Math.abs(k.handleIn.y) < 0.5;
      const outFlat = !k.handleOut || Math.abs(k.handleOut.y) < 0.5;
      return inFlat && outFlat;
    })
    .map((k) => k.id);
}

/**
 * Selects every Nth keyframe.
 */
export function getNthKeyframes(keyframes: KeyframePoint[], n = 2, offset = 0): number[] {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  return sorted.filter((_, i) => (i - offset) % n === 0).map((k) => k.id);
}

/**
 * Selects keyframes strictly before playhead time.
 */
export function getKeyframesBeforeTime(keyframes: KeyframePoint[], time: number): number[] {
  return keyframes.filter((k) => k.time < time).map((k) => k.id);
}

/**
 * Selects keyframes strictly after playhead time.
 */
export function getKeyframesAfterTime(keyframes: KeyframePoint[], time: number): number[] {
  return keyframes.filter((k) => k.time > time).map((k) => k.id);
}
