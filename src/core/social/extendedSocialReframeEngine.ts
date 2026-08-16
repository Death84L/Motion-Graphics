import { KeyframePoint } from '../../features/graph-editor/types';

export type SocialTargetFormat = '9:16-reels' | '1:1-square' | '4:5-portrait' | '16:9-landscape';

export type ReframeLayoutMode =
  | 'full-bleed-pan'
  | 'split-duplex'
  | 'tri-stack'
  | 'blurred-mirror'
  | 'glass-card'
  | 'pip-bubble';

export type SafeZonePlatform = 'tiktok' | 'instagram-reels' | 'youtube-shorts' | 'none';

export type ProceduralBackdropStyle =
  | 'ambient-color-glow'
  | 'studio-dark-radial'
  | 'cyberpunk-gradient'
  | 'kinetic-text-wall'
  | 'clean-minimal-slate';

export interface SpeakerProfile {
  id: string;
  name: string;
  x: number;
  y: number;
  isActive: boolean;
}

export interface ReframeCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  label?: string;
}

export interface MultiSpeakerReframeResult {
  layoutMode: ReframeLayoutMode;
  targetFormat: SocialTargetFormat;
  primaryCrop: ReframeCropRect;
  secondaryCrop?: ReframeCropRect;
  tertiaryCrop?: ReframeCropRect;
  blurredBackgroundPadding?: {
    topH: number;
    bottomH: number;
    blurRadius: number;
  };
  pipBubble?: {
    x: number;
    y: number;
    size: number;
    borderRadius: number;
  };
}

export interface SafeZoneBounds {
  topMarginPx: number;
  bottomMarginPx: number;
  rightMarginPx: number;
  leftMarginPx: number;
}

export interface RetentionHookCard {
  text: string;
  style: 'viral-yellow' | 'cyberpunk-neon' | 'clean-white' | 'luxury-gold';
  durationSec: number;
  showProgressBar: boolean;
  progressBarColor: string;
  zoomPunchIn: boolean;
}

export interface ViewportDimensionsResult {
  width: number;
  height: number;
  aspectRatio: string;
  label: string;
  safeZoneScale: number;
}

export interface ParallaxPlaneLayerKeyframes {
  foregroundPanKeyframes: KeyframePoint[];
  foregroundScaleKeyframes: KeyframePoint[];
  backgroundPanKeyframes: KeyframePoint[];
  backgroundScaleKeyframes: KeyframePoint[];
  cameraZDepthKeyframes: KeyframePoint[];
}

export interface SocialReframeProjectExportConfig {
  sourceWidth: number;
  sourceHeight: number;
  durationSec: number;
  format: SocialTargetFormat;
  platform: SafeZonePlatform;
  hookText: string;
  panKeyframes: KeyframePoint[];
  scaleKeyframes: KeyframePoint[];
}

export class ExtendedSocialReframeEngine {
  /**
   * Computes Responsive Viewport Dimensions & Aspect Ratio CSS for 1:1, 4:5, 9:16, and 16:9.
   */
  static computeViewportDimensions(format: SocialTargetFormat): ViewportDimensionsResult {
    switch (format) {
      case '1:1-square':
        return {
          width: 280,
          height: 280,
          aspectRatio: '1 / 1',
          label: '1:1 Square (1080x1080)',
          safeZoneScale: 280 / 1080,
        };
      case '4:5-portrait':
        return {
          width: 240,
          height: 300,
          aspectRatio: '4 / 5',
          label: '4:5 Portrait (1080x1350)',
          safeZoneScale: 300 / 1350,
        };
      case '16:9-landscape':
        return {
          width: 360,
          height: 202,
          aspectRatio: '16 / 9',
          label: '16:9 Landscape (1920x1080)',
          safeZoneScale: 202 / 1080,
        };
      case '9:16-reels':
      default:
        return {
          width: 202,
          height: 360,
          aspectRatio: '9 / 16',
          label: '9:16 Vertical (1080x1920)',
          safeZoneScale: 360 / 1920,
        };
    }
  }

  /**
   * Platform Safe-Zone Inset Margins.
   */
  static getSafeZoneBounds(platform: SafeZonePlatform): SafeZoneBounds {
    switch (platform) {
      case 'tiktok':
        return { topMarginPx: 120, bottomMarginPx: 380, rightMarginPx: 140, leftMarginPx: 40 };
      case 'instagram-reels':
        return { topMarginPx: 100, bottomMarginPx: 320, rightMarginPx: 120, leftMarginPx: 40 };
      case 'youtube-shorts':
        return { topMarginPx: 90, bottomMarginPx: 280, rightMarginPx: 110, leftMarginPx: 40 };
      case 'none':
      default:
        return { topMarginPx: 0, bottomMarginPx: 0, rightMarginPx: 0, leftMarginPx: 0 };
    }
  }

