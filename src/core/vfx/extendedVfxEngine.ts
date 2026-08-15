import { KeyframePoint } from '../../features/graph-editor/types';

export type VfxCategory =
  | 'Optics & Flares'
  | 'Distortion & Noise'
  | 'Retro & Glitch'
  | 'Atmospheric & Glow'
  | 'Stylize & Textures';

export type VfxEffectType =
  | 'anamorphic-lens-flare'
  | 'chromatic-aberration'
  | 'volumetric-god-rays'
  | 'optical-glow-bloom'
  | 'heat-wave-distortion'
  | 'underwater-caustics'
  | 'crt-vhs-scanlines'
  | 'digital-glitch-displace'
  | 'analog-film-grain'
  | 'burning-ember-edge'
  | 'lightning-electric-arc'
  | 'halftone-dot-matrix';

export interface LensFlareElement {
  type: 'core-hotspot' | 'horizontal-streak' | 'aperture-ghost' | 'rainbow-ring' | 'starburst';
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export interface EvaluatedVfxState {
  flareElements?: LensFlareElement[];
  chromaticOffsetPx?: number;
  bloomRadiusPx?: number;
  glitchBands?: { y: number; height: number; shiftX: number }[];
  heatWavePhase?: number;
  grainIntensity?: number;
  vignetteOpacity?: number;
}

export class ExtendedVfxEngine {
  /**
   * Evaluates Multi-Element Anamorphic Lens Flare geometry and optical ghosts.
   */
  static evaluateLensFlare(
    lightX: number,
    lightY: number,
    canvasWidth = 480,
    canvasHeight = 320,
    intensity = 1.0,
    streakColor = '#38bdf8'
  ): LensFlareElement[] {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const dx = lightX - centerX;
    const dy = lightY - centerY;

    const elements: LensFlareElement[] = [];

    // 1. Core Hotspot
    elements.push({
      type: 'core-hotspot',
      x: lightX,
      y: lightY,
      size: 40 * intensity,
      color: '#ffffff',
      opacity: Math.min(1.0, 0.9 * intensity),
    });

    // 2. Anamorphic Horizontal Blue Streak
    elements.push({
      type: 'horizontal-streak',
      x: lightX,
      y: lightY,
      size: 280 * intensity,
      color: streakColor,
      opacity: Math.min(1.0, 0.85 * intensity),
    });

    // 3. Aperture Polygonal Ghosts (reflected across center point)
    const ghostPositions = [-0.6, -0.3, 0.4, 0.8, 1.2];
    ghostPositions.forEach((pos, idx) => {
      const gx = centerX + dx * pos;
      const gy = centerY + dy * pos;
      const ghostColor = ['#38bdf8', '#ec4899', '#f59e0b', '#10b981', '#a855f7'][idx % 5];

      elements.push({
        type: 'aperture-ghost',
        x: gx,
        y: gy,
        size: (16 + idx * 8) * intensity,
        color: ghostColor,
        opacity: Math.max(0.1, 0.4 * intensity),
      });
    });

    // 4. Rainbow Iris Ring
    elements.push({
      type: 'rainbow-ring',
      x: centerX + dx * 0.6,
      y: centerY + dy * 0.6,
      size: 75 * intensity,
      color: '#a855f7',
      opacity: 0.35 * intensity,
    });

    return elements;
  }

  /**
   * Evaluates Digital Glitch Scanline Displacement Bands.
   */
  static evaluateGlitchBands(
    timeSeconds: number,
    canvasHeight = 320,
    intensity = 0.5
  ): { y: number; height: number; shiftX: number }[] {
    const bands: { y: number; height: number; shiftX: number }[] = [];
    const count = Math.floor(Math.sin(timeSeconds * 30) * 3 + 4);

    for (let i = 0; i < count; i++) {
      const seed = timeSeconds * 10 + i * 137.5;
      const y = (Math.sin(seed) * 0.5 + 0.5) * canvasHeight;
      const height = (Math.cos(seed * 2) * 0.5 + 0.5) * 24 + 4;
      const shiftX = Math.sin(seed * 5) * 32 * intensity;

      bands.push({
        y: Math.round(y),
        height: Math.round(height),
        shiftX: Math.round(shiftX * 10) / 10,
      });
    }

    return bands;
  }

  /**
   * Generates Lightning Electrical Arc Points between two vectors.
   */
  static generateLightningArc(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    segments = 12,
    jaggedness = 24
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
    const dx = endX - startX;
    const dy = endY - startY;

    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const normalX = -dy / Math.max(1, Math.hypot(dx, dy));
      const normalY = dx / Math.max(1, Math.hypot(dx, dy));
      const offset = (Math.random() - 0.5) * jaggedness;

      points.push({
        x: Math.round(startX + dx * t + normalX * offset),
        y: Math.round(startY + dy * t + normalY * offset),
      });
    }

    points.push({ x: endX, y: endY });
    return points;
  }

  /**
   * Bakes VFX Animation Trajectories into Standard Bézier Keyframes.
   */
  static bakeVfxToKeyframes(effect: VfxEffectType, durationSec = 2.0, fps = 60): KeyframePoint[] {
    const totalFrames = Math.round(durationSec * fps);
    const keyframes: KeyframePoint[] = [];

    for (let f = 0; f <= totalFrames; f += 6) {
      const t = f / totalFrames;
      let val = 100;

      if (effect === 'anamorphic-lens-flare') {
        val = Math.round((Math.sin(t * Math.PI) * 0.5 + 0.5) * 100);
      } else if (effect === 'digital-glitch-displace') {
        val = Math.round(Math.abs(Math.sin(t * 30)) * 100);
      } else if (effect === 'heat-wave-distortion') {
        val = Math.round(Math.sin(t * Math.PI * 4) * 50 + 50);
      }

      keyframes.push({
        id: 9980 + f,
        time: Math.round(t * 100 * 10) / 10,
        value: val,
        type: 'bezier',
        handleIn: { x: 0.2, y: val },
        handleOut: { x: 0.2, y: val },
      });
    }

    return keyframes;
  }
}
