import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface ProceduralNoiseConfig {
  amplitude: number; // e.g. 8%
  frequency: number; // e.g. 0.2
  octaves: number; // e.g. 3
  seed: number;
  falloff: 'none' | 'ease-in' | 'ease-out' | 'bell';
}

function pseudoPerlin(t: number, seed: number): number {
  const s = seed * 133.7;
  return (
    Math.sin(t * 1.0 + s) * 0.5 +
    Math.sin(t * 2.3 + s * 1.5) * 0.3 +
    Math.sin(t * 5.7 + s * 2.1) * 0.2
  );
}

/**
 * Injects multi-octave procedural noise onto base curve.
 */
export function injectProceduralNoise(
  baseKeyframes: KeyframePoint[],
  config: ProceduralNoiseConfig,
  step = 3
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let t = 0; t <= 100; t += step) {
    const baseVal = evaluateGraphAtTime(baseKeyframes, t);

    let weight = 1.0;
    if (config.falloff === 'ease-in') weight = t / 100;
    else if (config.falloff === 'ease-out') weight = 1 - t / 100;
    else if (config.falloff === 'bell') weight = Math.sin((t / 100) * Math.PI);

    const noise = pseudoPerlin(t * config.frequency, config.seed) * config.amplitude * weight;

    result.push({
      id: 10000 + t,
      time: t,
      value: Math.round((baseVal + noise) * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
