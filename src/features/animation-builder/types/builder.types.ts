import { KeyframePoint, EasingType } from '../../graph-editor/types';

export type AnimationPhase = 'entrance' | 'emphasis' | 'exit';

export type EntrancePresetType =
  | 'slide-up-overshoot'
  | 'scale-pop'
  | 'drop-bounce'
  | 'blur-fade-in'
  | 'elastic-snap'
  | 'typewriter-reveal';

export type EmphasisPresetType =
  | 'pulse-heartbeat'
  | 'wiggle-natural'
  | 'shake-jitter'
  | 'float-hover'
  | 'spin-360'
  | 'glow-flash';

export type ExitPresetType =
  | 'slide-down-fade'
  | 'scale-collapse'
  | 'blur-dissolve'
  | 'snap-pop-out'
  | 'elastic-recoil';

export interface AnimationBlockConfig {
  id: string;
  phase: AnimationPhase;
  preset: string;
  name: string;
  enabled: boolean;
  startFrame: number;
  durationFrames: number;
  intensity: number; // 0 to 2.0
  ease: EasingType;
  staggerMs?: number;
}

export interface AnimationBuilderRecipe {
  id: string;
  name: string;
  description: string;
  targetPropertyChannels: ('position-y' | 'position-x' | 'scale' | 'rotation' | 'opacity' | 'blur')[];
  blocks: AnimationBlockConfig[];
}

export const DEFAULT_BUILDER_RECIPES: AnimationBuilderRecipe[] = [
  {
    id: 'recipe-punchy-hero',
    name: 'Punchy Hero Entrance & Loop',
    description: 'Energetic slide-up overshoot entrance followed by a subtle hovering float and snappy exit.',
    targetPropertyChannels: ['position-y', 'scale', 'opacity'],
    blocks: [
      {
        id: 'block-ent-1',
        phase: 'entrance',
        preset: 'slide-up-overshoot',
        name: 'Slide Up + Overshoot (Entrance)',
        enabled: true,
        startFrame: 0,
        durationFrames: 30,
        intensity: 1.2,
        ease: 'easeInOut',
      },
      {
        id: 'block-emp-1',
        phase: 'emphasis',
        preset: 'float-hover',
        name: 'Subtle Floating Hover (Loop)',
        enabled: true,
        startFrame: 30,
        durationFrames: 45,
        intensity: 0.8,
        ease: 'easeInOut',
      },
      {
        id: 'block-ext-1',
        phase: 'exit',
        preset: 'scale-collapse',
        name: 'Scale Collapse & Fade (Exit)',
        enabled: true,
        startFrame: 75,
        durationFrames: 25,
        intensity: 1.0,
        ease: 'easeInOut',
      },
    ],
  },
  {
    id: 'recipe-ui-card-pop',
    name: 'UI Card Scale Pop',
    description: 'Instant tactile button/card pop with gentle breathing idle.',
    targetPropertyChannels: ['scale', 'opacity'],
    blocks: [
      {
        id: 'block-card-ent',
        phase: 'entrance',
        preset: 'scale-pop',
        name: 'Scale Pop In (Entrance)',
        enabled: true,
        startFrame: 0,
        durationFrames: 22,
        intensity: 1.15,
        ease: 'spring',
      },
      {
        id: 'block-card-emp',
        phase: 'emphasis',
        preset: 'pulse-heartbeat',
        name: 'Rhythmic Pulse (Idle)',
        enabled: true,
        startFrame: 25,
        durationFrames: 50,
        intensity: 0.6,
        ease: 'easeInOut',
      },
    ],
  },
];
