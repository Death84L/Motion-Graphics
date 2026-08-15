import { KeyframePoint } from '../../features/graph-editor/types';

export interface StageRecipe {
  enabled: boolean;
  direction?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'scale';
  distancePx?: number;
  durationMs: number;
  easeType: 'cubic-bezier' | 'spring' | 'linear' | 'bounce';
  overshootPercent?: number;
  springDamping?: number;
  scaleFactor?: number;
}

export interface MotionRecipe {
  id: string;
  name: string;
  category: 'tactile-ui' | 'cinematic' | 'social-punch' | 'minimal';
  description: string;
  entrance: StageRecipe;
  emphasis: StageRecipe;
  exit: StageRecipe;
}

export const SAMPLE_MOTION_RECIPES: MotionRecipe[] = [
  {
    id: 'recipe-tactile-pop',
    name: 'Tactile Pill Pop & Settle',
    category: 'tactile-ui',
    description: 'Crisp entrance slide with subtle overshoot and responsive press emphasis.',
    entrance: {
      enabled: true,
      direction: 'bottom',
      distancePx: 60,
      durationMs: 380,
      easeType: 'spring',
      overshootPercent: 12,
      springDamping: 0.16,
    },
    emphasis: {
      enabled: true,
      scaleFactor: 1.08,
      durationMs: 140,
      easeType: 'spring',
      springDamping: 0.08,
    },
    exit: {
      enabled: true,
      direction: 'top',
      durationMs: 260,
      easeType: 'cubic-bezier',
    },
  },
  {
    id: 'recipe-cinematic-drift',
    name: 'Cinematic Elegance Drift',
    category: 'cinematic',
    description: 'Smooth organic acceleration with zero jerk and soft tracking settle.',
    entrance: {
      enabled: true,
      direction: 'left',
      distancePx: 40,
      durationMs: 650,
      easeType: 'cubic-bezier',
      overshootPercent: 0,
    },
    emphasis: {
      enabled: false,
      durationMs: 200,
      easeType: 'linear',
    },
    exit: {
      enabled: true,
      direction: 'right',
      durationMs: 400,
      easeType: 'cubic-bezier',
    },
  },
];

/**
 * Compiles a structured Motion Recipe into concrete KeyframePoint curves.
 */
export function compileRecipeToKeyframes(recipe: MotionRecipe): KeyframePoint[] {
  const keyframes: KeyframePoint[] = [];

  // Entrance
  const entDurSec = recipe.entrance.durationMs / 1000;
  keyframes.push({ id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: 0.8 } });

  if (recipe.entrance.overshootPercent && recipe.entrance.overshootPercent > 0) {
    const overshootVal = 100 + recipe.entrance.overshootPercent;
    keyframes.push({
      id: 2,
      time: Math.round(entDurSec * 0.7 * 100) / 100,
      value: overshootVal,
      type: 'bezier',
      handleIn: { x: 0.3, y: 1.0 },
      handleOut: { x: 0.4, y: 1.0 },
    });
  }

  keyframes.push({
    id: keyframes.length + 1,
    time: Math.round(entDurSec * 100) / 100,
    value: 100,
    type: 'bezier',
    handleIn: { x: 0.5, y: 1.0 },
  });

  return keyframes;
}
