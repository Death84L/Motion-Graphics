import { KeyframePoint } from '../../features/graph-editor/types';

export interface DepthPlaneConfig {
  opticalZIntensity: number; // 0.2 to 2.5
  characterCenter: { x: number; y: number };
  durationSec: number;
  enableRimLight: boolean;
  enableVolumetricDust: boolean;
  enableDutchAngleRoll: boolean;
}

export interface DepthParallaxRigOutput {
  foregroundLayer: {
    panKeyframes: KeyframePoint[];
    scaleKeyframes: KeyframePoint[];
    zDepthOffset: number;
  };
  backgroundLayer: {
    panKeyframes: KeyframePoint[];
    scaleKeyframes: KeyframePoint[];
    blurRadiusPx: number;
    zDepthOffset: number;
  };
  cameraController: {
    dollyZKeyframes: KeyframePoint[];
    rollAngleKeyframes: KeyframePoint[];
  };
}

export class DepthParallaxEngine {
  /**
   * Computes a full 2.5D multi-plane spatial parallax camera rig.
   * Separates foreground character cutout from background layer in 3D space.
   */
  static computeSpatialParallaxRig(config: DepthPlaneConfig): DepthParallaxRigOutput {
    const steps = 8;
    const fgPan: KeyframePoint[] = [];
    const fgScale: KeyframePoint[] = [];
    const bgPan: KeyframePoint[] = [];
    const bgScale: KeyframePoint[] = [];
    const camZ: KeyframePoint[] = [];
    const camRoll: KeyframePoint[] = [];

    const intensity = Math.max(0.1, Math.min(3.0, config.opticalZIntensity));

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const t = Math.round(progress * config.durationSec * 100) / 100;

      // 1. Foreground Character: Moves in positive Z (towards camera) and slight X tracking
      const fgX = config.characterCenter.x + (progress - 0.5) * 28 * intensity;
      const fgScaleVal = 100 + progress * 16 * intensity;

      // 2. Background Layer: Pushes back into Z and counter-drifts in reverse X
      const bgX = -(progress - 0.5) * 45 * intensity;
      const bgScaleVal = 125 + progress * 5;

      // 3. Camera 3D Dolly Trajectory
      const dollyZ = -progress * 300 * intensity;

      // 4. Subtle Dutch Angle Roll on rapid moves
      const rollAngle = config.enableDutchAngleRoll ? Math.sin(progress * Math.PI * 2) * 1.5 * intensity : 0;

      fgPan.push({
        id: 9600 + i,
        time: t,
        value: Math.round(fgX * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: fgX },
        handleOut: { x: 0.25, y: fgX },
      });

      fgScale.push({
        id: 9700 + i,
        time: t,
        value: Math.round(fgScaleVal * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: fgScaleVal },
        handleOut: { x: 0.25, y: fgScaleVal },
      });

      bgPan.push({
        id: 9800 + i,
        time: t,
        value: Math.round(bgX * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: bgX },
        handleOut: { x: 0.25, y: bgX },
      });

      bgScale.push({
        id: 9900 + i,
        time: t,
        value: Math.round(bgScaleVal * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: bgScaleVal },
        handleOut: { x: 0.25, y: bgScaleVal },
      });

      camZ.push({
        id: 10000 + i,
        time: t,
        value: Math.round(dollyZ),
        type: 'bezier',
        handleIn: { x: 0.25, y: dollyZ },
        handleOut: { x: 0.25, y: dollyZ },
      });

      camRoll.push({
        id: 10100 + i,
        time: t,
        value: Math.round(rollAngle * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.25, y: rollAngle },
        handleOut: { x: 0.25, y: rollAngle },
      });
    }

    return {
      foregroundLayer: {
        panKeyframes: fgPan,
        scaleKeyframes: fgScale,
        zDepthOffset: -250 * intensity,
      },
      backgroundLayer: {
        panKeyframes: bgPan,
        scaleKeyframes: bgScale,
        blurRadiusPx: 28 + Math.round(intensity * 6),
        zDepthOffset: 150 * intensity,
      },
      cameraController: {
        dollyZKeyframes: camZ,
        rollAngleKeyframes: camRoll,
      },
    };
  }
}
