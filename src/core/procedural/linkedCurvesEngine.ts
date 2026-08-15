import { KeyframePoint } from '../../features/graph-editor/types';

export type CurveLinkMode = 'offset' | 'multiply' | 'invert' | 'follow';

export interface CurveLinkRelationship {
  sourceLayerId: string;
  targetLayerId: string;
  mode: CurveLinkMode;
  factor: number; // multiplier or offset value
}

/**
 * Procedurally updates the target curve keyframes based on the driver source curve.
 */
export function computeLinkedCurveKeyframes(
  sourceKeyframes: KeyframePoint[],
  relationship: CurveLinkRelationship
): KeyframePoint[] {
  const { mode, factor } = relationship;

  return sourceKeyframes.map((k) => {
    let newVal = k.value;
    let newTime = k.time;

    if (mode === 'multiply') {
      newVal = k.value * factor;
    } else if (mode === 'invert') {
      newVal = 100 - k.value;
    } else if (mode === 'offset') {
      newVal = k.value + factor;
    } else if (mode === 'follow') {
      newTime = Math.min(100, k.time + factor);
      newVal = k.value * 0.9;
    }

    return {
      ...k,
      id: k.id + 10000,
      time: Math.max(0, Math.min(100, Math.round(newTime * 10) / 10)),
      value: Math.round(newVal * 10) / 10,
    };
  });
}
