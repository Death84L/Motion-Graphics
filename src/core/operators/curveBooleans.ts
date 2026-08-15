import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type CurveBooleanOp = 'add' | 'subtract' | 'multiply' | 'difference' | 'min' | 'max';

/**
 * Applies mathematical Boolean combinations between Curve A and Curve B.
 */
export function applyCurveBoolean(
  curveA: KeyframePoint[],
  curveB: KeyframePoint[],
  operation: CurveBooleanOp,
  samples = 40
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const a = evaluateGraphAtTime(curveA, t);
    const b = evaluateGraphAtTime(curveB, t);

    let v = 0;
    if (operation === 'add') v = a + b;
    else if (operation === 'subtract') v = a - b;
    else if (operation === 'multiply') v = (a * b) / 100;
    else if (operation === 'difference') v = Math.abs(a - b);
    else if (operation === 'min') v = Math.min(a, b);
    else if (operation === 'max') v = Math.max(a, b);

    result.push({
      id: 16000 + i,
      time: t,
      value: Math.round(v * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
