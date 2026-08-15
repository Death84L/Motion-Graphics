import { ObjectAnimationModel } from '../engine/universalAnimationModel';

export type PresetVariantTier = 'soft' | 'medium' | 'strong' | 'extreme';

export interface ParametricPresetDefinition {
  id: string;
  name: string;
  category: 'entrance' | 'emphasis' | 'exit' | 'physics' | 'typography';
  author: string;
  version: string;
  description: string;
  tags: string[];
  baseModel: ObjectAnimationModel;
  variantMultipliers: Record<PresetVariantTier, {
    intensity: number;
    stiffness: number;
    damping: number;
    overshootPercent: number;
  }>;
}

export const PARAMETRIC_PRESETS_REGISTRY: ParametricPresetDefinition[] = [
  {
    id: 'preset-harmonic-pop',
    name: 'Harmonic Elastic Pop',
    category: 'entrance',
    author: 'Motion Studio Team',
    version: '2.1.0',
    description: 'Dynamic physics pop with decaying harmonic oscillations.',
    tags: ['pop', 'elastic', 'spring', 'branding'],
    baseModel: {
      id: 'model-pop',
      objectId: 'target',
      objectName: 'Target',
      enabled: true,
      totalDurationFrames: 60,
      stages: [],
    },
    variantMultipliers: {
      soft: { intensity: 0.7, stiffness: 100, damping: 24, overshootPercent: 8 },
      medium: { intensity: 1.0, stiffness: 150, damping: 18, overshootPercent: 15 },
      strong: { intensity: 1.3, stiffness: 200, damping: 12, overshootPercent: 25 },
      extreme: { intensity: 1.7, stiffness: 280, damping: 7, overshootPercent: 40 },
    },
  },
  {
    id: 'preset-smooth-glide',
    name: 'Cinematic Smooth Glide',
    category: 'entrance',
    author: 'Motion Studio Team',
    version: '2.0.0',
    description: 'Silky smooth translation with zero jerk and perfect settling.',
    tags: ['smooth', 'glide', 'cinematic', 'minimal'],
    baseModel: {
      id: 'model-glide',
      objectId: 'target',
      objectName: 'Target',
      enabled: true,
      totalDurationFrames: 50,
      stages: [],
    },
    variantMultipliers: {
      soft: { intensity: 0.6, stiffness: 80, damping: 28, overshootPercent: 0 },
      medium: { intensity: 1.0, stiffness: 120, damping: 20, overshootPercent: 4 },
      strong: { intensity: 1.4, stiffness: 180, damping: 14, overshootPercent: 8 },
      extreme: { intensity: 1.8, stiffness: 250, damping: 10, overshootPercent: 14 },
    },
  },
];

/**
 * Derives a scaled parametric model for a specific variant tier (soft, medium, strong, extreme).
 */
export function getPresetVariantModel(
  preset: ParametricPresetDefinition,
  tier: PresetVariantTier = 'medium'
): ParametricPresetDefinition['variantMultipliers'][PresetVariantTier] {
  return preset.variantMultipliers[tier] || preset.variantMultipliers.medium;
}
