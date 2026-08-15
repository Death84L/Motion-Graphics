export type AccessibilityMotionMode = 'standard' | 'reduced-motion' | 'minimal';

export interface DesignSystemMotionTokens {
  systemName: string;
  version: string;
  accessibilityMode: AccessibilityMotionMode;

  // Durations
  durationInstantMs: number; // 80ms
  durationFastMs: number; // 140ms
  durationNormalMs: number; // 260ms
  durationSlowMs: number; // 480ms

  // Spring Physics Profiles
  springSnappy: { stiffness: number; damping: number; mass: number };
  springGentle: { stiffness: number; damping: number; mass: number };
  springBouncy: { stiffness: number; damping: number; mass: number };

  // Standard Easing Curves
  easeStandard: string; // e.g. 'cubic-bezier(0.2, 0, 0, 1)'
  easeEmphasis: string; // e.g. 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  easeDecelerate: string; // e.g. 'cubic-bezier(0, 0, 0.2, 1)'

  // Micro-interaction Scale Multipliers
  scaleHover: number; // e.g. 1.04
  scalePressed: number; // e.g. 0.96
  elevationHoverPx: number; // e.g. 14px
  staggerDefaultMs: number; // e.g. 35ms
}

export const DEFAULT_MOTION_TOKENS: DesignSystemMotionTokens = {
  systemName: 'Antigravity Premium Motion',
  version: '2.0.0',
  accessibilityMode: 'standard',
  durationInstantMs: 80,
  durationFastMs: 140,
  durationNormalMs: 260,
  durationSlowMs: 480,
  springSnappy: { stiffness: 220, damping: 16, mass: 1 },
  springGentle: { stiffness: 120, damping: 20, mass: 1 },
  springBouncy: { stiffness: 160, damping: 11, mass: 1 },
  easeStandard: 'cubic-bezier(0.2, 0, 0, 1)',
  easeEmphasis: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  easeDecelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  scaleHover: 1.04,
  scalePressed: 0.96,
  elevationHoverPx: 16,
  staggerDefaultMs: 35,
};

/**
 * Returns accessibility-adapted tokens based on user preference.
 */
export function getAccessibilityAdaptedTokens(
  tokens: DesignSystemMotionTokens,
  mode: AccessibilityMotionMode = 'standard'
): DesignSystemMotionTokens {
  if (mode === 'standard') return tokens;

  if (mode === 'reduced-motion') {
    return {
      ...tokens,
      accessibilityMode: 'reduced-motion',
      scaleHover: 1.0, // No scale expansion
      scalePressed: 1.0,
      elevationHoverPx: 0,
      staggerDefaultMs: 0, // Instant reveal
      durationNormalMs: 120, // Fast opacity fades only
      durationSlowMs: 160,
      springBouncy: { stiffness: 100, damping: 30, mass: 1 }, // Zero oscillation
    };
  }

  // Minimal mode
  return {
    ...tokens,
    accessibilityMode: 'minimal',
    scaleHover: 1.01,
    scalePressed: 0.99,
    elevationHoverPx: 4,
    staggerDefaultMs: 15,
  };
}
