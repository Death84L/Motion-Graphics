import { KeyframePoint, CurveLayer } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface PropertyMapRange {
  property: string;
  minVal: number;
  maxVal: number;
  delayOffset: number; // in frames
}

/**
 * Maps a single 0-100% master progress curve to drive multiple property tracks simultaneously.
 */
export function drivePropertiesFromMaster(
  masterKeyframes: KeyframePoint[],
  propertyMappings: PropertyMapRange[],
  samples = 40
): Record<string, KeyframePoint[]> {
  const result: Record<string, KeyframePoint[]> = {};

  for (const map of propertyMappings) {
    const points: KeyframePoint[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * 100;
      const delayedT = Math.max(0, t - map.delayOffset);
      const progressNorm = evaluateGraphAtTime(masterKeyframes, delayedT) / 100;
      const mappedVal = map.minVal + progressNorm * (map.maxVal - map.minVal);

      points.push({
        id: 20000 + i,
        time: t,
        value: Math.round(mappedVal * 10) / 10,
        type: 'bezier',
        ease: 'easeInOut',
      });
    }

    result[map.property] = points;
  }

  return result;
}
