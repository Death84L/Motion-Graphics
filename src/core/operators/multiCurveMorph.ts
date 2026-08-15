import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface WeightedCurve {
  keyframes: KeyframePoint[];
  weight: number; // e.g. 0.0 to 1.0
}

/**
 * Performs barycentric multi-curve morphing blending N arbitrary curves simultaneously.
 */
export function morphMultipleCurves(
  weightedCurves: WeightedCurve[],
  samples = 50
): KeyframePoint[] {
  if (weightedCurves.length === 0) return [];

  const totalWeight = weightedCurves.reduce((acc, c) => acc + c.weight, 0) || 1;
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    let blendedValue = 0;

    for (const c of weightedCurves) {
      const v = evaluateGraphAtTime(c.keyframes, t);
      blendedValue += v * (c.weight / totalWeight);
    }

    result.push({
      id: 15000 + i,
      time: t,
      value: Math.round(blendedValue * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
