import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface CurveErrorMetrics {
  maxError: number;
  rmsError: number;
  meanError: number;
  errorSamples: { time: number; error: number }[];
}

/**
 * Computes difference error metric between two curves across the timeline.
 */
export function computeCurveErrorMetrics(
  original: KeyframePoint[],
  modified: KeyframePoint[],
  samples = 100
): CurveErrorMetrics {
  const errorSamples: { time: number; error: number }[] = [];
  let sumSqError = 0;
  let sumAbsError = 0;
  let maxError = 0;

  for (let i = 0; i <= samples; i++) {
    const time = (i / samples) * 100;
    const vOrig = evaluateGraphAtTime(original, time);
    const vMod = evaluateGraphAtTime(modified, time);
    const err = Math.abs(vOrig - vMod);

    errorSamples.push({ time, error: Math.round(err * 100) / 100 });
    sumSqError += err * err;
    sumAbsError += err;
    if (err > maxError) maxError = err;
  }

  const rmsError = Math.sqrt(sumSqError / (samples + 1));
  const meanError = sumAbsError / (samples + 1);

  return {
    maxError: Math.round(maxError * 10) / 10,
    rmsError: Math.round(rmsError * 10) / 10,
    meanError: Math.round(meanError * 10) / 10,
    errorSamples,
  };
}
