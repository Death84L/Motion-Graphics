import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

/**
 * Re-parameterizes keyframe timing based on cumulative arc-length distance to enforce constant spatial speed.
 */
export function reparameterizeForConstantSpeed(
  xKeyframes: KeyframePoint[],
  yKeyframes: KeyframePoint[],
  samples = 120
): { xKeyframes: KeyframePoint[]; yKeyframes: KeyframePoint[] } {
  if (xKeyframes.length < 2 || yKeyframes.length < 2) {
    return { xKeyframes, yKeyframes };
  }

  // 1. Calculate cumulative arc length table
  const cumulativeLengths: { t: number; length: number; x: number; y: number }[] = [];
  let totalLength = 0;

  let prevX = evaluateGraphAtTime(xKeyframes, 0);
  let prevY = evaluateGraphAtTime(yKeyframes, 0);
  cumulativeLengths.push({ t: 0, length: 0, x: prevX, y: prevY });

  for (let i = 1; i <= samples; i++) {
    const t = (i / samples) * 100;
    const x = evaluateGraphAtTime(xKeyframes, t);
    const y = evaluateGraphAtTime(yKeyframes, t);
    const dx = x - prevX;
    const dy = y - prevY;
    totalLength += Math.sqrt(dx * dx + dy * dy);
    cumulativeLengths.push({ t, length: totalLength, x, y });
    prevX = x;
    prevY = y;
  }

  if (totalLength === 0) return { xKeyframes, yKeyframes };

  // 2. Sample at uniform distance intervals
  const newXKeyframes: KeyframePoint[] = [];
  const newYKeyframes: KeyframePoint[] = [];
  const keyframeCount = Math.max(xKeyframes.length, 4);

  for (let k = 0; k < keyframeCount; k++) {
    const targetDist = (k / (keyframeCount - 1)) * totalLength;
    const targetTime = (k / (keyframeCount - 1)) * 100;

    // Find point in cumulative length table
    let pt = cumulativeLengths[0];
    for (let i = 0; i < cumulativeLengths.length - 1; i++) {
      if (
        targetDist >= cumulativeLengths[i].length &&
        targetDist <= cumulativeLengths[i + 1].length
      ) {
        const segLen = cumulativeLengths[i + 1].length - cumulativeLengths[i].length || 0.0001;
        const frac = (targetDist - cumulativeLengths[i].length) / segLen;
        pt = {
          t: targetTime,
          length: targetDist,
          x: cumulativeLengths[i].x + frac * (cumulativeLengths[i + 1].x - cumulativeLengths[i].x),
          y: cumulativeLengths[i].y + frac * (cumulativeLengths[i + 1].y - cumulativeLengths[i].y),
        };
        break;
      }
    }

    newXKeyframes.push({
      id: 6000 + k * 2,
      time: targetTime,
      value: Math.round(pt.x * 10) / 10,
      type: 'bezier',
      ease: 'linear',
    });

    newYKeyframes.push({
      id: 6000 + k * 2 + 1,
      time: targetTime,
      value: Math.round(pt.y * 10) / 10,
      type: 'bezier',
      ease: 'linear',
    });
  }

  return { xKeyframes: newXKeyframes, yKeyframes: newYKeyframes };
}
