import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface VectorPoint2D {
  time: number;
  x: number;
  y: number;
  magnitude: number; // sqrt(x² + y²)
  angleDeg: number; // atan2(y, x) in degrees
  velocity: number; // sqrt(vx² + vy²)
  acceleration: number; // path acceleration
}

/**
 * Computes 2D vector kinematics (magnitude, direction, path speed) combining X and Y keyframe curves.
 */
export function evaluateVectorKinematicsAtTime(
  xKeyframes: KeyframePoint[],
  yKeyframes: KeyframePoint[],
  time: number
): VectorPoint2D {
  const x = evaluateGraphAtTime(xKeyframes, time);
  const y = evaluateGraphAtTime(yKeyframes, time);

  const dx = evaluateDerivativeAtTime(xKeyframes, time);
  const dy = evaluateDerivativeAtTime(yKeyframes, time);

  const magnitude = Math.sqrt(x * x + y * y);
  const angleDeg = (Math.atan2(y, x) * 180) / Math.PI;
  const velocity = Math.sqrt(dx.velocity * dx.velocity + dy.velocity * dy.velocity);
  const acceleration = Math.sqrt(dx.acceleration * dx.acceleration + dy.acceleration * dy.acceleration);

  return {
    time,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    magnitude: Math.round(magnitude * 10) / 10,
    angleDeg: Math.round(angleDeg * 10) / 10,
    velocity: Math.round(velocity * 10) / 10,
    acceleration: Math.round(acceleration * 10) / 10,
  };
}

/**
 * Samples vector trajectory across time domain.
 */
export function sampleVectorPath(
  xKeyframes: KeyframePoint[],
  yKeyframes: KeyframePoint[],
  samples = 80
): VectorPoint2D[] {
  const points: VectorPoint2D[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    points.push(evaluateVectorKinematicsAtTime(xKeyframes, yKeyframes, t));
  }
  return points;
}
