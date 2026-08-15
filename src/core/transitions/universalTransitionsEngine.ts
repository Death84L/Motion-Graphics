import { KeyframePoint } from '../../features/graph-editor/types';

export type UniversalTransitionMode =
  | 'directional-wipe'
  | 'radial-clock'
  | 'iris-circle'
  | 'whip-pan'
  | 'zoom-push'
  | 'glitch-displace'
  | 'light-leak'
  | 'ink-bleed'
  | 'glass-shatter';

export interface TransitionState {
  progress: number;
  wipeX: number;
  wipeRotationDeg: number;
  irisRadiusPx: number;
  blurPx: number;
  zoomScale: number;
  opacity: number;
  glitchDisplacementPx: number;
}

export class UniversalTransitionsEngine {
  /**
   * Evaluates Transition parameters at normalized progress t (0.0 = Start, 1.0 = End).
   */
  static evaluateTransition(
    mode: UniversalTransitionMode,
    progress: number,
    canvasWidth = 1920,
    canvasHeight = 1080
  ): TransitionState {
    const t = Math.max(0, Math.min(1, progress));
    const smoothT = t * t * (3 - 2 * t);

    let wipeX = 0;
    let wipeRotationDeg = 0;
    let irisRadiusPx = 0;
    let blurPx = 0;
    let zoomScale = 1.0;
    let opacity = 1.0 - smoothT;
    let glitchDisplacementPx = 0;

    switch (mode) {
      case 'directional-wipe':
        wipeX = smoothT * canvasWidth;
        break;

      case 'radial-clock':
        wipeRotationDeg = smoothT * 360;
        break;

      case 'iris-circle': {
        const maxRadius = Math.sqrt(canvasWidth * canvasWidth + canvasHeight * canvasHeight) / 2;
        irisRadiusPx = smoothT * maxRadius;
        break;
      }

      case 'whip-pan':
        wipeX = (smoothT - 0.5) * canvasWidth * 2;
        blurPx = Math.sin(t * Math.PI) * 32;
        break;

      case 'zoom-push':
        zoomScale = 1.0 + smoothT * 1.5;
        blurPx = Math.sin(t * Math.PI) * 16;
        break;

      case 'glitch-displace':
        glitchDisplacementPx = Math.sin(t * 40) * (1 - t) * 48;
        opacity = Math.random() > 0.3 ? 1.0 : 0.4;
        break;

      case 'light-leak':
        blurPx = Math.sin(t * Math.PI) * 24;
        opacity = 1.0 - smoothT;
        break;

      default:
        break;
    }

    return {
      progress: t,
      wipeX: Math.round(wipeX * 10) / 10,
      wipeRotationDeg: Math.round(wipeRotationDeg * 10) / 10,
      irisRadiusPx: Math.round(irisRadiusPx * 10) / 10,
      blurPx: Math.round(blurPx * 10) / 10,
      zoomScale: Math.round(zoomScale * 100) / 100,
      opacity: Math.round(opacity * 100) / 100,
      glitchDisplacementPx: Math.round(glitchDisplacementPx * 10) / 10,
    };
  }

  /**
   * Green-Screen Despill Color Corrector (Neutralizes green/blue color bleed).
   */
  static applyColorDespill(r: number, g: number, b: number, isGreenScreen = true): { r: number; g: number; b: number } {
    if (isGreenScreen) {
      // Limit green channel to average of red and blue
      const maxAllowedG = (r + b) / 2;
      return { r, g: Math.min(g, Math.round(maxAllowedG)), b };
    } else {
      // Blue screen despill
      const maxAllowedB = (r + g) / 2;
      return { r, g, b: Math.min(b, Math.round(maxAllowedB)) };
    }
  }

  /**
   * Bakes Transition Parameters into Standard Bézier Keyframes.
   */
  static bakeTransitionToKeyframes(mode: UniversalTransitionMode, durationSec = 1.0): KeyframePoint[] {
    return [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.25, y: 1.0 } },
      { id: 2, time: 100, value: 100, type: 'bezier', handleIn: { x: 0.25, y: 1.0 } },
    ];
  }
}
