import { KeyframePoint } from '../../features/graph-editor/types';

export type EditingMode = 'absolute' | 'relative';

/**
 * Modifies keyframes using either absolute target values or relative offsets.
 */
export function applyKeyframeTransform(
  keyframes: KeyframePoint[],
  selectedIds: number[],
  mode: EditingMode,
  deltaOrTargetValue: number,
  timeOffset = 0
): KeyframePoint[] {
  return keyframes.map((k) => {
    if (!selectedIds.includes(k.id)) return k;

    const newValue =
      mode === 'absolute' ? deltaOrTargetValue : k.value + deltaOrTargetValue;
    const newTime = Math.max(0, Math.min(100, k.time + timeOffset));

    return {
      ...k,
      time: Math.round(newTime * 10) / 10,
      value: Math.round(newValue * 10) / 10,
    };
  });
}
