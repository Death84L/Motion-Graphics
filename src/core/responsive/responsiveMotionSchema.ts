import { KeyframePoint } from '../../features/graph-editor/types';

export type DeviceBreakpointId =
  | 'desktop-4k'
  | 'desktop-hd'
  | 'laptop'
  | 'tablet-portrait'
  | 'mobile-portrait'
  | 'social-reels-9-16'
  | 'social-square-1-1';

export type AdaptationLevel =
  | 'level1-fixed'
  | 'level2-fluid'
  | 'level3-relative'
  | 'level4-constraint'
  | 'level5-semantic';

export interface SafeAreaConfig {
  top: number; // e.g. 47px Dynamic Island / Notch
  bottom: number; // e.g. 34px Home Indicator
  left: number;
  right: number;
  hasNotch: boolean;
}

export interface DeviceProfile {
  id: DeviceBreakpointId;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  icon: string;
  category: 'desktop' | 'tablet' | 'mobile' | 'social';
  safeArea: SafeAreaConfig;
}

export interface FluidInterpolationRule {
  property: string;
  minViewportWidth: number;
  maxViewportWidth: number;
  minValue: number;
  maxValue: number;
  easing: 'linear' | 'smoothstep' | 'cubic';
}

export interface SemanticMotionIntent {
  mode: 'dock-edge-right' | 'center-safe-hero' | 'fluid-typography' | 'contained-card';
  edgeMarginPx?: number;
  maxContentWidthPercent?: number;
  minScaleFactor?: number;
  maxScaleFactor?: number;
}

export interface ResponsiveBreakpointOverride {
  breakpointId: DeviceBreakpointId;
  durationMs: number;
  delayMs: number;
  staggerMs: number;
  scaleMultiplier: number;
  keyframeOverrides?: KeyframePoint[];
}

export const DEVICE_PROFILES: Record<DeviceBreakpointId, DeviceProfile> = {
  'desktop-hd': {
    id: 'desktop-hd',
    name: 'Desktop (1080p)',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    icon: '🖥️',
    category: 'desktop',
    safeArea: { top: 0, bottom: 0, left: 0, right: 0, hasNotch: false },
  },
  'desktop-4k': {
    id: 'desktop-4k',
    name: 'Desktop (4K UHD)',
    width: 3840,
    height: 2160,
    aspectRatio: '16:9',
    icon: '🖥️',
    category: 'desktop',
    safeArea: { top: 0, bottom: 0, left: 0, right: 0, hasNotch: false },
  },
  'laptop': {
    id: 'laptop',
    name: 'Laptop (1440p)',
    width: 1440,
    height: 900,
    aspectRatio: '16:10',
    icon: '💻',
    category: 'desktop',
    safeArea: { top: 0, bottom: 0, left: 0, right: 0, hasNotch: false },
  },
  'tablet-portrait': {
    id: 'tablet-portrait',
    name: 'Tablet iPad (Portrait)',
    width: 768,
    height: 1024,
    aspectRatio: '3:4',
    icon: '📱',
    category: 'tablet',
    safeArea: { top: 20, bottom: 20, left: 0, right: 0, hasNotch: false },
  },
  'mobile-portrait': {
    id: 'mobile-portrait',
    name: 'Mobile (iPhone 15)',
    width: 390,
    height: 844,
    aspectRatio: '9:19.5',
    icon: '📲',
    category: 'mobile',
    safeArea: { top: 47, bottom: 34, left: 0, right: 0, hasNotch: true },
  },
  'social-reels-9-16': {
    id: 'social-reels-9-16',
    name: 'TikTok / Reels / Shorts (9:16)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    icon: '🎬',
    category: 'social',
    safeArea: { top: 120, bottom: 240, left: 24, right: 90, hasNotch: true },
  },
  'social-square-1-1': {
    id: 'social-square-1-1',
    name: 'Social Feed (Square 1:1)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    icon: '⬜',
    category: 'social',
    safeArea: { top: 30, bottom: 30, left: 30, right: 30, hasNotch: false },
  },
};
