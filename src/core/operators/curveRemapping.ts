import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

/**
 * Uses Curve A's evaluated output as the input drive domain for Curve B.
 */
export function remapCurveThroughCurve(
  inputCurve: KeyframePoint[],
  mappingCurve: KeyframePoint[],
  samples = 40
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const mappedT = Math.max(0, Math.min(100, evaluateGraphAtTime(inputCurve, t)));
    const finalVal = evaluateGraphAtTime(mappingCurve, mappedT);

    result.push({
      id: 17000 + i,
      time: t,
      value: Math.round(finalVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
