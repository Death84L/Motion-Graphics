import { KeyframePoint, CurveLayer } from '../../features/graph-editor/types';

export type StaggerDirection =
  | 'left-to-right'
  | 'right-to-left'
  | 'center-out'
  | 'outside-in'
  | 'random'
  | 'reverse';

export interface StaggerConfig {
  intervalFrames: number; // e.g. 3 frames between each layer
  direction: StaggerDirection;
  randomnessPercent: number; // 0 to 100%
  easeDistribution: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export const DEFAULT_STAGGER_CONFIG: StaggerConfig = {
  intervalFrames: 4,
  direction: 'left-to-right',
  randomnessPercent: 0,
  easeDistribution: 'easeOut',
};

/**
 * Calculates layer-by-layer frame offsets based on count, direction, and easing distribution.
 */
export function calculateLayerStaggerOffsets(
  layerCount: number,
  config: StaggerConfig = DEFAULT_STAGGER_CONFIG
): number[] {
  if (layerCount <= 0) return [];
  if (layerCount === 1) return [0];

  const offsets: number[] = new Array(layerCount).fill(0);
  const totalSpan = (layerCount - 1) * config.intervalFrames;

  for (let i = 0; i < layerCount; i++) {
    let norm = i / (layerCount - 1);

    switch (config.direction) {
      case 'right-to-left':
      case 'reverse':
        norm = 1 - norm;
        break;

      case 'center-out': {
        const mid = (layerCount - 1) / 2;
        norm = Math.abs(i - mid) / (mid || 1);
        break;
      }

      case 'outside-in': {
        const mid = (layerCount - 1) / 2;
        norm = 1 - Math.abs(i - mid) / (mid || 1);
        break;
      }

      case 'random': {
        norm = Math.random();
        break;
      }

      case 'left-to-right':
      default:
        break;
    }

    // Apply Easing to the Stagger Timing Curve
    let easedNorm = norm;
    if (config.easeDistribution === 'easeOut') {
      easedNorm = Math.sin((norm * Math.PI) / 2);
    } else if (config.easeDistribution === 'easeIn') {
      easedNorm = 1 - Math.cos((norm * Math.PI) / 2);
    } else if (config.easeDistribution === 'easeInOut') {
      easedNorm = -(Math.cos(Math.PI * norm) - 1) / 2;
    }

    let frameOffset = easedNorm * totalSpan;

    // Apply Randomness Jitter
    if (config.randomnessPercent > 0) {
      const jitter = (Math.random() - 0.5) * 2 * (config.randomnessPercent / 100) * config.intervalFrames;
      frameOffset = Math.max(0, frameOffset + jitter);
    }

    offsets[i] = Math.round(frameOffset);
  }

  return offsets;
}

/**
 * Distributes an animation template across multiple layers with intelligent staggering.
 */
export function applyStaggerToLayers(
  layers: CurveLayer[],
  config: StaggerConfig = DEFAULT_STAGGER_CONFIG
): CurveLayer[] {
  const offsets = calculateLayerStaggerOffsets(layers.length, config);

  return layers.map((layer, idx) => {
    const shift = offsets[idx];
    const updatedKeyframes = layer.keyframes.map((k) => ({
      ...k,
      time: Math.max(0, Math.min(100, k.time + shift)),
    }));

    return {
      ...layer,
      keyframes: updatedKeyframes,
    };
  });
}
