import { BezierHandle, KeyframePoint, TangentType } from '../../features/graph-editor/types';

/**
 * Normalizes -0 to +0.
 */
function cleanZero(val: number): number {
  return Object.is(val, -0) ? 0 : val;
}

/**
 * Computes angle (degrees, -180 to 180) and magnitude from delta coordinates.
 */
export function calculateAngleAndLength(dx: number, dy: number): { angle: number; length: number } {
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(-dy, dx) * 180) / Math.PI;
  return {
    angle: cleanZero(Math.round(angle * 10) / 10),
    length: cleanZero(Math.round(length * 10) / 10),
  };
}

/**
 * Computes delta x & y from angle (degrees) and length.
 */
export function calculateDelta(angleDeg: number, length: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cleanZero(Math.cos(rad) * length),
    y: cleanZero(-Math.sin(rad) * length),
  };
}

/**
 * Generates flat horizontal tangent handle (angle 0°).
 */
export function createFlatTangent(length = 15): BezierHandle {
  return { x: length, y: 0, angle: 0, length };
}

/**
 * Computes auto-smooth tangent using adjacent keyframes (preventing overshoot at local extrema).
 */
export function computeAutoTangents(
  prev: KeyframePoint | null,
  curr: KeyframePoint,
  next: KeyframePoint | null,
  tension = 0.33
): { handleIn: BezierHandle; handleOut: BezierHandle } {
  if (!prev && !next) {
    return {
      handleIn: { x: -15, y: 0, angle: 180, length: 15 },
      handleOut: { x: 15, y: 0, angle: 0, length: 15 },
    };
  }

  // Endpoints: flat slope
  if (!prev && next) {
    const dt = (next.time - curr.time) * tension;
    const dy = (next.value - curr.value) * tension * 0.5;
    const { angle, length } = calculateAngleAndLength(dt, dy);
    return {
      handleIn: { x: -dt, y: 0, angle: 180, length: dt },
      handleOut: { x: dt, y: dy, angle, length },
    };
  }

  if (prev && !next) {
    const dt = (curr.time - prev.time) * tension;
    const dy = (curr.value - prev.value) * tension * 0.5;
    const { angle, length } = calculateAngleAndLength(-dt, -dy);
    return {
      handleIn: { x: -dt, y: -dy, angle, length },
      handleOut: { x: dt, y: 0, angle: 0, length: dt },
    };
  }

  // Middle keyframe
  if (prev && next) {
    const isExtremum =
      (curr.value >= prev.value && curr.value >= next.value) ||
      (curr.value <= prev.value && curr.value <= next.value);

    if (isExtremum) {
      // Zero slope at peaks/valleys to eliminate unwanted overshoot
      const dtIn = (curr.time - prev.time) * tension;
      const dtOut = (next.time - curr.time) * tension;
      return {
        handleIn: { x: -dtIn, y: 0, angle: 180, length: dtIn },
        handleOut: { x: dtOut, y: 0, angle: 0, length: dtOut },
      };
    }

    const dt = (next.time - prev.time) * 0.5;
    const slope = (next.value - prev.value) / (next.time - prev.time || 1);

    const dtIn = (curr.time - prev.time) * tension;
    const dyIn = -slope * dtIn;
    const dtOut = (next.time - curr.time) * tension;
    const dyOut = slope * dtOut;

    const inData = calculateAngleAndLength(-dtIn, dyIn);
    const outData = calculateAngleAndLength(dtOut, dyOut);

    return {
      handleIn: { x: -dtIn, y: dyIn, angle: inData.angle, length: inData.length },
      handleOut: { x: dtOut, y: dyOut, angle: outData.angle, length: outData.length },
    };
  }

  return {
    handleIn: { x: -15, y: 0, angle: 180, length: 15 },
    handleOut: { x: 15, y: 0, angle: 0, length: 15 },
  };
}

/**
 * Updates a keyframe with the specified tangent type.
 */
export function applyTangentType(
  kf: KeyframePoint,
  type: TangentType,
  prev: KeyframePoint | null = null,
  next: KeyframePoint | null = null
): KeyframePoint {
  switch (type) {
    case 'flat': {
      return {
        ...kf,
        tangentType: 'flat',
        ease: 'bezier',
        handleIn: { x: -15, y: 0, angle: 180, length: 15 },
        handleOut: { x: 15, y: 0, angle: 0, length: 15 },
        symmetrical: true,
      };
    }
    case 'linear': {
      const dtIn = prev ? (kf.time - prev.time) * 0.33 : 15;
      const dyIn = prev ? (prev.value - kf.value) * 0.33 : 0;
      const dtOut = next ? (next.time - kf.time) * 0.33 : 15;
      const dyOut = next ? (next.value - kf.value) * 0.33 : 0;
      return {
        ...kf,
        tangentType: 'linear',
        ease: 'linear',
        handleIn: { x: -dtIn, y: dyIn },
        handleOut: { x: dtOut, y: dyOut },
        symmetrical: false,
      };
    }
    case 'auto': {
      const { handleIn, handleOut } = computeAutoTangents(prev, kf, next);
      return {
        ...kf,
        tangentType: 'auto',
        ease: 'bezier',
        handleIn,
        handleOut,
        symmetrical: true,
      };
    }
    case 'continuous': {
      const outAngle = kf.handleOut?.angle ?? 0;
      const inLen = kf.handleIn?.length ?? 15;
      const inDelta = calculateDelta((outAngle + 180) % 360, inLen);
      return {
        ...kf,
        tangentType: 'continuous',
        ease: 'bezier',
        handleIn: { ...inDelta, angle: (outAngle + 180) % 360, length: inLen },
        symmetrical: false,
        lockedAngle: true,
      };
    }
    case 'broken': {
      return {
        ...kf,
        tangentType: 'broken',
        ease: 'bezier',
        symmetrical: false,
        lockedAngle: false,
      };
    }
    case 'free':
    default: {
      return {
        ...kf,
        tangentType: 'free',
        ease: 'bezier',
        symmetrical: false,
        lockedAngle: false,
        lockedLength: false,
      };
    }
  }
}
