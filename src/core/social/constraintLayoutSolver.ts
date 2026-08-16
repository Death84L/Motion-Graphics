import { SafeZoneBounds } from './extendedSocialReframeEngine';

export interface LayoutConstraintElement {
  id: string;
  type: 'hook-banner' | 'kinetic-captions' | 'mockup-container' | 'watermark-badge' | 'progress-line';
  anchor: 'top-safe' | 'bottom-safe' | 'center-viewport' | 'top-edge' | 'bottom-edge';
  offsetRatioX: number; // -0.5 to +0.5
  offsetRatioY: number; // -0.5 to +0.5
  minHeightRatio: number;
  maxHeightRatio: number;
}

export interface ComputedConstraintBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSizePx?: number;
}

export class ConstraintLayoutSolver {
  /**
   * Solves a responsive constraint-based layout across ANY target viewport dimensions ("Flexbox for Video").
   */
  static solveResponsiveLayout(
    targetWidth: number,
    targetHeight: number,
    safeBounds: SafeZoneBounds,
    elements: LayoutConstraintElement[]
  ): ComputedConstraintBox[] {
    return elements.map((elem) => {
      let x = 0;
      let y = 0;
      let width = targetWidth;
      let height = 40;
      let fontSizePx = 10;

      switch (elem.anchor) {
        case 'top-edge':
          x = 0;
          y = 0;
          width = targetWidth;
          height = Math.max(3, Math.round(targetHeight * 0.008));
          break;

        case 'top-safe':
          x = Math.round(targetWidth * 0.05);
          width = Math.round(targetWidth * 0.9);
          y = Math.round(safeBounds.topMarginPx + targetHeight * elem.offsetRatioY);
          height = Math.round(targetHeight * 0.08);
          fontSizePx = Math.max(8, Math.min(14, Math.round(targetWidth * 0.038)));
          break;

        case 'bottom-safe':
          x = Math.round(targetWidth * 0.05);
          width = Math.round(targetWidth * 0.9);
          y = Math.round(targetHeight - safeBounds.bottomMarginPx - 60 + targetHeight * elem.offsetRatioY);
          height = Math.round(targetHeight * 0.12);
          fontSizePx = Math.max(8, Math.min(13, Math.round(targetWidth * 0.035)));
          break;

        case 'center-viewport':
        default:
          width = Math.round(targetWidth * 0.92);
          height = Math.round(targetHeight * 0.7);
          x = Math.round((targetWidth - width) / 2);
          y = Math.round((targetHeight - height) / 2);
          break;
      }

      return {
        id: elem.id,
        x,
        y,
        width,
        height,
        fontSizePx,
      };
    });
  }
}
