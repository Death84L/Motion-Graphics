import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface SecondaryMotionConfig {
  elasticity: number; // e.g. 0.35
  frequency: number; // e.g. 0.4
  decay: number; // e.g. 0.12
}

/**
 * Generates secondary overshoot and settling wobble following primary acceleration impulses.
 */
export function generateSecondaryMotion(
  primaryKeyframes: KeyframePoint[],
  config: SecondaryMotionConfig = { elasticity: 0.3, frequency: 0.35, decay: 0.1 }
): KeyframePoint[] {
  const result: KeyframePoint[] = [];
  const samples = 80;

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const baseVal = evaluateGraphAtTime(primaryKeyframes, t);
    const d = evaluateDerivativeAtTime(primaryKeyframes, t);

    // Secondary harmonic excitation proportional to acceleration
    const impulse = d.acceleration;
    const wobble = Math.sin(t * config.frequency) * Math.exp(-t * config.decay) * impulse * config.elasticity;

    result.push({
      id: 14000 + i,
      time: t,
      value: Math.round((baseVal + wobble) * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
