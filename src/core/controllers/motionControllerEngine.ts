import { ObjectAnimationModel, AnimatableProperty } from '../engine/universalAnimationModel';

export interface PropertyWeightMapping {
  property: AnimatableProperty;
  weight: number; // e.g. 1.0, 0.4, -0.5 (invert)
  offset: number;
}

export interface UniversalMotionControllerConfig {
  id: string;
  name: string;
  progress: number; // 0 to 1
  intensity: number; // 0.1 to 3.0
  speed: number; // 0.25 to 4.0
  directionAngle: number; // 0 to 360 deg
  amount: number; // 0 to 100%
  randomness: number; // 0 to 100%
  overshoot: number; // 0 to 50%
  blend: number; // 0 to 1
  propertyWeights: PropertyWeightMapping[];
}

export const DEFAULT_MOTION_CONTROLLER: UniversalMotionControllerConfig = {
  id: 'ctrl-master',
  name: 'Master Motion Controller',
  progress: 0.5,
  intensity: 1.0,
  speed: 1.0,
  directionAngle: 0,
  amount: 100,
  randomness: 0,
  overshoot: 15,
  blend: 1.0,
  propertyWeights: [
    { property: 'position-y', weight: 1.0, offset: 0 },
    { property: 'position-x', weight: 0.8, offset: 0 },
    { property: 'scale-uniform', weight: 0.4, offset: 0 },
    { property: 'rotation-z', weight: 0.2, offset: 0 },
    { property: 'blur', weight: 0.6, offset: 0 },
    { property: 'glow-intensity', weight: 0.7, offset: 0 },
  ],
};

/**
 * Modulates an evaluated property value through the master controller weights.
 */
export function applyMotionControllerToValue(
  baseValue: number,
  property: AnimatableProperty,
  controller: UniversalMotionControllerConfig = DEFAULT_MOTION_CONTROLLER
): number {
  const mapping = controller.propertyWeights.find((w) => w.property === property);
  const weight = mapping ? mapping.weight : 1.0;
  const offset = mapping ? mapping.offset : 0;

  // Master intensity and amount scaling
  const scaledIntensity = controller.intensity * (controller.amount / 100);
  let finalVal = baseValue * weight * scaledIntensity + offset;

  // Apply direction angle projection if 2D translation
  if (property === 'position-x') {
    const rad = (controller.directionAngle * Math.PI) / 180;
    finalVal += Math.cos(rad) * 10 * scaledIntensity;
  } else if (property === 'position-y') {
    const rad = (controller.directionAngle * Math.PI) / 180;
    finalVal += Math.sin(rad) * 10 * scaledIntensity;
  }

  // Apply jitter randomness
  if (controller.randomness > 0) {
    const jitter = (Math.random() - 0.5) * 2 * (controller.randomness / 100) * 10;
    finalVal += jitter;
  }

  return Math.round(finalVal * 10) / 10;
}
