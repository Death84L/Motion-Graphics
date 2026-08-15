export interface LayerVfxFilter {
  blur: number; // 0 to 40px
  glow: number; // 0 to 60px
  glowColor: string;
  shadow: number; // 0 to 50px
  shadowColor: string;
  chromaticAberration: number; // 0 to 20px
  rgbSplit: number; // 0 to 15px
  glitch: number; // 0 to 1 intensity
  noise: number; // 0 to 1 grain
  scanlines: boolean;
}

export const DEFAULT_VFX_FILTER: LayerVfxFilter = {
  blur: 0,
  glow: 0,
  glowColor: '#38bdf8',
  shadow: 12,
  shadowColor: 'rgba(0, 0, 0, 0.6)',
  chromaticAberration: 0,
  rgbSplit: 0,
  glitch: 0,
  noise: 0,
  scanlines: false,
};

/**
 * Generates an SVG / CSS filter string for compositing live visual effects onto canvas layers.
 */
export function buildVfxStyle(filter: LayerVfxFilter): React.CSSProperties {
  const filterParts: string[] = [];

  if (filter.blur > 0) {
    filterParts.push(`blur(${filter.blur}px)`);
  }

  if (filter.glow > 0) {
    filterParts.push(`drop-shadow(0 0 ${filter.glow}px ${filter.glowColor})`);
  }

  if (filter.shadow > 0) {
    filterParts.push(`drop-shadow(0 ${filter.shadow * 0.5}px ${filter.shadow}px ${filter.shadowColor})`);
  }

  const style: React.CSSProperties = {
    filter: filterParts.length > 0 ? filterParts.join(' ') : 'none',
    position: 'relative',
  };

  return style;
}
