import { KeyframePoint } from '../../features/graph-editor/types';

export interface DriverMatrixLink {
  sourceProperty: 'translate-x' | 'translate-y' | 'scale' | 'rotate' | 'opacity';
  targetProperty: 'translate-x' | 'translate-y' | 'scale' | 'rotate' | 'opacity';
  multiplier: number; // e.g. 0.5
  offset: number; // e.g. 10
  clampMin?: number;
  clampMax?: number;
  invert?: boolean;
}

export const DEFAULT_DRIVER_LINKS: DriverMatrixLink[] = [
  { sourceProperty: 'scale', targetProperty: 'opacity', multiplier: 1.0, offset: 0, invert: false },
  { sourceProperty: 'translate-x', targetProperty: 'rotate', multiplier: 0.25, offset: 0, invert: false },
];

/**
 * Computes driven target property keyframes from master driver property.
 */
export function executeDriverMatrix(
  sourceKeyframes: KeyframePoint[],
  link: DriverMatrixLink
): KeyframePoint[] {
  return sourceKeyframes.map((k) => {
    let val = k.value * link.multiplier + link.offset;
    if (link.invert) val = 100 - val;
    if (link.clampMin !== undefined) val = Math.max(link.clampMin, val);
    if (link.clampMax !== undefined) val = Math.min(link.clampMax, val);

    return {
      ...k,
      id: k.id + 18000,
      value: Math.round(val * 10) / 10,
    };
  });
}
