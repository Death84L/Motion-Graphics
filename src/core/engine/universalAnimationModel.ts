import { EasingType, KeyframePoint } from '../../features/graph-editor/types';

// 1. Comprehensive Animatable Properties (Transform, Appearance, Text, Camera)
export type AnimatableProperty =
  // Transform 2D / 3D
  | 'position-x'
  | 'position-y'
  | 'position-z'
  | 'scale-x'
  | 'scale-y'
  | 'scale-uniform'
  | 'rotation-z'
  | 'rotation-x'
  | 'rotation-y'
  | 'skew-x'
  | 'skew-y'
  | 'anchor-x'
  | 'anchor-y'
  // Appearance & Styling
  | 'opacity'
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'glow-intensity'
  | 'shadow-elevation'
  | 'border-radius'
  // Typography
  | 'font-size'
  | 'letter-spacing'
  | 'word-spacing'
  | 'line-height'
  // Camera & Spatial
  | 'camera-zoom'
  | 'camera-pan-x'
  | 'camera-pan-y'
  | 'camera-tilt';

export type AnimationStageCategory = 'entrance' | 'emphasis' | 'exit' | 'interaction' | 'continuous';

export type MotionCategoryType =
  | 'basic'
  | 'motion-design'
  | 'physics'
  | 'procedural'
  | 'text'
  | 'camera'
  | 'path';

export type MotionBlockPresetId =
  // Basic
  | 'move-linear'
  | 'fade-in'
  | 'fade-out'
  | 'scale-uniform'
  | 'rotate-spin'
  // Motion Design Styles
  | 'slide-overshoot'
  | 'scale-pop'
  | 'elastic-snap'
  | 'drop-bounce'
  | 'squash-stretch'
  | 'rubber-band'
  | 'drift-float'
  // Physics & Procedural
  | 'harmonic-spring'
  | 'gravity-bounce'
  | 'natural-wiggle'
  | 'perlin-noise'
  | 'sine-wave'
  | 'quantize-steps'
  // Typography
  | 'typewriter-char'
  | 'tracking-expand'
  | 'text-wave-stagger'
  | 'blur-reveal'
  // Camera & Spatial
  | 'camera-cinematic-push'
  | 'camera-handheld-shake'
  | 'path-orbit-circle';

export type BlockBlendMode = 'replace' | 'additive' | 'multiply' | 'overlay';

export interface ParametricBlockConfig {
  id: string;
  presetId: MotionBlockPresetId;
  name: string;
  category: MotionCategoryType;
  stage: AnimationStageCategory;
  targetProperties: AnimatableProperty[];
  enabled: boolean;
  muted?: boolean;
  solo?: boolean;

  // Timing
  startFrame: number;
  durationFrames: number;
  delayFrames: number;
  loopCount: number; // 1 = once, 0 = infinite
  pingPong: boolean;
  reverse: boolean;

  // Primary Motion Parameters
  intensity: number; // 0 to 2.0
  startValue: number;
  targetValue: number;
  ease: EasingType;
  blendMode: BlockBlendMode;

  // Specialized Physics / Procedural Sliders
  params: {
    stiffness?: number; // Spring stiffness (20 to 400)
    damping?: number; // Spring damping (2 to 40)
    mass?: number; // Mass (0.1 to 5.0)
    overshootPercent?: number; // Overshoot magnitude (0 to 50%)
    reboundDecay?: number; // Rebound attenuation (0 to 1)
    amplitude?: number; // Wave / Noise amplitude
    frequency?: number; // Wave / Noise frequency
    octaves?: number; // Noise octaves
    randomness?: number; // Jitter randomness (0 to 100%)
    staggerMs?: number; // Typography / multi-element stagger delay
    directionAngle?: number; // Direction vector in degrees (0 to 360)
    stepsCount?: number; // Quantize steps
  };
}

export interface AnimationStageSequence {
  id: string;
  name: string;
  stage: AnimationStageCategory;
  enabled: boolean;
  startFrame: number;
  durationFrames: number;
  stageEase: EasingType;
  blocks: ParametricBlockConfig[];
}

export interface ObjectAnimationModel {
  id: string;
  objectId: string;
  objectName: string;
  enabled: boolean;
  totalDurationFrames: number;
  stages: AnimationStageSequence[];
}
