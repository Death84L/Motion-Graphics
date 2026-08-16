export type ConversionDirection = '16:9-to-9:16' | '9:16-to-16:9' | 'custom-to-square' | 'custom-to-portrait';

export type DeviceMockupType = 'none' | 'glass-smartphone' | 'macos-browser' | 'curved-monitor' | 'elevated-card';

export interface ZeroCutoffConfig {
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  targetHeight: number;
  mockupType?: DeviceMockupType;
  blurRadiusPx?: number;
  cornerRadiusPx?: number;
}

export interface ZeroCutoffGeometryResult {
  scale: number;
  contentWidth: number;
  contentHeight: number;
  offsetX: number;
  offsetY: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  cutoffPercentage: 0; // Guaranteed 0% lost content
  mockupFrameStyle?: {
    borderRadius: number;
    boxShadow: string;
    border: string;
  };
  blurBackdropStyle: {
    blurRadius: number;
    brightness: number;
    saturation: number;
  };
}

export interface ReversePillarInfillResult {
  centerVideoWidth: number;
  centerVideoHeight: number;
  leftPillarWidth: number;
  rightPillarWidth: number;
  pillarBlurRadius: number;
}

export class ZeroCutoffEngine {
  /**
   * Computes 100% Zero-Cutoff Geometry for any aspect ratio conversion (16:9 <-> 9:16, 1:1, 4:5).
   * Guarantees 0% footage is chopped off by calculating exact letterbox/pillarbox padding and ambient blur.
   */
  static solveZeroCutoffGeometry(config: ZeroCutoffConfig): ZeroCutoffGeometryResult {
    const srcRatio = config.sourceWidth / config.sourceHeight;
    const targetRatio = config.targetWidth / config.targetHeight;

    let contentW = config.targetWidth;
    let contentH = config.targetHeight;
    let padTop = 0;
    let padBottom = 0;
    let padLeft = 0;
    let padRight = 0;

    if (srcRatio > targetRatio) {
      // Source is wider than target (e.g. 16:9 -> 9:16)
      contentW = config.targetWidth * 0.92; // 8% margin for aesthetic elevated card look
      contentH = contentW / srcRatio;
      const totalPadY = config.targetHeight - contentH;
      padTop = Math.round(totalPadY / 2);
      padBottom = config.targetHeight - contentH - padTop;
    } else {
      // Source is taller than target (e.g. 9:16 -> 16:9)
      contentH = config.targetHeight * 0.92;
      contentW = contentH * srcRatio;
      const totalPadX = config.targetWidth - contentW;
      padLeft = Math.round(totalPadX / 2);
      padRight = config.targetWidth - contentW - padLeft;
    }

    const scale = Math.round((contentW / config.sourceWidth) * 1000) / 1000;
    const blurRadius = config.blurRadiusPx || 30;

    let mockupStyle = undefined;
    if (config.mockupType === 'glass-smartphone') {
      mockupStyle = {
        borderRadius: 24,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 1px rgba(255, 255, 255, 0.4)',
        border: '3px solid rgba(255, 255, 255, 0.15)',
      };
    } else if (config.mockupType === 'macos-browser') {
      mockupStyle = {
        borderRadius: 10,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
      };
    } else if (config.mockupType === 'elevated-card') {
      mockupStyle = {
        borderRadius: config.cornerRadiusPx || 12,
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8), 0 0 2px rgba(255, 255, 255, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      };
    }

    return {
      scale,
      contentWidth: Math.round(contentW),
      contentHeight: Math.round(contentH),
      offsetX: padLeft,
      offsetY: padTop,
      paddingTop: padTop,
      paddingBottom: padBottom,
      paddingLeft: padLeft,
      paddingRight: padRight,
      cutoffPercentage: 0,
      mockupFrameStyle: mockupStyle,
      blurBackdropStyle: {
        blurRadius,
        brightness: 0.65,
        saturation: 1.4,
      },
    };
  }

  /**
   * Solves 9:16 Vertical -> 16:9 Widescreen Reverse Pillar Infill.
   */
  static solveReversePillarInfill(sourceW = 1080, sourceH = 1920, targetW = 1920, targetH = 1080): ReversePillarInfillResult {
    const centerH = targetH;
    const centerW = Math.round((centerH * sourceW) / sourceH);
    const sidePillarW = Math.round((targetW - centerW) / 2);

    return {
      centerVideoWidth: centerW,
      centerVideoHeight: centerH,
      leftPillarWidth: sidePillarW,
      rightPillarWidth: sidePillarW,
      pillarBlurRadius: 32,
    };
  }
}
