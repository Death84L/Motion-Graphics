import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface InertiaConfig {
  friction: number; // e.g. 0.92
  mass: number; // e.g. 1.0
  decayDuration: number; // e.g. 30 frames
}

/**
 * Calculates physically plausible inertia throw / decay after motion release.
 */
export function calculateInertiaContinuation(
  keyframes: KeyframePoint[],
  releaseTime: number,
  config: InertiaConfig = { friction: 0.92, mass: 1.0, decayDuration: 30 }
): KeyframePoint[] {
  if (keyframes.length === 0) return keyframes;

  const lastKf = keyframes[keyframes.length - 1];
  const deriv = evaluateDerivativeAtTime(keyframes, releaseTime);
  let velocity = deriv.velocity; // in %/frame
  let currentVal = lastKf.value;

  const continuedPoints: KeyframePoint[] = [];

  for (let f = 1; f <= config.decayDuration; f++) {
    velocity *= config.friction;
    currentVal += velocity;
    const time = releaseTime + f;
    if (time > 100) break;

    continuedPoints.push({
      id: 13000 + f,
      time: Math.round(time * 10) / 10,
      value: Math.round(currentVal * 10) / 10,
      type: 'bezier',
      ease: 'easeOut',
    });
  }

  return [...keyframes, ...continuedPoints].sort((a, b) => a.time - b.time);
}
