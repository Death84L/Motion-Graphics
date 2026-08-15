import { BezierHandle, KeyframePoint, TangentType } from '../../features/graph-editor/types';
import { calculateAngleAndLength, calculateDelta } from './tangentMath';

export interface NumericalTangentConfig {
  inAngle: number;
  inLength: number;
  outAngle: number;
  outLength: number;
  isLockedAngle?: boolean;
  isLockedLength?: boolean;
  isWeighted?: boolean;
}

/**
 * Updates a keyframe with exact numerical tangent angles and lengths.
 */
export function applyNumericalTangents(
  keyframe: KeyframePoint,
  config: NumericalTangentConfig
): KeyframePoint {
  const handleInDelta = calculateDelta(config.inAngle, config.inLength);
  const handleOutDelta = calculateDelta(config.outAngle, config.outLength);

  return {
    ...keyframe,
    type: 'bezier',
    handleIn: {
      x: handleInDelta.x,
      y: handleInDelta.y,
      angle: config.inAngle,
      length: config.inLength,
    },
    handleOut: {
      x: handleOutDelta.x,
      y: handleOutDelta.y,
      angle: config.outAngle,
      length: config.outLength,
    },
    lockedAngle: config.isLockedAngle,
    lockedLength: config.isLockedLength,
  };
}

/**
 * Computes weighted tangents where handle length is normalized relative to neighboring segment durations.
 */
export function applyWeightedTangents(
  prev: KeyframePoint | null,
  curr: KeyframePoint,
  next: KeyframePoint | null,
  inWeight = 0.33,
  outWeight = 0.33
): KeyframePoint {
  const dtIn = prev ? (curr.time - prev.time) * inWeight : 15;
  const dtOut = next ? (next.time - curr.time) * outWeight : 15;

  const dyIn = curr.handleIn ? (curr.handleIn.y / (curr.handleIn.x || 1)) * -dtIn : 0;
  const dyOut = curr.handleOut ? (curr.handleOut.y / (curr.handleOut.x || 1)) * dtOut : 0;

  const inVector = calculateAngleAndLength(-dtIn, dyIn);
  const outVector = calculateAngleAndLength(dtOut, dyOut);

  return {
    ...curr,
    handleIn: {
      x: -dtIn,
      y: dyIn,
      angle: inVector.angle,
      length: inVector.length,
    },
    handleOut: {
      x: dtOut,
      y: dyOut,
      angle: outVector.angle,
      length: outVector.length,
    },
  };
}

/**
 * Mirrors incoming tangent to outgoing tangent for smooth continuity.
 */
export function mirrorIncomingToOutgoing(keyframe: KeyframePoint): KeyframePoint {
  if (!keyframe.handleIn) return keyframe;

  const inAngle = keyframe.handleIn.angle ?? 180;
  const outAngle = (inAngle + 180) % 360;
  const outLength = keyframe.handleIn.length ?? 15;
  const delta = calculateDelta(outAngle, outLength);

  return {
    ...keyframe,
    handleOut: {
      x: delta.x,
      y: delta.y,
      angle: outAngle,
      length: outLength,
    },
    symmetrical: true,
  };
}
