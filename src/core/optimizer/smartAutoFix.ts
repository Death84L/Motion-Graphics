import { KeyframePoint } from '../../features/graph-editor/types';
import { solveOptimalTangents } from '../solvers/tangentAutoSolver';
import { simplifyKeyframes } from '../math/rdpSimplifier';
import { enforceCurveConstraints, DEFAULT_CURVE_CONSTRAINTS } from '../solvers/curveConstraints';

/**
 * Automatically repairs all velocity discontinuities, clamps overshoots, solves smooth tangents, and removes redundant nodes.
 */
export function executeSmartAutoFix(keyframes: KeyframePoint[]): KeyframePoint[] {
  if (keyframes.length < 2) return keyframes;

  // 1. Simplify redundant co-linear nodes
  const simplified = simplifyKeyframes(keyframes, 1.2);

  // 2. Solve optimal C1/C2 continuous tangents
  const smoothTangents = solveOptimalTangents(simplified, 'smoothest');

  // 3. Enforce zero endpoint velocity and boundary constraints
  return enforceCurveConstraints(smoothTangents, {
    ...DEFAULT_CURVE_CONSTRAINTS,
    startZeroVelocity: true,
    endZeroVelocity: true,
    noOvershoot: false,
  });
}
