import { KeyframePoint } from '../../features/graph-editor/types';

export type LoopMode = 'loop' | 'ping-pong' | 'mirror' | 'repeat-with-decay';

/**
 * Generates continuous looped or oscillating keyframe sequences.
 */
export function generateLoopedCurve(
  keyframes: KeyframePoint[],
  mode: LoopMode,
  iterations = 3,
  decayFactor = 0.6
): KeyframePoint[] {
  if (keyframes.length < 2) return keyframes;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const baseSpan = Math.max(1, sorted[sorted.length - 1].time - sorted[0].time);
  const result: KeyframePoint[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    const iterOffset = iter * (100 / iterations);
    const scale = Math.pow(decayFactor, iter);

    const isReverse = mode === 'ping-pong' && iter % 2 === 1;
    const workingList = isReverse ? [...sorted].reverse() : sorted;

    for (let k = 0; k < workingList.length; k++) {
      const orig = workingList[k];
      const normT = (orig.time - sorted[0].time) / baseSpan;
      const t = iterOffset + normT * (100 / iterations);
      let v = orig.value;

      if (mode === 'repeat-with-decay') {
        v = sorted[0].value + (orig.value - sorted[0].value) * scale;
      }

      result.push({
        id: 8000 + iter * 100 + k,
        time: Math.min(100, Math.round(t * 10) / 10),
        value: Math.round(v * 10) / 10,
        type: orig.type,
        ease: orig.ease,
      });
    }
  }

  return result.sort((a, b) => a.time - b.time);
}
