import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type ModifierType = 'noise' | 'smooth' | 'overshoot' | 'amplitude-offset' | 'time-warp';

export interface CurveModifier {
  id: string;
  name: string;
  type: ModifierType;
  enabled: boolean;
  params: {
    noiseAmplitude?: number; // e.g. 5%
    noiseFrequency?: number; // e.g. 0.2
    smoothStrength?: number; // e.g. 0.5
    overshootPct?: number; // e.g. 15%
    amplitudeScale?: number; // e.g. 1.2
    valueOffset?: number; // e.g. 10%
    warpPower?: number; // e.g. 1.5
  };
}

export const DEFAULT_MODIFIERS: CurveModifier[] = [
  {
    id: 'mod-noise',
    name: 'Wiggle / Noise',
    type: 'noise',
    enabled: false,
    params: { noiseAmplitude: 4, noiseFrequency: 0.15 },
  },
  {
    id: 'mod-amplitude',
    name: 'Amplitude Scale',
    type: 'amplitude-offset',
    enabled: false,
    params: { amplitudeScale: 1.15, valueOffset: 0 },
  },
  {
    id: 'mod-overshoot',
    name: 'Elastic Overshoot',
    type: 'overshoot',
    enabled: false,
    params: { overshootPct: 10 },
  },
];

/**
 * Pseudo-random deterministic noise function based on time and seed.
 */
function pseudoNoise(t: number, freq: number): number {
  return Math.sin(t * freq * 6.28) * 0.7 + Math.sin(t * freq * 13.7) * 0.3;
}

/**
 * Evaluates the final curve value at time `t` by passing through the active modifier stack.
 */
export function evaluateModifierStackAtTime(
  baseKeyframes: KeyframePoint[],
  time: number,
  modifiers: CurveModifier[]
): number {
  let t = Math.max(0, Math.min(100, time));

  // 1. Time Warp Modifiers First
  for (const mod of modifiers) {
    if (!mod.enabled || mod.type !== 'time-warp') continue;
    const p = mod.params.warpPower ?? 1;
    t = Math.pow(t / 100, p) * 100;
  }

  // Evaluate base curve at warped time
  let val = evaluateGraphAtTime(baseKeyframes, t);

  // 2. Value-Space Modifiers
  for (const mod of modifiers) {
    if (!mod.enabled) continue;

    if (mod.type === 'amplitude-offset') {
      const scale = mod.params.amplitudeScale ?? 1;
      const offset = mod.params.valueOffset ?? 0;
      val = val * scale + offset;
    } else if (mod.type === 'overshoot') {
      const extra = (mod.params.overshootPct ?? 10) / 100;
      if (t > 20 && t < 70) {
        val += Math.sin((t / 50) * Math.PI) * extra * 30;
      }
    } else if (mod.type === 'noise') {
      const amp = mod.params.noiseAmplitude ?? 4;
      const freq = mod.params.noiseFrequency ?? 0.15;
      val += pseudoNoise(t, freq) * amp;
    }
  }

  return Math.round(val * 10) / 10;
}
