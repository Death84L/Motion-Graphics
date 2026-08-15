import { KeyframePoint } from '../../features/graph-editor/types';
import { extractMotionProfile } from '../math/motionMatchingEngine';

export type PresetVariantIntensity = 'soft' | 'medium' | 'strong' | 'extreme';

export interface ParametricPresetDefinition {
  id: string;
  name: string;
  category: 'tactile-ui' | 'cinematic' | 'social-punch' | 'minimal';
  durationMs: number;
  intensity: number; // 0.1 to 2.0
  elasticity: number; // 0 to 100
  overshootPercent: number; // 0 to 40%
  damping: number; // 0.05 to 1.0
  staggerMs: number;
  direction: 'up' | 'down' | 'left' | 'right' | 'scale';
  baseKeyframes: KeyframePoint[];
}

export const LIVING_PARAMETRIC_PRESETS: ParametricPresetDefinition[] = [
  {
    id: 'live-elastic-pop',
    name: 'Elastic Pop 2.0',
    category: 'social-punch',
    durationMs: 420,
    intensity: 1.0,
    elasticity: 82,
    overshootPercent: 18,
    damping: 0.65,
    staggerMs: 25,
    direction: 'scale',
    baseKeyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.15, y: 1.2 } },
      { id: 2, time: 20, value: 118, type: 'bezier', handleIn: { x: 0.25, y: 1.0 }, handleOut: { x: 0.35, y: 1.0 } },
      { id: 3, time: 35, value: 100, type: 'bezier', handleIn: { x: 0.5, y: 1.0 } },
    ],
  },
  {
    id: 'live-cinematic-drift',
    name: 'Cinematic Drift',
    category: 'cinematic',
    durationMs: 650,
    intensity: 0.85,
    elasticity: 15,
    overshootPercent: 0,
    damping: 0.95,
    staggerMs: 45,
    direction: 'up',
    baseKeyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.4, y: 0.1 } },
      { id: 2, time: 60, value: 100, type: 'bezier', handleIn: { x: 0.2, y: 1.0 } },
    ],
  },
  {
    id: 'live-tactile-snap',
    name: 'Tactile Pill Snap',
    category: 'tactile-ui',
    durationMs: 320,
    intensity: 1.1,
    elasticity: 65,
    overshootPercent: 8,
    damping: 0.75,
    staggerMs: 15,
    direction: 'up',
    baseKeyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: 0.9 } },
      { id: 2, time: 18, value: 108, type: 'bezier', handleIn: { x: 0.25, y: 1.0 }, handleOut: { x: 0.35, y: 1.0 } },
      { id: 3, time: 28, value: 100, type: 'bezier', handleIn: { x: 0.4, y: 1.0 } },
    ],
  },
];

/**
 * Evaluates live keyframes from parametric preset settings and variant multiplier.
 */
export function compileParametricPreset(
  preset: ParametricPresetDefinition,
  variant: PresetVariantIntensity = 'medium'
): KeyframePoint[] {
  const intensityMultiplier = variant === 'soft' ? 0.65 : variant === 'medium' ? 1.0 : variant === 'strong' ? 1.35 : 1.75;
  const durSec = (preset.durationMs / 1000) * (variant === 'soft' ? 1.2 : variant === 'extreme' ? 0.8 : 1.0);

  const kfs = JSON.parse(JSON.stringify(preset.baseKeyframes)) as KeyframePoint[];
  const origDur = kfs[kfs.length - 1].time - kfs[0].time || 30;
  const timeRatio = (durSec * 30) / origDur;

  return kfs.map((k, idx) => {
    let val = k.value;
    if (idx === 1 && kfs.length > 2) {
      val = 100 + (preset.overshootPercent * intensityMultiplier);
    }
    return {
      ...k,
      time: Math.round(k.time * timeRatio * 10) / 10,
      value: Math.round(val * 10) / 10,
    };
  });
}

/**
 * Morphs seamlessly between Preset A and Preset B based on 0% -> 100% factor.
 */
export function morphParametricPresets(
  presetA: ParametricPresetDefinition,
  presetB: ParametricPresetDefinition,
  factor = 0.5 // 0.0 (A) to 1.0 (B)
): KeyframePoint[] {
  const keysA = compileParametricPreset(presetA, 'medium');
  const keysB = compileParametricPreset(presetB, 'medium');

  const count = Math.max(keysA.length, keysB.length);
  const morphed: KeyframePoint[] = [];

  for (let i = 0; i < count; i++) {
    const pA = keysA[Math.min(i, keysA.length - 1)];
    const pB = keysB[Math.min(i, keysB.length - 1)];

    morphed.push({
      id: i + 1,
      time: Math.round((pA.time * (1 - factor) + pB.time * factor) * 10) / 10,
      value: Math.round((pA.value * (1 - factor) + pB.value * factor) * 10) / 10,
      type: 'bezier',
      handleIn: {
        x: Math.round(((pA.handleIn?.x ?? 0.25) * (1 - factor) + (pB.handleIn?.x ?? 0.25) * factor) * 100) / 100,
        y: Math.round(((pA.handleIn?.y ?? 1.0) * (1 - factor) + (pB.handleIn?.y ?? 1.0) * factor) * 100) / 100,
      },
      handleOut: {
        x: Math.round(((pA.handleOut?.x ?? 0.25) * (1 - factor) + (pB.handleOut?.x ?? 0.25) * factor) * 100) / 100,
        y: Math.round(((pA.handleOut?.y ?? 1.0) * (1 - factor) + (pB.handleOut?.y ?? 1.0) * factor) * 100) / 100,
      },
    });
  }

  return morphed;
}

/**
 * Extracts a reusable Parametric Preset from an arbitrary keyframe animation.
 */
export function extractPresetFromAnimation(
  keyframes: KeyframePoint[],
  name = 'Custom Extracted Preset'
): ParametricPresetDefinition {
  const profile = extractMotionProfile(keyframes);
  return {
    id: `custom-preset-${Date.now()}`,
    name,
    category: profile.overshootPercent > 10 ? 'social-punch' : 'cinematic',
    durationMs: Math.round(profile.duration * 1000),
    intensity: 1.0,
    elasticity: Math.round(profile.overshootPercent * 2.5),
    overshootPercent: profile.overshootPercent,
    damping: profile.dampingEstimate,
    staggerMs: 25,
    direction: 'up',
    baseKeyframes: JSON.parse(JSON.stringify(keyframes)),
  };
}
