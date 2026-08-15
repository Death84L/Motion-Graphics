export type AspectRatioType = '16:9' | '9:16' | '1:1' | '4:5' | '21:9';

export interface AspectRatioConfig {
  id: AspectRatioType;
  label: string;
  width: number;
  height: number;
  desc: string;
}

export const ASPECT_RATIOS: Record<AspectRatioType, AspectRatioConfig> = {
  '16:9': { id: '16:9', label: '16:9 Landscape', width: 1920, height: 1080, desc: 'YouTube / Broadcast standard' },
  '9:16': { id: '9:16', label: '9:16 Vertical', width: 1080, height: 1920, desc: 'TikTok / Instagram Reels / Shorts' },
  '1:1': { id: '1:1', label: '1:1 Square', width: 1080, height: 1080, desc: 'Instagram Feed / Social' },
  '4:5': { id: '4:5', label: '4:5 Portrait', width: 1080, height: 1350, desc: 'Social feed portrait' },
  '21:9': { id: '21:9', label: '21:9 Ultrawide', width: 2560, height: 1080, desc: 'Cinematic widescreen' },
};

export type CanvasElementType = 'shape' | 'text' | 'image' | 'ui-card' | 'badge';

export interface CanvasTransform {
  x: number; // px from center
  y: number; // px from center
  scaleX: number; // multiplier, default 1
  scaleY: number; // multiplier, default 1
  rotation: number; // degrees
  anchorX: number; // 0 to 1, default 0.5
  anchorY: number; // 0 to 1, default 0.5
  opacity: number; // 0 to 1
}

export interface VfxConfig {
  blur: number; // px (0 to 30)
  glow: number; // px (0 to 50)
  glowColor: string;
  shadow: number; // elevation (0 to 40)
  chromaticAberration: number; // offset px (0 to 15)
  rgbSplit: number; // px
  noise: number; // 0 to 1
  glitch: number; // 0 to 1
}

export const DEFAULT_VFX_CONFIG: VfxConfig = {
  blur: 0,
  glow: 0,
  glowColor: '#38bdf8',
  shadow: 12,
  chromaticAberration: 0,
  rgbSplit: 0,
  noise: 0,
  glitch: 0,
};

export interface CompositionLayer {
  id: string;
  name: string;
  type: CanvasElementType;
  visible: boolean;
  locked: boolean;
  color: string;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  width: number;
  height: number;
  borderRadius?: number;
  text?: string;
  fontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
  letterSpacing?: number;
  transform: CanvasTransform;
  vfx: VfxConfig;
}

export interface CompositionStageConfig {
  aspectRatio: AspectRatioType;
  backgroundColor: string;
  showGrid: boolean;
  showSafeAreas: boolean;
  showOnionSkin: boolean;
  showGuides: boolean;
  zoom: number; // 0.2 to 2.0
}

export const DEFAULT_STAGE_CONFIG: CompositionStageConfig = {
  aspectRatio: '16:9',
  backgroundColor: '#090e1a',
  showGrid: true,
  showSafeAreas: true,
  showOnionSkin: false,
  showGuides: true,
  zoom: 1.0,
};
