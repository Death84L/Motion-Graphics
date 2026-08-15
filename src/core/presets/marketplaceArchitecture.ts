import { KeyframePoint } from '../../features/graph-editor/types';

export type PresetCategory = 'Entrance' | 'Exit' | 'Scale' | 'Attention' | 'Transitions';

export interface MotionMarketplacePreset {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  tags: string[];
  author: string;
  version: string;
  rating: number; // e.g. 4.9
  downloads: number;
  isFavorite?: boolean;
  compatibility: ('AfterEffects' | 'Premiere' | 'Resolve' | 'Web' | 'Lottie')[];
  keyframes: KeyframePoint[];
}

export const MOTION_LIBRARY_PRESETS: MotionMarketplacePreset[] = [
  // 1. Entrance Category
  {
    id: 'ent-soft-slide',
    name: 'Soft Slide In',
    category: 'Entrance',
    description: 'Gentle deceleration glide into view with subtle ease-out cushioning',
    tags: ['slide', 'smooth', 'minimal', 'ui'],
    author: 'Motion Studio Team',
    version: '1.2',
    rating: 4.9,
    downloads: 1420,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', ease: 'easeOut', handleOut: { x: 35, y: 55, length: 45 } },
      { id: 2, time: 100, value: 100, type: 'bezier', ease: 'easeOut', handleIn: { x: -35, y: 0, length: 35 } },
    ],
  },
  {
    id: 'ent-overshoot-slide',
    name: 'Overshoot Slide',
    category: 'Entrance',
    description: 'Snappy entrance rushing past target before settling with subtle bounce',
    tags: ['punchy', 'overshoot', 'dynamic', 'pop'],
    author: 'Motion Studio Team',
    version: '2.0',
    rating: 5.0,
    downloads: 3200,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 65, value: 114, type: 'bezier', ease: 'easeInOut' },
      { id: 3, time: 85, value: 96, type: 'bezier', ease: 'easeInOut' },
      { id: 4, time: 100, value: 100, type: 'bezier', ease: 'easeInOut' },
    ],
  },
  {
    id: 'ent-elastic-slide',
    name: 'Elastic Slide',
    category: 'Entrance',
    description: 'Bouncy spring elastic oscillation simulating physical rubber tension',
    tags: ['elastic', 'spring', 'playful'],
    author: 'Physics Lab',
    version: '1.0',
    rating: 4.8,
    downloads: 980,
    compatibility: ['AfterEffects', 'Premiere', 'Web'],
    keyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 45, value: 120, type: 'bezier' },
      { id: 3, time: 70, value: 92, type: 'bezier' },
      { id: 4, time: 88, value: 104, type: 'bezier' },
      { id: 5, time: 100, value: 100, type: 'bezier' },
    ],
  },

  // 2. Scale Category
  {
    id: 'scale-pop',
    name: 'Snappy Scale Pop',
    category: 'Scale',
    description: 'Instant punchy scale expansion ideal for buttons and cards',
    tags: ['scale', 'button', 'ui', 'feedback'],
    author: 'UI Motion Guild',
    version: '2.1',
    rating: 4.95,
    downloads: 2750,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 80, type: 'bezier' },
      { id: 2, time: 50, value: 112, type: 'bezier', ease: 'easeInOut' },
      { id: 3, time: 100, value: 100, type: 'bezier', ease: 'easeInOut' },
    ],
  },
  {
    id: 'scale-bounce',
    name: 'Gravity Scale Bounce',
    category: 'Scale',
    description: 'Physical bounce with decreasing rebound decay',
    tags: ['scale', 'bounce', 'gravity'],
    author: 'Motion Studio Team',
    version: '1.5',
    rating: 4.7,
    downloads: 1100,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 60, value: 100, type: 'bezier' },
      { id: 3, time: 75, value: 110, type: 'bezier' },
      { id: 4, time: 88, value: 100, type: 'bezier' },
      { id: 5, time: 94, value: 103, type: 'bezier' },
      { id: 6, time: 100, value: 100, type: 'bezier' },
    ],
  },

  // 3. Attention Category
  {
    id: 'att-shake',
    name: 'Error Shake / Jitter',
    category: 'Attention',
    description: 'Horizontal rapid multi-directional shake indicating error or alert',
    tags: ['shake', 'error', 'haptic', 'alert'],
    author: 'Haptic Studio',
    version: '1.0',
    rating: 4.85,
    downloads: 1850,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 50, type: 'linear' },
      { id: 2, time: 20, value: 75, type: 'bezier' },
      { id: 3, time: 40, value: 25, type: 'bezier' },
      { id: 4, time: 60, value: 65, type: 'bezier' },
      { id: 5, time: 80, value: 40, type: 'bezier' },
      { id: 6, time: 100, value: 50, type: 'bezier' },
    ],
  },
  {
    id: 'att-pulse',
    name: 'Rhythmic Pulse',
    category: 'Attention',
    description: 'Harmonic sine breathing heartbeat pulse for status badges and indicators',
    tags: ['pulse', 'breathing', 'loop', 'status'],
    author: 'Motion Studio Team',
    version: '2.0',
    rating: 4.9,
    downloads: 2100,
    compatibility: ['AfterEffects', 'Premiere', 'Resolve', 'Web', 'Lottie'],
    keyframes: [
      { id: 1, time: 0, value: 100, type: 'bezier', ease: 'easeInOut' },
      { id: 2, time: 50, value: 125, type: 'bezier', ease: 'easeInOut' },
      { id: 3, time: 100, value: 100, type: 'bezier', ease: 'easeInOut' },
    ],
  },
];
