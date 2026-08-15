import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type ExtrapolationType = 'constant' | 'linear' | 'cycle' | 'cycleOffset' | 'pingPong';

/**
 * Evaluates a curve at any time with pre and post extrapolation applied.
 */
export function evaluateExtrapolatedValue(
  keyframes: KeyframePoint[],
  time: number,
  preExtrapolation: ExtrapolationType = 'constant',
  postExtrapolation: ExtrapolationType = 'constant'
): number {
  if (!keyframes || keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Inside keyframe bounds: standard evaluation
  if (time >= first.time && time <= last.time) {
    return evaluateGraphAtTime(sorted, time);
  }

  const duration = last.time - first.time;
  if (duration <= 0) return first.value;

  const deltaValue = last.value - first.value;

  // --- Pre-Extrapolation (time < first.time) ---
  if (time < first.time) {
    switch (preExtrapolation) {
      case 'constant':
        return first.value;

      case 'linear': {
        // Calculate tangent slope at first keyframe
        const second = sorted[1];
        let slope = 0;
        if (first.handleOut && first.handleOut.x !== 0) {
          slope = first.handleOut.y / first.handleOut.x;
        } else if (second) {
          slope = (second.value - first.value) / (second.time - first.time || 1);
        }
        return first.value + slope * (time - first.time);
      }

      case 'cycle': {
        const offset = first.time - time;
        const wrapped = last.time - (offset % duration);
        return evaluateGraphAtTime(sorted, wrapped);
      }

      case 'cycleOffset': {
        const offset = first.time - time;
        const cycles = Math.ceil(offset / duration);
        const wrappedTime = time + cycles * duration;
        const baseVal = evaluateGraphAtTime(sorted, wrappedTime);
        return baseVal - cycles * deltaValue;
      }

      case 'pingPong': {
        const offset = first.time - time;
        const doubleDur = duration * 2;
        const mod = offset % doubleDur;
        if (mod <= duration) {
          // Forward segment moving back
          return evaluateGraphAtTime(sorted, first.time + mod);
        } else {
          // Backward segment
          return evaluateGraphAtTime(sorted, last.time - (mod - duration));
        }
      }

      default:
        return first.value;
    }
  }

  // --- Post-Extrapolation (time > last.time) ---
  if (time > last.time) {
    switch (postExtrapolation) {
      case 'constant':
        return last.value;

      case 'linear': {
        // Calculate tangent slope at last keyframe
        const prev = sorted[sorted.length - 2];
        let slope = 0;
        if (last.handleIn && last.handleIn.x !== 0) {
          slope = -last.handleIn.y / -last.handleIn.x;
        } else if (prev) {
          slope = (last.value - prev.value) / (last.time - prev.time || 1);
        }
        return last.value + slope * (time - last.time);
      }

      case 'cycle': {
        const offset = time - last.time;
        const wrapped = first.time + (offset % duration);
        return evaluateGraphAtTime(sorted, wrapped);
      }

      case 'cycleOffset': {
        const offset = time - last.time;
        const cycles = Math.floor(offset / duration) + 1;
        const wrappedTime = time - cycles * duration;
        const baseVal = evaluateGraphAtTime(sorted, wrappedTime);
        return baseVal + cycles * deltaValue;
      }

      case 'pingPong': {
        const offset = time - last.time;
        const doubleDur = duration * 2;
        const mod = offset % doubleDur;
        if (mod <= duration) {
          // Reverse direction
          return evaluateGraphAtTime(sorted, last.time - mod);
        } else {
          // Forward direction
          return evaluateGraphAtTime(sorted, first.time + (mod - duration));
        }
      }

      default:
        return last.value;
    }
  }

  return first.value;
}

/**
 * Generates an SVG path string for the extrapolated wings (before first keyframe and after last keyframe).
 */
export function generateExtrapolatedSvgPath(
  keyframes: KeyframePoint[],
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number },
  minViewportTime = -50,
  maxViewportTime = 150,
  preExtrapolation: ExtrapolationType = 'constant',
  postExtrapolation: ExtrapolationType = 'constant'
): { prePath: string; postPath: string } {
  if (!keyframes || keyframes.length < 2) return { prePath: '', postPath: '' };

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const firstTime = sorted[0].time;
  const lastTime = sorted[sorted.length - 1].time;

  // 1. Generate Pre-Extrapolation Path (from minViewportTime to firstTime)
  let prePath = '';
  if (preExtrapolation !== 'constant' && minViewportTime < firstTime) {
    const prePoints: string[] = [];
    const samples = 40;
    for (let i = 0; i <= samples; i++) {
      const t = minViewportTime + (i / samples) * (firstTime - minViewportTime);
      const v = evaluateExtrapolatedValue(sorted, t, preExtrapolation, postExtrapolation);
      const pt = toSvgPoint({ time: t, value: v });
      prePoints.push(`${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`);
    }
    prePath = prePoints.join(' ');
  }

  // 2. Generate Post-Extrapolation Path (from lastTime to maxViewportTime)
  let postPath = '';
  if (postExtrapolation !== 'constant' && maxViewportTime > lastTime) {
    const postPoints: string[] = [];
    const samples = 40;
    for (let i = 0; i <= samples; i++) {
      const t = lastTime + (i / samples) * (maxViewportTime - lastTime);
      const v = evaluateExtrapolatedValue(sorted, t, preExtrapolation, postExtrapolation);
      const pt = toSvgPoint({ time: t, value: v });
      postPoints.push(`${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`);
    }
    postPath = postPoints.join(' ');
  }

  return { prePath, postPath };
}
