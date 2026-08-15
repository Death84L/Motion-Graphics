import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface CurveIntersection {
  id: string;
  time: number;
  value: number;
  curveAId: string;
  curveBId: string;
  type: 'intersection' | 'crossing-zero';
}

/**
 * Detects intersections between two curves.
 */
export function findCurveIntersections(
  curveA: { id: string; keyframes: KeyframePoint[] },
  curveB: { id: string; keyframes: KeyframePoint[] },
  samples = 120
): CurveIntersection[] {
  const intersections: CurveIntersection[] = [];
  if (curveA.keyframes.length < 2 || curveB.keyframes.length < 2) return intersections;

  let prevDiff: number | null = null;
  let prevTime = 0;

  for (let i = 0; i <= samples; i++) {
    const time = (i / samples) * 100;
    const valA = evaluateGraphAtTime(curveA.keyframes, time);
    const valB = evaluateGraphAtTime(curveB.keyframes, time);
    const diff = valA - valB;

    if (prevDiff !== null) {
      if ((prevDiff <= 0 && diff >= 0) || (prevDiff >= 0 && diff <= 0)) {
        // Linear interpolation to find the exact zero difference crossing time
        const fraction = Math.abs(prevDiff) / (Math.abs(prevDiff) + Math.abs(diff) || 1);
        const intersectTime = prevTime + fraction * (time - prevTime);
        const intersectVal = evaluateGraphAtTime(curveA.keyframes, intersectTime);

        intersections.push({
          id: `inter-${curveA.id}-${curveB.id}-${intersectTime.toFixed(1)}`,
          time: Math.round(intersectTime * 10) / 10,
          value: Math.round(intersectVal * 10) / 10,
          curveAId: curveA.id,
          curveBId: curveB.id,
          type: 'intersection',
        });
      }
    }

    prevDiff = diff;
    prevTime = time;
  }

  return intersections;
}
