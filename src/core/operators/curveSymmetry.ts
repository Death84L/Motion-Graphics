import { KeyframePoint } from '../../features/graph-editor/types';

export type SymmetryMode =
  | 'mirror-horizontal'
  | 'mirror-vertical'
  | 'mirror-around-playhead'
  | 'swap-handles'
  | 'reverse-and-mirror';

/**
 * Applies geometric symmetry and mirroring transformations to keyframes.
 */
export function applyCurveSymmetry(
  keyframes: KeyframePoint[],
  mode: SymmetryMode,
  playheadTime = 50
): KeyframePoint[] {
  if (keyframes.length === 0) return keyframes;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (mode === 'mirror-horizontal') {
    // Reverse time
    return sorted.map((k) => ({
      ...k,
      time: Math.round((100 - k.time) * 10) / 10,
      handleIn: k.handleOut ? { ...k.handleOut, x: -k.handleOut.x } : undefined,
      handleOut: k.handleIn ? { ...k.handleIn, x: -k.handleIn.x } : undefined,
    })).sort((a, b) => a.time - b.time);
  }

  if (mode === 'mirror-vertical') {
    // Invert value around 50%
    return sorted.map((k) => ({
      ...k,
      value: Math.round((100 - k.value) * 10) / 10,
      handleIn: k.handleIn ? { ...k.handleIn, y: -k.handleIn.y } : undefined,
      handleOut: k.handleOut ? { ...k.handleOut, y: -k.handleOut.y } : undefined,
    }));
  }

  if (mode === 'mirror-around-playhead') {
    return sorted.map((k) => ({
      ...k,
      time: Math.max(0, Math.min(100, Math.round((2 * playheadTime - k.time) * 10) / 10)),
    })).sort((a, b) => a.time - b.time);
  }

  if (mode === 'swap-handles') {
    return sorted.map((k) => ({
      ...k,
      handleIn: k.handleOut ? { ...k.handleOut, x: -k.handleOut.x } : undefined,
      handleOut: k.handleIn ? { ...k.handleIn, x: -k.handleIn.x } : undefined,
    }));
  }

  if (mode === 'reverse-and-mirror') {
    return sorted.map((k) => ({
      ...k,
      time: Math.round((100 - k.time) * 10) / 10,
      value: Math.round((100 - k.value) * 10) / 10,
    })).sort((a, b) => a.time - b.time);
  }

  return sorted;
}