  /**
   * Deadband Pan Smoothing Filter.
   */
  static filterDeadbandPan(
    currentPanX: number,
    targetSubjectX: number,
    deadbandRadius = 45,
    lerpFactor = 0.15
  ): number {
    const delta = targetSubjectX - currentPanX;
    if (Math.abs(delta) <= deadbandRadius) {
      return Math.round(currentPanX * 10) / 10;
    }
    const movement = delta > 0 ? delta - deadbandRadius : delta + deadbandRadius;
    const newPan = currentPanX + movement * lerpFactor;
    return Math.round(newPan * 10) / 10;
  }

  /**
   * 2.5D Multi-Plane Depth Parallax Engine (Separating Character Foreground from Background).
   * Replaces 45+ minutes of manual After Effects 3D Layer Rigging.
   */
  static compute25DParallaxRig(
    characterCenter: { x: number; y: number },
    depthIntensity = 1.0,
    duration = 5.0
  ): ParallaxPlaneLayerKeyframes {
    const steps = 6;
    const fgPan: KeyframePoint[] = [];
    const fgScale: KeyframePoint[] = [];
    const bgPan: KeyframePoint[] = [];
    const bgScale: KeyframePoint[] = [];
    const camZ: KeyframePoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * duration;
      const progress = i / steps;

      const fgValX = characterCenter.x + (progress - 0.5) * 24 * depthIntensity;
      const fgScaleVal = 100 + progress * 14 * depthIntensity;

      const bgValX = -(progress - 0.5) * 40 * depthIntensity;
      const bgScaleVal = 125 + progress * 4;

      const zDepth = -progress * 250 * depthIntensity;

      fgPan.push({
        id: 9100 + i,
        time: Math.round(t * 10) / 10,
        value: Math.round(fgValX),
        type: 'bezier',
        handleIn: { x: 0.2, y: fgValX },
        handleOut: { x: 0.2, y: fgValX },
      });

      fgScale.push({
        id: 9200 + i,
        time: Math.round(t * 10) / 10,
        value: Math.round(fgScaleVal),
        type: 'bezier',
        handleIn: { x: 0.2, y: fgScaleVal },
        handleOut: { x: 0.2, y: fgScaleVal },
      });

      bgPan.push({
        id: 9300 + i,
        time: Math.round(t * 10) / 10,
        value: Math.round(bgValX),
        type: 'bezier',
        handleIn: { x: 0.2, y: bgValX },
        handleOut: { x: 0.2, y: bgValX },
      });

      bgScale.push({
        id: 9400 + i,
        time: Math.round(t * 10) / 10,
        value: Math.round(bgScaleVal),
        type: 'bezier',
        handleIn: { x: 0.2, y: bgScaleVal },
        handleOut: { x: 0.2, y: bgScaleVal },
      });

      camZ.push({
        id: 9500 + i,
        time: Math.round(t * 10) / 10,
        value: Math.round(zDepth),
        type: 'bezier',
        handleIn: { x: 0.2, y: zDepth },
        handleOut: { x: 0.2, y: zDepth },
      });
    }

