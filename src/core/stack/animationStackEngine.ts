import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export type StackModifierType =
  | 'move'
  | 'spring'
  | 'overshoot'
  | 'bounce'
  | 'wiggle'
  | 'noise'
  | 'follow'
  | 'clamp'
  | 'quantize';

export interface StackModifier {
  id: string;
  type: StackModifierType;
  name: string;
  enabled: boolean;
  intensity: number; // 0 to 2.0
  params: Record<string, number>;
}

export interface PropertyAnimationStack {
  property: 'position-x' | 'position-y' | 'scale' | 'rotation' | 'opacity' | 'blur';
  baseKeyframes: KeyframePoint[];
  modifiers: StackModifier[];
}

export interface LayerAnimationStack {
  layerId: string;
  layerName: string;
  enabled: boolean;
  properties: PropertyAnimationStack[];
}

export const DEFAULT_STACK_MODIFIERS: StackModifier[] = [
  {
    id: 'mod-spring-1',
    type: 'spring',
    name: 'Harmonic Spring Physics',
    enabled: true,
    intensity: 0.8,
    params: { stiffness: 150, damping: 14, mass: 1 },
  },
  {
    id: 'mod-overshoot-1',
    type: 'overshoot',
    name: 'Dynamic Target Overshoot',
    enabled: true,
    intensity: 1.0,
    params: { overshootPercent: 14, decay: 0.7 },
  },
  {
    id: 'mod-wiggle-1',
    type: 'wiggle',
    name: 'Natural Organic Drift',
    enabled: false,
    intensity: 0.5,
    params: { frequency: 2.0, amplitude: 5 },
  },
];

/**
 * Non-destructive Evaluation: Computes the layered output of a property's base curve plus all stacked modifiers.
 */
export function evaluatePropertyStackAtTime(
  propStack: PropertyAnimationStack,
  time: number
): number {
  let val = evaluateGraphAtTime(propStack.baseKeyframes, time);

  for (const mod of propStack.modifiers) {
    if (!mod.enabled) continue;

    switch (mod.type) {
      case 'spring': {
        const stiffness = mod.params.stiffness || 150;
        const damping = mod.params.damping || 14;
        const decay = Math.exp((-damping * (time % 40)) / 80);
        const osc = Math.cos((Math.sqrt(stiffness) * (time % 40)) / 12);
        val += osc * decay * 8 * mod.intensity;
        break;
      }

      case 'overshoot': {
        const pct = (mod.params.overshootPercent || 14) * mod.intensity;
        const decay = mod.params.decay || 0.7;
        if (time > 20 && time < 70) {
          const factor = Math.sin(((time - 20) / 50) * Math.PI * 2) * Math.exp(-((time - 20) / 25) * decay);
          val += factor * pct;
        }
        break;
      }

      case 'wiggle': {
        const freq = mod.params.frequency || 2.0;
        const amp = (mod.params.amplitude || 5) * mod.intensity;
        const drift = Math.sin(time * 0.12 * freq) * 0.6 + Math.sin(time * 0.28 * freq + 0.9) * 0.4;
        val += drift * amp;
        break;
      }

      case 'bounce': {
        const bounceCycle = time % 25;
        const bounce = Math.abs(Math.sin((bounceCycle / 25) * Math.PI)) * Math.exp(-bounceCycle / 15);
        val += bounce * 15 * mod.intensity;
        break;
      }

      case 'clamp': {
        const min = mod.params.min ?? 0;
        const max = mod.params.max ?? 100;
        val = Math.max(min, Math.min(max, val));
        break;
      }

      default:
        break;
    }
  }

  return Math.round(val * 10) / 10;
}

/**
 * Bakes the entire non-destructive modifier stack down to raw Bézier keyframes for native host export.
 */
export function bakeStackToKeyframes(
  propStack: PropertyAnimationStack,
  sampleSteps = 25
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= sampleSteps; i++) {
    const t = (i / sampleSteps) * 100;
    const evaluatedVal = evaluatePropertyStackAtTime(propStack, t);

    result.push({
      id: 9500 + i,
      time: t,
      value: evaluatedVal,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
