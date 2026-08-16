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

export class ExtendedSocialReframeEngine {
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
   * If subject movement is within deadbandRadius, keep camera stationary to eliminate micro-jitter.
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
   * Solves Multi-Speaker Vertical Composition Layout (Full Bleed, Split Duplex, Tri-Stack, Blurred Mirror, PiP).
   */
  static computeMultiSpeakerLayout(
    sourceW = 1920,
    sourceH = 1080,
    speakers: SpeakerProfile[] = [],
    activeSpeakerId = 'speaker-a',
    layoutMode: ReframeLayoutMode = 'full-bleed-pan',
    targetFormat: SocialTargetFormat = '9:16-reels'
  ): MultiSpeakerReframeResult {
    // 9:16 Vertical Target Dimensions
    let targetW = Math.round((sourceH * 9) / 16); // e.g. 607.5 for 1080h
    if (targetFormat === '1:1-square') targetW = sourceH;
    else if (targetFormat === '4:5-portrait') targetW = Math.round((sourceH * 4) / 5);

    const activeSpeaker = speakers.find((s) => s.id === activeSpeakerId) || speakers[0] || { id: 'speaker-a', name: 'Host', x: sourceW * 0.3, y: sourceH * 0.5, isActive: true };
    const secondarySpeaker = speakers.find((s) => s.id !== activeSpeaker.id) || speakers[1] || { id: 'speaker-b', name: 'Guest', x: sourceW * 0.7, y: sourceH * 0.5, isActive: false };

    if (layoutMode === 'split-duplex') {
      // Top Half: Speaker A, Bottom Half: Speaker B
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
      // Tri-Split: Top = Host, Center = Screen/Gameplay, Bottom = Guest
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
      // 16:9 Video in Center with 30px Gaussian Blurred Top & Bottom Fillers
      const contentH = Math.round((targetW * 9) / 16);
      const padH = Math.round((sourceH - contentH) / 2);
      return {
        layoutMode,
        targetFormat,
        primaryCrop: { x: 0, y: padH, width: targetW, height: contentH, scale: 1.0, label: '16:9 Video Centered' },
        blurredBackgroundPadding: { topH: padH, bottomH: padH, blurRadius: 30 },
      };
    }

    if (layoutMode === 'pip-bubble') {
      // Full background with floating facecam squircle
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
   * Repositions caption/badge Y coordinate so it never collides with UI buttons or faces.
   */
  static solveSafeCaptionPlacement(
    contentH = 1920,
    faceY = 700,
    captionH = 90,
    safeZone: SafeZoneBounds = { topMarginPx: 120, bottomMarginPx: 380, rightMarginPx: 140, leftMarginPx: 40 }
  ): { y: number; isCollisionAvoided: boolean } {
    // Standard desired position: Above bottom safe margin
    let targetY = contentH - safeZone.bottomMarginPx - captionH - 20;

    // Check if targetY collides with face bounds (faceY +- 150px)
    let isCollisionAvoided = false;
    if (Math.abs(targetY - faceY) < 180) {
      if (faceY > contentH * 0.5) {
        // Face is lower -> push caption above face
        targetY = faceY - 200;
        isCollisionAvoided = true;
      } else {
        // Face is higher -> push caption further down
        targetY = contentH - safeZone.bottomMarginPx - captionH;
        isCollisionAvoided = true;
      }
    }

    // Clamp inside top and bottom safe zones
    targetY = Math.max(safeZone.topMarginPx + 40, Math.min(contentH - safeZone.bottomMarginPx - captionH, targetY));

    return { y: Math.round(targetY), isCollisionAvoided };
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
