export interface MagneticFieldConfig {
  radiusPx: number; // e.g. 120px active radius
  strength: number; // 0 to 1.0
  maxDisplacementPx: number; // e.g. 24px max pull
  springDamping: number; // e.g. 14
}

export const DEFAULT_MAGNETIC_CONFIG: MagneticFieldConfig = {
  radiusPx: 120,
  strength: 0.35,
  maxDisplacementPx: 20,
  springDamping: 14,
};

export interface MagneticOffsetResult {
  offsetX: number;
  offsetY: number;
  rotationDeg: number;
  isAttracted: boolean;
}

/**
 * Computes 2D magnetic displacement vector when pointer is within attraction radius of a UI element.
 */
export function calculateMagneticDisplacement(
  elementCenterX: number,
  elementCenterY: number,
  cursorX: number,
  cursorY: number,
  config: MagneticFieldConfig = DEFAULT_MAGNETIC_CONFIG
): MagneticOffsetResult {
  const dx = cursorX - elementCenterX;
  const dy = cursorY - elementCenterY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > config.radiusPx || dist === 0) {
    return { offsetX: 0, offsetY: 0, rotationDeg: 0, isAttracted: false };
  }

  // Smooth quadratic falloff (1 at center, 0 at boundary)
  const normDist = dist / config.radiusPx;
  const falloff = Math.pow(1 - normDist, 2);

  const pullX = (dx / dist) * Math.min(config.maxDisplacementPx, dist * config.strength * falloff);
  const pullY = (dy / dist) * Math.min(config.maxDisplacementPx, dist * config.strength * falloff);
  const tilt = (dx / config.radiusPx) * 6 * falloff;

  return {
    offsetX: Math.round(pullX * 10) / 10,
    offsetY: Math.round(pullY * 10) / 10,
    rotationDeg: Math.round(tilt * 10) / 10,
    isAttracted: true,
  };
}
