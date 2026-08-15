import { EasingType } from '../../graph-editor/types';

export type TextStaggerMode = 'character' | 'word' | 'line';
export type TextAnimationEffect =
  | 'typewriter'
  | 'slide-up-bounce'
  | 'pop-scale'
  | 'blur-tracking'
  | 'fade-drift'
  | 'elastic-drop';

export interface TextAnimationConfig {
  text: string;
  staggerMode: TextStaggerMode;
  effect: TextAnimationEffect;
  staggerDelayMs: number; // e.g. 35ms per letter
  durationPerItemFrames: number; // e.g. 18f
  overshootPercent: number; // e.g. 15%
  trackingStartEm: number; // e.g. 0.3em
  trackingEndEm: number; // e.g. 0.05em
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  glowColor: string;
  ease: EasingType;
}

export const DEFAULT_TEXT_CONFIG: TextAnimationConfig = {
  text: 'MOTION STUDIO',
  staggerMode: 'character',
  effect: 'slide-up-bounce',
  staggerDelayMs: 40,
  durationPerItemFrames: 24,
  overshootPercent: 14,
  trackingStartEm: 0.25,
  trackingEndEm: 0.05,
  fontSize: 48,
  fontFamily: 'Inter',
  fontWeight: 800,
  color: '#f8fafc',
  glowColor: '#38bdf8',
  ease: 'easeInOut',
};

export interface StaggeredItemState {
  index: number;
  char: string;
  delayFrames: number;
  progress: number; // 0 to 1
  opacity: number;
  translateY: number;
  scale: number;
  blur: number;
  rotation: number;
}
