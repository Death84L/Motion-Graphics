import {
  DeviceProfile,
  DEVICE_PROFILES,
  DeviceBreakpointId,
  AdaptationLevel,
  SemanticMotionIntent,
  FluidInterpolationRule,
} from './responsiveMotionSchema';
import { KeyframePoint } from '../../features/graph-editor/types';

export interface ResponsiveEvaluationResult {
  adaptedPositionX: number;
  adaptedPositionY: number;
  adaptedScale: number;
  adaptedDurationMs: number;
  adaptedStaggerMs: number;
  isInsideSafeArea: boolean;
  safeAreaViolationMessage?: string;
}

export class ResponsiveMotionLabEngine {
  /**
   * Evaluates 5-Level Adaptive Motion for an element at a given viewport dimension.
   */
  static evaluateResponsiveMotion(
    viewportWidth: number,
    viewportHeight: number,
    basePositionX: number,
    basePositionY: number,
    baseScale: number,
    baseDurationMs: number,
    level: AdaptationLevel,
    intent: SemanticMotionIntent = { mode: 'dock-edge-right', edgeMarginPx: 24 },
    profile: DeviceProfile = DEVICE_PROFILES['desktop-hd']
  ): ResponsiveEvaluationResult {
    let posX = basePositionX;
    let posY = basePositionY;
    let scale = baseScale;
    let duration = baseDurationMs;
    const stagger = Math.round((viewportWidth / 1920) * 40 + 20); // 20ms mobile, 60ms desktop

    // Level 1: Fixed / Breakpoint Step
    if (level === 'level1-fixed') {
      if (viewportWidth < 600) {
        posX = basePositionX * 0.35;
        posY = basePositionY * 0.35;
        scale = baseScale * 0.8;
        duration = Math.round(baseDurationMs * 0.6);
      } else if (viewportWidth < 1024) {
        posX = basePositionX * 0.65;
        posY = basePositionY * 0.65;
        scale = baseScale * 0.9;
        duration = Math.round(baseDurationMs * 0.8);
      }
    }

    // Level 2: Continuous Fluid Interpolation
    else if (level === 'level2-fluid') {
      const fluidRatio = Math.max(0, Math.min(1, (viewportWidth - 360) / (1920 - 360)));
      // Smoothstep curve
      const smoothRatio = fluidRatio * fluidRatio * (3 - 2 * fluidRatio);
      posX = 100 + smoothRatio * (basePositionX - 100);
      scale = 0.75 + smoothRatio * (baseScale - 0.75);
      duration = Math.round(400 + smoothRatio * (baseDurationMs - 400));
    }

    // Level 3: Relative Viewport Units (vw / vh)
    else if (level === 'level3-relative') {
      posX = (basePositionX / 1920) * viewportWidth;
      posY = (basePositionY / 1080) * viewportHeight;
      scale = baseScale * (viewportWidth / 1920);
      duration = Math.max(350, Math.round((viewportWidth / 1920) * baseDurationMs));
    }

    // Level 4: Constraint-Driven Edge Anchoring
    else if (level === 'level4-constraint') {
      const margin = intent.edgeMarginPx ?? 24;
      const elementWidth = 140 * scale;
      posX = Math.max(margin, viewportWidth - margin - elementWidth);
      duration = Math.round(baseDurationMs * 0.75);
    }

    // Level 5: Semantic Intent Preserver (Combines edge docking, safe area clamps, and kinetic weight)
    else if (level === 'level5-semantic') {
      const margin = intent.edgeMarginPx ?? 24;
      const elementWidth = 140 * scale;
      const rightEdge = viewportWidth - margin - elementWidth;
      posX = Math.max(profile.safeArea.left + margin, rightEdge - profile.safeArea.right);

      // Safe area clamp for Y
      posY = Math.max(profile.safeArea.top + 10, Math.min(viewportHeight - profile.safeArea.bottom - 40, basePositionY));
      scale = Math.max(0.8, Math.min(1.2, baseScale * (viewportWidth > 1200 ? 1.0 : 0.85)));
      duration = Math.round(420 + (viewportWidth / 1920) * (baseDurationMs - 420));
    }

    // Check Safe-Area Violation
    let isInsideSafeArea = true;
    let safeAreaViolationMessage: string | undefined;

    if (posY < profile.safeArea.top) {
      isInsideSafeArea = false;
      safeAreaViolationMessage = `Top Safe-Area violation: element overlaps notch/island by ${profile.safeArea.top - posY}px`;
    } else if (posY > viewportHeight - profile.safeArea.bottom) {
      isInsideSafeArea = false;
      safeAreaViolationMessage = `Bottom Safe-Area violation: element overlaps home indicator by ${posY - (viewportHeight - profile.safeArea.bottom)}px`;
    }

    return {
      adaptedPositionX: Math.round(posX * 10) / 10,
      adaptedPositionY: Math.round(posY * 10) / 10,
      adaptedScale: Math.round(scale * 100) / 100,
      adaptedDurationMs: duration,
      adaptedStaggerMs: stagger,
      isInsideSafeArea,
      safeAreaViolationMessage,
    };
  }

  /**
   * Generates Responsive CSS Keyframes and Media Queries.
   */
  static generateResponsiveCss(
    keyframes: KeyframePoint[],
    elementSelector = '.motion-element'
  ): string {
    return `/* Motion Studio — Universal Responsive CSS Export */
${elementSelector} {
  transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform: translate3d(500px, 0, 0) scale(1);
}

/* Tablet (max-width: 1024px) */
@media (max-width: 1024px) {
  ${elementSelector} {
    transform: translate3d(320px, 0, 0) scale(0.9);
    transition-duration: 0.5s;
  }
}

/* Mobile (max-width: 640px) */
@media (max-width: 640px) {
  ${elementSelector} {
    transform: translate3d(calc(100vw - 160px - env(safe-area-inset-right)), 0, 0) scale(0.8);
    transition-duration: 0.38s;
  }
}

/* Accessibility: Prefers Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  ${elementSelector} {
    transition: opacity 0.2s ease;
    transform: none !important;
  }
}`;
  }

  /**
   * Generates React Framer Motion Responsive Variants Code.
   */
  static generateFramerMotionCode(): string {
    return `// Motion Studio — Responsive React Framer Motion Variants
import { motion } from 'framer-motion';

export const responsiveHeroVariants = {
  desktop: {
    x: 500,
    scale: 1.0,
    transition: { type: 'spring', damping: 18, stiffness: 120, duration: 0.8 },
  },
  tablet: {
    x: 320,
    scale: 0.9,
    transition: { type: 'spring', damping: 16, stiffness: 140, duration: 0.6 },
  },
  mobile: {
    x: 'calc(100vw - 160px)',
    scale: 0.82,
    transition: { type: 'spring', damping: 14, stiffness: 160, duration: 0.42 },
  },
};

export function ResponsiveHeroCard() {
  return (
    <motion.div
      variants={responsiveHeroVariants}
      initial="mobile"
      animate={window.innerWidth > 1024 ? 'desktop' : window.innerWidth > 640 ? 'tablet' : 'mobile'}
      className="p-4 rounded-xl bg-cyan-500/20 border border-cyan-400"
    >
      <h3>Kinetic Responsive Element</h3>
    </motion.div>
  );
}`;
  }
}
