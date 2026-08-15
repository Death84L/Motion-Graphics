import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type CurveBlendMode = 'replace' | 'add' | 'multiply' | 'screen' | 'overlay' | 'difference';

/**
 * Blends two curve layers using Photoshop-style compositing blend formulas.
 */
export function blendCurveLayers(
  baseCurve: KeyframePoint[],
  blendCurve: KeyframePoint[],
  mode: CurveBlendMode,
  opacity = 1.0,
  samples = 50
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const a = evaluateGraphAtTime(baseCurve, t) / 100; // normalize 0-1
    const b = evaluateGraphAtTime(blendCurve, t) / 100;

    let blended = b;
    if (mode === 'add') blended = Math.min(1, a + b);
    else if (mode === 'multiply') blended = a * b;
    else if (mode === 'screen') blended = 1 - (1 - a) * (1 - b);
    else if (mode === 'overlay') blended = a < 0.5 ? 2 * a * b : 1 - 2 * (1 - a) * (1 - b);
    else if (mode === 'difference') blended = Math.abs(a - b);

    const finalVal = (a * (1 - opacity) + blended * opacity) * 100;

    result.push({
      id: 19000 + i,
      time: t,
      value: Math.round(finalVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
