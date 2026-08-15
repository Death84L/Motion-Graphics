import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface CurveSnapshot {
  id: string;
  name: string;
  timestamp: number;
  keyframes: KeyframePoint[];
}

export interface CurveDiffRegion {
  startFrame: number;
  endFrame: number;
  maxDiff: number;
  type: 'addition' | 'reduction' | 'identical';
}

/**
 * Computes region-by-region differential between original baseline and current edited curve.
 */
export function computeCurveDiffRegions(
  original: KeyframePoint[],
  current: KeyframePoint[],
  step = 5
): CurveDiffRegion[] {
  const regions: CurveDiffRegion[] = [];

  for (let t = 0; t < 100; t += step) {
    const tMid = t + step / 2;
    const vOrig = evaluateGraphAtTime(original, tMid);
    const vCurr = evaluateGraphAtTime(current, tMid);
    const diff = vCurr - vOrig;

    let type: 'addition' | 'reduction' | 'identical' = 'identical';
    if (diff > 1.5) type = 'addition';
    else if (diff < -1.5) type = 'reduction';

    regions.push({
      startFrame: t,
      endFrame: t + step,
      maxDiff: Math.round(diff * 10) / 10,
      type,
    });
  }

  return regions;
}
