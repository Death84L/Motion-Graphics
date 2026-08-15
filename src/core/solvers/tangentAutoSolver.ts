import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateAngleAndLength, computeAutoTangents } from '../math/tangentMath';

export type TangentSolverObjective =
  | 'smoothest'
  | 'least-jerk'
  | 'least-acceleration'
  | 'no-overshoot'
  | 'fastest-arrival';

/**
 * Automatically solves and optimizes all tangent handles across the curve based on an analytical objective.
 */
export function solveOptimalTangents(
  keyframes: KeyframePoint[],
  objective: TangentSolverObjective
): KeyframePoint[] {
  if (keyframes.length < 2) return keyframes;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  return sorted.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;

    if (objective === 'smoothest') {
      const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.38);
      return { ...kf, handleIn, handleOut, symmetrical: true };
    }

    if (objective === 'least-jerk') {
      // Conservative shorter tension to prevent sudden impulses
      const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.25);
      return { ...kf, handleIn, handleOut, symmetrical: true };
    }

    if (objective === 'least-acceleration') {
      // Linearized slope tangents
      const dtIn = prev ? (kf.time - prev.time) * 0.33 : 15;
      const dyIn = prev ? (kf.value - prev.value) * 0.33 : 0;
      const dtOut = next ? (next.time - kf.time) * 0.33 : 15;
      const dyOut = next ? (next.value - kf.value) * 0.33 : 0;
      const inData = calculateAngleAndLength(-dtIn, dyIn);
      const outData = calculateAngleAndLength(dtOut, dyOut);
      return {
        ...kf,
        handleIn: { x: -dtIn, y: dyIn, angle: inData.angle, length: inData.length },
        handleOut: { x: dtOut, y: dyOut, angle: outData.angle, length: outData.length },
        symmetrical: false,
      };
    }

    if (objective === 'no-overshoot') {
      // Fritsch-Carlson zero slope clamping at any potential overshoot
      const isPeak =
        (prev && next && kf.value >= prev.value && kf.value >= next.value) ||
        (prev && next && kf.value <= prev.value && kf.value <= next.value);
      const dyIn = isPeak ? 0 : prev ? (kf.value - prev.value) * 0.25 : 0;
      const dyOut = isPeak ? 0 : next ? (next.value - kf.value) * 0.25 : 0;
      const dtIn = prev ? (kf.time - prev.time) * 0.33 : 15;
      const dtOut = next ? (next.time - kf.time) * 0.33 : 15;

      const inData = calculateAngleAndLength(-dtIn, dyIn);
      const outData = calculateAngleAndLength(dtOut, dyOut);
      return {
        ...kf,
        handleIn: { x: -dtIn, y: dyIn, angle: inData.angle, length: inData.length },
        handleOut: { x: dtOut, y: dyOut, angle: outData.angle, length: outData.length },
        symmetrical: false,
      };
    }

    if (objective === 'fastest-arrival') {
      // Rapid steep handles
      const dtIn = prev ? (kf.time - prev.time) * 0.5 : 15;
      const dyIn = prev ? (kf.value - prev.value) * 0.6 : 0;
      const dtOut = next ? (next.time - kf.time) * 0.5 : 15;
      const dyOut = next ? (next.value - kf.value) * 0.6 : 0;

      const inData = calculateAngleAndLength(-dtIn, dyIn);
      const outData = calculateAngleAndLength(dtOut, dyOut);
      return {
        ...kf,
        handleIn: { x: -dtIn, y: dyIn, angle: inData.angle, length: inData.length },
        handleOut: { x: dtOut, y: dyOut, angle: outData.angle, length: outData.length },
      };
    }

    return kf;
  });
}
