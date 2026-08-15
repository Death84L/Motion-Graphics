import { KeyframePoint } from '../../features/graph-editor/types';

export interface SnappingConfig {
  enabled: boolean;
  snapToGrid: boolean;
  snapToKeyframes: boolean;
  snapToPlayhead: boolean;
  snapToGuidelines: boolean; // 0%, 25%, 50%, 75%, 100%
  snapTangentHandles: boolean;
  timeThreshold: number; // in frames (e.g. 1.5f)
  valueThreshold: number; // in value % (e.g. 2.0%)
  frameStep: number;
  valueStep: number;
}

export interface SnapResult {
  time: number;
  value: number;
  snappedTime: boolean;
  snappedValue: boolean;
  snapSourceTime?: string;
  snapSourceValue?: string;
}

export const DEFAULT_SNAPPING_CONFIG: SnappingConfig = {
  enabled: true,
  snapToGrid: true,
  snapToKeyframes: true,
  snapToPlayhead: true,
  snapToGuidelines: true,
  snapTangentHandles: true,
  timeThreshold: 1.5,
  valueThreshold: 2.5,
  frameStep: 5,
  valueStep: 10,
};

/**
 * Multi-target magnetic snapping engine for time and value coordinates.
 */
export function applyMagneticSnapping(
  rawTime: number,
  rawValue: number,
  config: SnappingConfig,
  context: {
    keyframes: KeyframePoint[];
    currentKeyframeId?: number;
    playheadTime?: number;
    guidelines?: number[];
  }
): SnapResult {
  if (!config.enabled) {
    return {
      time: Math.max(0, Math.min(100, rawTime)),
      value: rawValue,
      snappedTime: false,
      snappedValue: false,
    };
  }

  let finalTime = rawTime;
  let finalValue = rawValue;
  let snappedTime = false;
  let snappedValue = false;
  let snapSourceTime: string | undefined;
  let snapSourceValue: string | undefined;

  // 1. Snap to Playhead
  if (config.snapToPlayhead && context.playheadTime !== undefined) {
    if (Math.abs(rawTime - context.playheadTime) <= config.timeThreshold) {
      finalTime = context.playheadTime;
      snappedTime = true;
      snapSourceTime = 'Playhead';
    }
  }

  // 2. Snap to other Keyframes
  if (config.snapToKeyframes && !snappedTime) {
    for (const kf of context.keyframes) {
      if (kf.id === context.currentKeyframeId) continue;

      if (!snappedTime && Math.abs(rawTime - kf.time) <= config.timeThreshold) {
        finalTime = kf.time;
        snappedTime = true;
        snapSourceTime = `Keyframe @ ${kf.time}f`;
      }

      if (!snappedValue && Math.abs(rawValue - kf.value) <= config.valueThreshold) {
        finalValue = kf.value;
        snappedValue = true;
        snapSourceValue = `Keyframe Val ${kf.value}%`;
      }
    }
  }

  // 3. Snap to Guidelines (0%, 25%, 50%, 75%, 100%)
  if (config.snapToGuidelines && !snappedValue) {
    const guidelines = context.guidelines || [0, 25, 50, 75, 100];
    for (const g of guidelines) {
      if (Math.abs(rawValue - g) <= config.valueThreshold) {
        finalValue = g;
        snappedValue = true;
        snapSourceValue = `Guide ${g}%`;
        break;
      }
    }
  }

  // 4. Snap to Grid
  if (config.snapToGrid) {
    if (!snappedTime) {
      const nearestFrame = Math.round(rawTime / config.frameStep) * config.frameStep;
      if (Math.abs(rawTime - nearestFrame) <= config.timeThreshold) {
        finalTime = nearestFrame;
        snappedTime = true;
        snapSourceTime = `Grid ${nearestFrame}f`;
      }
    }

    if (!snappedValue) {
      const nearestVal = Math.round(rawValue / config.valueStep) * config.valueStep;
      if (Math.abs(rawValue - nearestVal) <= config.valueThreshold) {
        finalValue = nearestVal;
        snappedValue = true;
        snapSourceValue = `Grid ${nearestVal}%`;
      }
    }
  }

  return {
    time: Math.max(0, Math.min(100, Math.round(finalTime * 10) / 10)),
    value: Math.round(finalValue * 10) / 10,
    snappedTime,
    snappedValue,
    snapSourceTime,
    snapSourceValue,
  };
}
