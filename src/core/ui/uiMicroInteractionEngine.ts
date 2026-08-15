export type UiComponentType =
  | 'dynamic-island'
  | 'skeleton-shimmer'
  | 'toggle-switch'
  | 'tab-indicator'
  | 'card-flip-3d'
  | 'odometer-roll'
  | 'glassmorphism-card'
  | 'neumorphism-button';

export interface DynamicIslandState {
  width: number;
  height: number;
  borderRadius: number;
  scale: number;
  contentOpacity: number;
}

export interface ToggleSwitchState {
  thumbX: number;
  thumbScaleX: number; // Stretches while moving
  activeGlow: number;
}

export class UiMicroInteractionEngine {
  /**
   * Calculates Apple Dynamic Island Squircle Expansion State from progress t (0.0 = compact pill, 1.0 = expanded).
   */
  static evaluateDynamicIsland(progress: number): DynamicIslandState {
    const t = Math.max(0, Math.min(1, progress));
    // Spring overshoot
    const springT = Math.sin(t * Math.PI * 0.5);

    const width = 120 + springT * 220; // 120px to 340px
    const height = 36 + springT * 124; // 36px to 160px
    const borderRadius = 20 + springT * 16; // 20px to 36px

    return {
      width: Math.round(width),
      height: Math.round(height),
      borderRadius: Math.round(borderRadius),
      scale: 1.0 + Math.sin(t * Math.PI) * 0.04,
      contentOpacity: t > 0.4 ? (t - 0.4) / 0.6 : 0,
    };
  }

  /**
   * Calculates Elastic Toggle Switch Thumb Position and Horizontal Stretch.
   */
  static evaluateToggleSwitch(
    isOn: boolean,
    progress: number
  ): ToggleSwitchState {
    const t = Math.max(0, Math.min(1, progress));
    const startX = isOn ? 2 : 26;
    const endX = isOn ? 26 : 2;

    const thumbX = startX + (endX - startX) * t;
    // Thumb stretches horizontally during the middle of the transition
    const stretch = 1.0 + Math.sin(t * Math.PI) * 0.35;

    return {
      thumbX: Math.round(thumbX * 10) / 10,
      thumbScaleX: Math.round(stretch * 100) / 100,
      activeGlow: isOn ? t : 1.0 - t,
    };
  }

  /**
   * Evaluates 3D Credit Card Flip on the Y-Axis (0° to 180°).
   */
  static evaluateCardFlip(progress: number): { rotateY: number; isBackVisible: boolean } {
    const t = Math.max(0, Math.min(1, progress));
    const rotateY = t * 180;
    return {
      rotateY: Math.round(rotateY * 10) / 10,
      isBackVisible: rotateY >= 90,
    };
  }

  /**
   * Fluid clamp() font-size calculator for responsive design.
   */
  static calculateFluidFontSize(
    minSizePx: number,
    maxSizePx: number,
    minViewportPx = 375,
    maxViewportPx = 1920
  ): string {
    const slope = (maxSizePx - minSizePx) / (maxViewportPx - minViewportPx);
    const yAxisIntersection = -minViewportPx * slope + minSizePx;
    return `clamp(${minSizePx}px, ${(yAxisIntersection).toFixed(2)}px + ${(slope * 100).toFixed(2)}vw, ${maxSizePx}px)`;
  }

  /**
   * Neumorphic Shadow CSS Generator
   */
  static getNeumorphicShadow(elevation = 8, isInset = false): string {
    const d = elevation;
    const blur = d * 2;
    if (isInset) {
      return `inset ${d}px ${d}px ${blur}px #03050a, inset -${d}px -${d}px ${blur}px #162038`;
    }
    return `${d}px ${d}px ${blur}px #03050a, -${d}px -${d}px ${blur}px #162038`;
  }
}
