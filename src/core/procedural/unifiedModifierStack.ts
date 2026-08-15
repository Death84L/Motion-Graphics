import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type ProceduralModifierType =
  | 'noise'
  | 'wiggle'
  | 'spring'
  | 'bounce'
  | 'overshoot'
  | 'damping'
  | 'inertia'
  | 'wave'
  | 'pulse'
  | 'random'
  | 'quantize'
  | 'clamp'
  | 'smooth'
  | 'delay'
  | 'follow'
  | 'phase-shift';

export interface UnifiedModifier {
  id: string;
  type: ProceduralModifierType;
  name: string;
  enabled: boolean;
  intensity: number; // 0 to 1
  params: Record<string, number>;
}

export const DEFAULT_PROCEDURAL_STACK: UnifiedModifier[] = [
  {
    id: 'mod-wiggle',
    type: 'wiggle',
    name: 'Natural Wiggle / Drift',
    enabled: false,
    intensity: 0.6,
    params: { frequency: 2.5, amplitude: 6 },
  },
  {
    id: 'mod-noise',
    type: 'noise',
    name: 'Perlin Jitter',
    enabled: false,
    intensity: 0.5,
    params: { octave: 3, amplitude: 4 },
  },
  {
    id: 'mod-spring',
    type: 'spring',
    name: 'Harmonic Spring',
    enabled: false,
    intensity: 0.8,
    params: { stiffness: 140, damping: 12, mass: 1 },
  },
  {
    id: 'mod-overshoot',
    type: 'overshoot',
    name: 'Target Overshoot',
    enabled: false,
    intensity: 0.7,
    params: { overshootPercent: 12, decayRate: 0.75 },
  },
  {
    id: 'mod-wave',
    type: 'wave',
    name: 'Harmonic Wave (Sine)',
    enabled: false,
    intensity: 0.5,
    params: { frequency: 4.0, amplitude: 8, phase: 0 },
  },
  {
    id: 'mod-quantize',
    type: 'quantize',
    name: 'Step Quantizer / Staircase',
    enabled: false,
    intensity: 1.0,
    params: { stepLevels: 8, timeHold: 4 },
  },
  {
    id: 'mod-clamp',
    type: 'clamp',
    name: 'Value Boundary Clamp',
    enabled: false,
    intensity: 1.0,
    params: { minFloor: 0, maxCeiling: 100 },
  },
];

/**
 * Evaluates the entire sequential modifier pipeline at a specific time.
 */
export function evaluateProceduralStack(
  baseKeyframes: KeyframePoint[],
  time: number,
  stack: UnifiedModifier[]
): number {
  let currentVal = evaluateGraphAtTime(baseKeyframes, time);

  for (const mod of stack) {
    if (!mod.enabled) continue;

    switch (mod.type) {
      case 'wiggle': {
        const freq = mod.params.frequency || 2.5;
        const amp = (mod.params.amplitude || 6) * mod.intensity;
        const noise =
          Math.sin(time * 0.1 * freq) * 0.6 +
          Math.sin(time * 0.23 * freq + 1.2) * 0.4;
        currentVal += noise * amp;
        break;
      }

      case 'noise': {
        const amp = (mod.params.amplitude || 4) * mod.intensity;
        const pseudo = Math.sin(time * 8.7 + Math.cos(time * 3.2) * 4) * amp;
        currentVal += pseudo;
        break;
      }

      case 'spring': {
        const stiffness = mod.params.stiffness || 140;
        const damping = mod.params.damping || 12;
        const decay = Math.exp((-damping * (time % 50)) / 100);
        const osc = Math.cos((Math.sqrt(stiffness) * (time % 50)) / 15);
        currentVal += osc * decay * 10 * mod.intensity;
        break;
      }

      case 'overshoot': {
        const osPct = (mod.params.overshootPercent || 12) * mod.intensity;
        const decay = mod.params.decayRate || 0.75;
        if (time > 30 && time < 80) {
          const factor = Math.sin(((time - 30) / 50) * Math.PI * 2) * Math.exp(-((time - 30) / 20) * decay);
          currentVal += factor * osPct;
        }
        break;
      }

      case 'wave': {
        const freq = mod.params.frequency || 4.0;
        const amp = (mod.params.amplitude || 8) * mod.intensity;
        const phase = mod.params.phase || 0;
        currentVal += Math.sin((time / 100) * freq * Math.PI * 2 + phase) * amp;
        break;
      }

      case 'quantize': {
        const levels = mod.params.stepLevels || 8;
        currentVal = Math.round(currentVal / (100 / levels)) * (100 / levels);
        break;
      }

      case 'clamp': {
        const min = mod.params.minFloor ?? 0;
        const max = mod.params.maxCeiling ?? 100;
        currentVal = Math.max(min, Math.min(max, currentVal));
        break;
      }

      case 'smooth': {
        const t1 = evaluateGraphAtTime(baseKeyframes, Math.max(0, time - 2));
        const t2 = evaluateGraphAtTime(baseKeyframes, Math.min(100, time + 2));
        currentVal = currentVal * 0.5 + (t1 + t2) * 0.25;
        break;
      }

      default:
        break;
    }
  }

  return currentVal;
}