    return {
      foregroundPanKeyframes: fgPan,
      foregroundScaleKeyframes: fgScale,
      backgroundPanKeyframes: bgPan,
      backgroundScaleKeyframes: bgScale,
      cameraZDepthKeyframes: camZ,
    };
  }

  /**
   * Solves Multi-Speaker Composition Layout for 1:1, 4:5, 9:16, or 16:9.
   */
  static computeMultiSpeakerLayout(
    sourceW = 1920,
    sourceH = 1080,
    speakers: SpeakerProfile[] = [],
    activeSpeakerId = 'speaker-a',
    layoutMode: ReframeLayoutMode = 'full-bleed-pan',
    targetFormat: SocialTargetFormat = '9:16-reels'
  ): MultiSpeakerReframeResult {
    let targetW = Math.round((sourceH * 9) / 16);
    if (targetFormat === '1:1-square') targetW = sourceH;
    else if (targetFormat === '4:5-portrait') targetW = Math.round((sourceH * 4) / 5);
    else if (targetFormat === '16:9-landscape') targetW = sourceW;

    const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId) || speakers[0] || { id: 'speaker-a', name: 'Host', x: sourceW * 0.3, y: sourceH * 0.5, isActive: true };
    const secondarySpeaker = speakers.find((s) => s.id !== activeSpeaker.id) || speakers[1] || { id: 'speaker-b', name: 'Guest', x: sourceW * 0.7, y: sourceH * 0.5, isActive: false };

    if (layoutMode === 'split-duplex') {
      const halfH = Math.round(sourceH / 2);
      const halfW = targetW;
      const cropA_X = Math.max(0, Math.min(sourceW - halfW, activeSpeaker.x - halfW / 2));
      const cropB_X = Math.max(0, Math.min(sourceW - halfW, secondarySpeaker.x - halfW / 2));

      return {
        layoutMode,
        targetFormat,
        primaryCrop: { x: Math.round(cropA_X), y: 0, width: halfW, height: halfH, scale: 1.0, label: activeSpeaker.name },
        secondaryCrop: { x: Math.round(cropB_X), y: halfH, width: halfW, height: halfH, scale: 1.0, label: secondarySpeaker.name },
      };
    }

    if (layoutMode === 'tri-stack') {
      const thirdH = Math.round(sourceH / 3);
      const thirdW = targetW;
      return {
        layoutMode,
        targetFormat,
        primaryCrop: { x: Math.round(activeSpeaker.x - thirdW / 2), y: 0, width: thirdW, height: thirdH, scale: 1.0, label: 'Host (Top)' },
        secondaryCrop: { x: Math.round(sourceW / 2 - thirdW / 2), y: thirdH, width: thirdW, height: thirdH, scale: 1.0, label: 'Screen / Gameplay (Center)' },
        tertiaryCrop: { x: Math.round(secondarySpeaker.x - thirdW / 2), y: thirdH * 2, width: thirdW, height: thirdH, scale: 1.0, label: 'Guest (Bottom)' },
      };
    }

    if (layoutMode === 'blurred-mirror') {
      const contentH = Math.round((targetW * 9) / 16);
      const padH = Math.max(0, Math.round((sourceH - contentH) / 2));
      return {
        layoutMode,
        targetFormat,
        primaryCrop: { x: 0, y: padH, width: targetW, height: contentH, scale: 1.0, label: `${targetFormat.toUpperCase()} Centered` },
        blurredBackgroundPadding: { topH: padH, bottomH: padH, blurRadius: 30 },
      };
    }

    if (layoutMode === 'pip-bubble') {
      const cropX = Math.max(0, Math.min(sourceW - targetW, activeSpeaker.x - targetW / 2));
      return {
        layoutMode,
        targetFormat,
        primaryCrop: { x: Math.round(cropX), y: 0, width: targetW, height: sourceH, scale: 1.0, label: 'Main Scene' },
        pipBubble: { x: Math.round(targetW * 0.65), y: Math.round(sourceH * 0.15), size: 160, borderRadius: 32 },
      };
    }

    // Default: Full-Bleed Pan & Scan
    const minX = 0;
    const maxX = sourceW - targetW;
    const cropX = Math.max(minX, Math.min(maxX, activeSpeaker.x - targetW / 2));

    return {
      layoutMode: 'full-bleed-pan',
      targetFormat,
      primaryCrop: {
        x: Math.round(cropX),
        y: 0,
        width: targetW,
        height: sourceH,
        scale: 1.0,
        label: activeSpeaker.name,
      },
    };
  }

  /**
   * Safe-Zone Collision Avoidance Placement Solver.
   */
  static solveSafeCaptionPlacement(
    contentH = 1920,
    faceY = 700,
    captionH = 90,
    safeZone: SafeZoneBounds = { topMarginPx: 120, bottomMarginPx: 380, rightMarginPx: 140, leftMarginPx: 40 }
  ): { y: number; isCollisionAvoided: boolean } {
    let targetY = contentH - safeZone.bottomMarginPx - captionH - 20;
    let isCollisionAvoided = false;

    if (Math.abs(targetY - faceY) < 180) {
      if (faceY > contentH * 0.5) {
        targetY = faceY - 200;
        isCollisionAvoided = true;
      } else {
        targetY = contentH - safeZone.bottomMarginPx - captionH;
        isCollisionAvoided = true;
      }
    }

    targetY = Math.max(safeZone.topMarginPx + 40, Math.min(contentH - safeZone.bottomMarginPx - captionH, targetY));
    return { y: Math.round(targetY), isCollisionAvoided };
  }

  /**
   * Generates Complete After Effects ExtendScript (.jsx) Multi-Track Project.
   */
  static generateAfterEffectsProjectScript(config: SocialReframeProjectExportConfig): string {
    let compW = 1080;
    let compH = 1920;
    if (config.format === '1:1-square') { compW = 1080; compH = 1080; }
    else if (config.format === '4:5-portrait') { compW = 1080; compH = 1350; }
    else if (config.format === '16:9-landscape') { compW = 1920; compH = 1080; }

    let jsx = `// Motion Studio — Automated Social Reframe Project Exporter\n`;
    jsx += `// Generated for Adobe After Effects ExtendScript\n`;
    jsx += `(function() {\n`;
    jsx += `  app.beginUndoGroup("Motion Studio: Auto-Reframe (${config.format.toUpperCase()})");\n`;
    jsx += `  var project = app.project;\n`;
    jsx += `  var comp = project.items.addComp("Reframed_${config.format.toUpperCase()}", ${compW}, ${compH}, 1.0, ${config.durationSec}, 60);\n\n`;
    jsx += `  // 1. Background Blur Layer\n`;
    jsx += `  var bgSolid = comp.layers.addSolid([0.05, 0.07, 0.12], "Background_Ambient", ${compW}, ${compH}, 1.0);\n\n`;
    jsx += `  // 2. Camera Null Controller\n`;
    jsx += `  var camCtrl = comp.layers.addNull();\n`;
    jsx += `  camCtrl.name = "Reframe_Camera_Controller";\n`;
    jsx += `  var posProp = camCtrl.property("Transform").property("Position");\n`;
    jsx += `  var scaleProp = camCtrl.property("Transform").property("Scale");\n\n`;

    config.panKeyframes.forEach((k) => {
      jsx += `  posProp.setValueAtTime(${k.time}, [${k.value}, ${compH / 2}, 0]);\n`;
    });

    config.scaleKeyframes.forEach((k) => {
      jsx += `  scaleProp.setValueAtTime(${k.time}, [${k.value}, ${k.value}, 100]);\n`;
    });

    jsx += `\n  // 3. Top Retention Hook Banner\n`;
    jsx += `  var textLayer = comp.layers.addText("${config.hookText.replace(/"/g, '\\"')}");\n`;
    jsx += `  textLayer.name = "Retention_Hook_Title";\n`;
    jsx += `  textLayer.property("Transform").property("Position").setValue([${compW / 2}, 120, 0]);\n\n`;

    jsx += `  app.endUndoGroup();\n`;
    jsx += `  alert("✓ Motion Studio: Successfully generated ${config.format.toUpperCase()} reframed composition in After Effects!");\n`;
    jsx += `})();\n`;
    return jsx;
  }

  /**
   * Generates Complete Adobe Premiere Pro UXP Timeline Sequence JSON.
   */
  static generatePremiereUxpSequence(config: SocialReframeProjectExportConfig): string {
    let targetW = 1080;
    let targetH = 1920;
    if (config.format === '1:1-square') { targetW = 1080; targetH = 1080; }
    else if (config.format === '4:5-portrait') { targetW = 1080; targetH = 1350; }
    else if (config.format === '16:9-landscape') { targetW = 1920; targetH = 1080; }

    return JSON.stringify(
      {
        generator: 'Motion Studio Social Reframe Pipeline',
        version: '2.5.0',
        host: 'premierepro',
        targetFormat: config.format,
        sequenceSettings: {
          width: targetW,
          height: targetH,
          frameRate: 60.0,
          durationSec: config.durationSec,
        },
        tracks: [
          {
            trackIndex: 1,
            name: 'V1_Ambient_Gaussian_Blur_Mirror',
            scalePercent: 130,
            effects: [{ name: 'GaussianBlur', blurriness: 30 }],
          },
          {
            trackIndex: 2,
            name: 'V2_Primary_Subject_Tracked',
            panKeyframes: config.panKeyframes.map((k) => ({ timeSec: k.time, x: k.value, y: targetH / 2 })),
            scaleKeyframes: config.scaleKeyframes.map((k) => ({ timeSec: k.time, scale: k.value })),
          },
          {
            trackIndex: 3,
            name: 'V3_Top_Neon_Progress_Bar',
            type: 'shape_crop',
            color: '#38bdf8',
          },
          {
            trackIndex: 4,
            name: 'V4_Viral_Retention_Hook',
            headline: config.hookText,
            style: 'viral-yellow',
          },
        ],
      },
      null,
      2
    );
  }

  /**
   * Bakes Social Reframe Pan & Scale Keyframes into Graph Editor Format.
   */
  static bakeReframeTrajectoryToKeyframes(
    panPoints: { time: number; panX: number; scale: number }[]
  ): KeyframePoint[] {
    return panPoints.map((pt, idx) => ({
      id: 8400 + idx,
      time: Math.round(pt.time * 10) / 10,
      value: Math.round(pt.panX),
      type: 'bezier',
      handleIn: { x: 0.2, y: pt.panX },
      handleOut: { x: 0.2, y: pt.panX },
    }));
  }
}
