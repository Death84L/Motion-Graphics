import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateAngleAndLength, calculateDelta } from '../math/tangentMath';

export interface CurveConstraints {
  startZeroVelocity: boolean;
  endZeroVelocity: boolean;
  noOvershoot: boolean;
  monotonic: boolean;
  maxVelocity?: number; // %/frame (e.g. 5.0)
  maxAcceleration?: number; // %/frame² (e.g. 10.0)
}

export const DEFAULT_CURVE_CONSTRAINTS: CurveConstraints = {
  startZeroVelocity: true,
  endZeroVelocity: true,
  noOvershoot: false,
  monotonic: false,
  maxVelocity: undefined,
  maxAcceleration: undefined,
};

/**
 * Enforces mathematical constraints onto curve keyframes and tangents.
 */
export function enforceCurveConstraints(
  keyframes: KeyframePoint[],
  constraints: CurveConstraints
): KeyframePoint[] {
  if (keyframes.length === 0) return keyframes;

  let result = JSON.parse(JSON.stringify(keyframes)) as KeyframePoint[];

  // 1. Monotonic Constraint
  if (constraints.monotonic) {
    for (let i = 1; i < result.length; i++) {
      if (result[i].value < result[i - 1].value) {
        result[i].value = result[i - 1].value;
      }
    }
  }

  // 2. No Overshoot Constraint
  if (constraints.noOvershoot) {
    result = result.map((k) => ({
      ...k,
      value: Math.max(0, Math.min(100, k.value)),
    }));
  }

  // 3. Start Zero Velocity (flat handleOut at first keyframe)
  if (constraints.startZeroVelocity && result.length > 0) {
    const first = result[0];
    const len = first.handleOut?.length ?? 15;
    result[0] = {
      ...first,
      handleOut: { x: len, y: 0, angle: 0, length: len },
    };
  }

  // 4. End Zero Velocity (flat handleIn at last keyframe)
  if (constraints.endZeroVelocity && result.length > 1) {
    const lastIdx = result.length - 1;
    const last = result[lastIdx];
    const len = last.handleIn?.length ?? 15;
    result[lastIdx] = {
      ...last,
      handleIn: { x: -len, y: 0, angle: 180, length: len },
    };
  }

  // 5. Max Velocity Limit on Tangents
  if (constraints.maxVelocity !== undefined && constraints.maxVelocity > 0) {
    const maxV = constraints.maxVelocity;
    result = result.map((k) => {
      let handleIn = k.handleIn;
      let handleOut = k.handleOut;

      if (handleIn && handleIn.x !== 0) {
        const slope = Math.abs(handleIn.y / handleIn.x);
        if (slope > maxV) {
          const newY = Math.sign(handleIn.y) * maxV * Math.abs(handleIn.x);
          const { angle, length } = calculateAngleAndLength(handleIn.x, newY);
          handleIn = { x: handleIn.x, y: newY, angle, length };
        }
      }

      if (handleOut && handleOut.x !== 0) {
        const slope = Math.abs(handleOut.y / handleOut.x);
        if (slope > maxV) {
          const newY = Math.sign(handleOut.y) * maxV * Math.abs(handleOut.x);
          const { angle, length } = calculateAngleAndLength(handleOut.x, newY);
          handleOut = { x: handleOut.x, y: newY, angle, length };
        }
      }

      return { ...k, handleIn, handleOut };
    });
  }

  return result;
}
