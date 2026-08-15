import { KeyframePoint } from '../../features/graph-editor/types';
import { calculateAngleAndLength, calculateDelta } from '../math/tangentMath';

/**
 * Automatically locks opposite tangent handle in collinear alignment to preserve C1 velocity continuity.
 */
export function enforceMagneticContinuity(
  keyframe: KeyframePoint,
  activeHandleType: 'handleIn' | 'handleOut'
): KeyframePoint {
  const isHandleIn = activeHandleType === 'handleIn';
  const activeHandle = isHandleIn ? keyframe.handleIn : keyframe.handleOut;
  if (!activeHandle) return keyframe;

  const rawAngle = activeHandle.angle ?? (isHandleIn ? 180 : 0);
  const rawLen = activeHandle.length ?? 12;
  const oppAngle = (rawAngle + 180) % 360;
  const oppLength = isHandleIn
    ? keyframe.handleOut?.length ?? rawLen
    : keyframe.handleIn?.length ?? rawLen;

  const oppDelta = calculateDelta(oppAngle, oppLength);

  if (isHandleIn) {
    return {
      ...keyframe,
      handleOut: { ...oppDelta, angle: oppAngle, length: oppLength },
      symmetrical: true,
    };
  } else {
    return {
      ...keyframe,
      handleIn: { ...oppDelta, angle: oppAngle, length: oppLength },
      symmetrical: true,
    };
  }
}
