export type BrollMediaType = 'video' | 'image' | 'gif' | 'overlay' | 'image-sequence';

export type BrollCategory =
  | 'Technology'
  | 'Cinematic'
  | 'Lifestyle'
  | 'Business'
  | 'Nature'
  | 'UI'
  | 'Abstract'
  | 'Background';

export type KenBurnsDirection =
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'diagonal-up-left'
  | 'diagonal-down-right'
  | 'static';

export type BrollTransitionType =
  | 'cut'
  | 'dissolve'
  | 'wipe'
  | 'zoom-push'
  | 'glitch'
  | 'light-leak'
  | 'whip-pan';

export interface KenBurnsConfig {
  direction: KenBurnsDirection;
  zoomStart: number; // e.g. 1.0
  zoomEnd: number; // e.g. 1.25
  easing: 'smooth' | 'snappy' | 'linear';
}

export interface BrollClip {
  id: string;
  name: string;
  type: BrollMediaType;
  category: BrollCategory;
  durationSec: number;
  inPointSec: number;
  outPointSec: number;
  speedMultiplier: number; // 0.25 to 4.0
  width: number;
  height: number;
  fps: number;
  orientation: 'landscape' | 'portrait' | 'square';
  tags: string[];
  colorLabel: string;
  rating: number; // 1 to 5
  thumbnailColor: string;
  kenBurns: KenBurnsConfig;
  transitionOut: BrollTransitionType;
  transitionDurationSec: number;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
}

export interface StoryboardScene {
  id: string;
  title: string;
  clips: BrollClip[];
  captionSyncText?: string;
  musicBpm: number;
  totalDurationSec: number;
}

export const SAMPLE_BROLL_LIBRARY: BrollClip[] = [
  {
    id: 'broll-1',
    name: 'Cyberpunk Neon City Drone.mp4',
    type: 'video',
    category: 'Cinematic',
    durationSec: 6.0,
    inPointSec: 0,
    outPointSec: 4.0,
    speedMultiplier: 1.0,
    width: 3840,
    height: 2160,
    fps: 60,
    orientation: 'landscape',
    tags: ['cyberpunk', 'city', 'night', 'aerial'],
    colorLabel: '#38bdf8',
    rating: 5,
    thumbnailColor: '#0369a1',
    kenBurns: { direction: 'zoom-in', zoomStart: 1.0, zoomEnd: 1.2, easing: 'smooth' },
    transitionOut: 'dissolve',
    transitionDurationSec: 0.5,
    volume: 0.8,
    isMuted: false,
  },
  {
    id: 'broll-2',
    name: 'Modern Startup Code & Coffee.mp4',
    type: 'video',
    category: 'Technology',
    durationSec: 5.0,
    inPointSec: 0.5,
    outPointSec: 3.5,
    speedMultiplier: 1.2,
    width: 1920,
    height: 1080,
    fps: 30,
    orientation: 'landscape',
    tags: ['coding', 'laptop', 'developer', 'workspace'],
    colorLabel: '#10b981',
    rating: 4,
    thumbnailColor: '#047857',
    kenBurns: { direction: 'pan-left', zoomStart: 1.05, zoomEnd: 1.05, easing: 'smooth' },
    transitionOut: 'whip-pan',
    transitionDurationSec: 0.4,
    volume: 0.5,
    isMuted: true,
  },
  {
    id: 'broll-3',
    name: 'Minimal UI Phone Interaction.mp4',
    type: 'video',
    category: 'UI',
    durationSec: 4.0,
    inPointSec: 0,
    outPointSec: 3.0,
    speedMultiplier: 1.0,
    width: 1080,
    height: 1920,
    fps: 60,
    orientation: 'portrait',
    tags: ['ui', 'app', 'mobile', 'touch', 'smooth'],
    colorLabel: '#ec4899',
    rating: 5,
    thumbnailColor: '#be185d',
    kenBurns: { direction: 'zoom-in', zoomStart: 1.0, zoomEnd: 1.15, easing: 'snappy' },
    transitionOut: 'glitch',
    transitionDurationSec: 0.3,
    volume: 1.0,
    isMuted: false,
  },
  {
    id: 'broll-4',
    name: 'Mountain Sunrise Mist Time-Lapse.mp4',
    type: 'video',
    category: 'Nature',
    durationSec: 8.0,
    inPointSec: 1.0,
    outPointSec: 5.0,
    speedMultiplier: 1.5,
    width: 3840,
    height: 2160,
    fps: 60,
    orientation: 'landscape',
    tags: ['nature', 'mountains', 'sunrise', 'peaceful'],
    colorLabel: '#f59e0b',
    rating: 5,
    thumbnailColor: '#b45309',
    kenBurns: { direction: 'diagonal-up-left', zoomStart: 1.0, zoomEnd: 1.18, easing: 'smooth' },
    transitionOut: 'dissolve',
    transitionDurationSec: 0.6,
    volume: 0.6,
    isMuted: false,
  },
  {
    id: 'broll-5',
    name: 'Dark Geometric Particle Wave.mp4',
    type: 'video',
    category: 'Abstract',
    durationSec: 6.0,
    inPointSec: 0,
    outPointSec: 4.0,
    speedMultiplier: 1.0,
    width: 1920,
    height: 1080,
    fps: 60,
    orientation: 'landscape',
    tags: ['particles', '3d', 'waves', 'glowing'],
    colorLabel: '#8b5cf6',
    rating: 4,
    thumbnailColor: '#6d28d9',
    kenBurns: { direction: 'zoom-out', zoomStart: 1.25, zoomEnd: 1.0, easing: 'smooth' },
    transitionOut: 'light-leak',
    transitionDurationSec: 0.4,
    volume: 0,
    isMuted: true,
  },
];
