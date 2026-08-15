export interface ColorTokenPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
}

export interface TypographyTokenScale {
  fontFamily: string;
  fontFamilyMono: string;
  scaleHeading1: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing: string };
  scaleHeading2: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing: string };
  scaleHeading3: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing: string };
  scaleBody: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing: string };
  scaleCaption: { fontSize: number; lineHeight: number; fontWeight: number; letterSpacing: string };
}

export interface ElevationShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  glowCyan: string;
  glowPink: string;
  glowEmerald: string;
}

export interface CompleteDesignSystemTokens {
  id: string;
  name: string;
  version: string;
  colors: ColorTokenPalette;
  typography: TypographyTokenScale;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  radii: { none: number; sm: number; md: number; lg: number; full: number };
  shadows: ElevationShadowTokens;
}

export const DEFAULT_DESIGN_SYSTEM: CompleteDesignSystemTokens = {
  id: 'ds-antigravity-dark',
  name: 'Antigravity Pro Dark UI',
  version: '2.0.0',
  colors: {
    primary: '#38bdf8',
    secondary: '#818cf8',
    accent: '#ec4899',
    background: '#040711',
    surface: '#090e1a',
    border: '#1e293b',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontFamilyMono: 'JetBrains Mono, monospace',
    scaleHeading1: { fontSize: 36, lineHeight: 1.2, fontWeight: 900, letterSpacing: '-0.02em' },
    scaleHeading2: { fontSize: 24, lineHeight: 1.3, fontWeight: 800, letterSpacing: '-0.01em' },
    scaleHeading3: { fontSize: 18, lineHeight: 1.4, fontWeight: 700, letterSpacing: '0em' },
    scaleBody: { fontSize: 13, lineHeight: 1.5, fontWeight: 500, letterSpacing: '0.01em' },
    scaleCaption: { fontSize: 10, lineHeight: 1.4, fontWeight: 600, letterSpacing: '0.02em' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  radii: { none: 0, sm: 4, md: 8, lg: 16, full: 9999 },
  shadows: {
    none: 'none',
    sm: '0 2px 6px rgba(0,0,0,0.3)',
    md: '0 8px 24px rgba(0,0,0,0.5)',
    lg: '0 20px 50px rgba(0,0,0,0.7)',
    glowCyan: '0 0 20px rgba(56, 189, 248, 0.4)',
    glowPink: '0 0 20px rgba(236, 72, 153, 0.4)',
    glowEmerald: '0 0 20px rgba(16, 185, 129, 0.4)',
  },
};

/**
 * Design Token Resolver mapping tokens into inline style CSS properties.
 */
export function resolveTokenStyles(
  tokens: CompleteDesignSystemTokens = DEFAULT_DESIGN_SYSTEM
): Record<string, string> {
  return {
    '--color-primary': tokens.colors.primary,
    '--color-secondary': tokens.colors.secondary,
    '--color-accent': tokens.colors.accent,
    '--color-bg': tokens.colors.background,
    '--color-surface': tokens.colors.surface,
    '--color-border': tokens.colors.border,
    '--color-text-primary': tokens.colors.textPrimary,
    '--color-text-secondary': tokens.colors.textSecondary,
    '--font-family': tokens.typography.fontFamily,
    '--font-family-mono': tokens.typography.fontFamilyMono,
    '--radius-md': `${tokens.radii.md}px`,
    '--shadow-md': tokens.shadows.md,
  };
}
