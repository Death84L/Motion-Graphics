import { KeyframePoint } from '../../features/graph-editor/types';
import { AspectRatioType, ASPECT_RATIOS } from '../../features/composition/types/composition.types';

export interface ResponsiveMotionConstraint {
  anchorParent: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'relative-percent';
  relativePercentX: number; // e.g. 50%
  relativePercentY: number; // e.g. 20%
  preserveSpeedScale: boolean;
}

export const DEFAULT_MOTION_CONSTRAINT: ResponsiveMotionConstraint = {
  anchorParent: 'center',
  relativePercentX: 50,
  relativePercentY: 50,
  preserveSpeedScale: true,
};

/**
 * Automatically adapts animation trajectories when resizing between aspect ratios (e.g. 16:9 -> 9:16 -> 1:1).
 */
export function adaptAnimationToAspectRatio(
  sourceKeyframes: KeyframePoint[],
  sourceRatio: AspectRatioType,
  targetRatio: AspectRatioType,
  property: 'position-x' | 'position-y' | 'scale' | 'rotation'
): KeyframePoint[] {
  if (sourceRatio === targetRatio) return sourceKeyframes;

  const srcDim = ASPECT_RATIOS[sourceRatio];
  const tgtDim = ASPECT_RATIOS[targetRatio];

  let scaleFactor = 1.0;

  if (property === 'position-x') {
    scaleFactor = tgtDim.width / srcDim.width;
  } else if (property === 'position-y') {
    scaleFactor = tgtDim.height / srcDim.height;
  } else if (property === 'scale') {
    const srcArea = srcDim.width * srcDim.height;
    const tgtArea = tgtDim.width * tgtDim.height;
    scaleFactor = Math.sqrt(tgtArea / srcArea);
  }

  return sourceKeyframes.map((k) => ({
    ...k,
    value: Math.round(k.value * scaleFactor * 10) / 10,
    handleIn: k.handleIn ? { ...k.handleIn, y: k.handleIn.y * scaleFactor } : undefined,
    handleOut: k.handleOut ? { ...k.handleOut, y: k.handleOut.y * scaleFactor } : undefined,
  }));
}
