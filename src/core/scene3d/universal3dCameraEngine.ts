import { KeyframePoint } from '../../features/graph-editor/types';

export interface Camera3DConfig {
  focalLengthMm: number; // 18mm to 200mm
  sensorWidthMm: number; // Standard 36mm Full-Frame
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  depthOfField: {
    enabled: boolean;
    focusDistance: number;
    apertureFStop: number; // f/1.4 to f/22
  };
  shakeIntensity: number; // 0.0 to 1.0
}

export class Universal3dCameraEngine {
  /**
   * Calculates Field of View (FOV in degrees) from focal length and sensor size.
   * Formula: FOV = 2 * arctan(sensorWidth / (2 * focalLength))
   */
  static calculateFovDegrees(focalLengthMm: number, sensorWidthMm = 36): number {
    const fovRad = 2 * Math.atan(sensorWidthMm / (2 * Math.max(1, focalLengthMm)));
    return Math.round((fovRad * (180 / Math.PI)) * 10) / 10;
  }

  /**
   * Calculates 2.5D Multi-Plane Parallax Scroll Position based on layer Z-depth.
   */
  static calculateParallaxOffset(
    layerZ: number,
    cameraX: number,
    cameraY: number,
    cameraZ = 1000
  ): { x: number; y: number; scale: number } {
    // Perspective projection depth factor
    const depthFactor = Math.max(0.1, (cameraZ - layerZ) / cameraZ);
    return {
      x: Math.round(-cameraX * (1 - 1 / depthFactor) * 10) / 10,
      y: Math.round(-cameraY * (1 - 1 / depthFactor) * 10) / 10,
      scale: Math.round((1 / depthFactor) * 1000) / 1000,
    };
  }

  /**
   * Simulates Dolly Zoom (Vertigo Effect) keeping subject width constant while changing background FOV.
   */
  static evaluateDollyZoom(
    progress: number,
    subjectDistance = 500,
    initialFocalLength = 24,
    finalFocalLength = 85
  ): { cameraZ: number; focalLength: number; fov: number } {
    const t = Math.max(0, Math.min(1, progress));
    const smoothT = t * t * (3 - 2 * t);

    const currentFocalLength = initialFocalLength + (finalFocalLength - initialFocalLength) * smoothT;
    const currentFov = this.calculateFovDegrees(currentFocalLength);

    // To keep subject constant size: Distance = SubjectWidth / (2 * tan(FOV/2))
    const currentCameraZ = subjectDistance * (currentFocalLength / initialFocalLength);

    return {
      cameraZ: Math.round(currentCameraZ * 10) / 10,
      focalLength: Math.round(currentFocalLength * 10) / 10,
      fov: currentFov,
    };
  }

  /**
   * Generates organic handheld camera breathing and micro-jitter curves.
   */
  static generateHandheldShake(
    timeSeconds: number,
    intensity = 0.5
  ): { rotX: number; rotY: number; rotZ: number } {
    const rotX = (Math.sin(timeSeconds * 1.5) * 1.2 + Math.sin(timeSeconds * 4.2) * 0.4) * intensity;
    const rotY = (Math.cos(timeSeconds * 1.1) * 1.5 + Math.cos(timeSeconds * 3.8) * 0.5) * intensity;
    const rotZ = Math.sin(timeSeconds * 2.1) * 0.6 * intensity;

    return {
      rotX: Math.round(rotX * 100) / 100,
      rotY: Math.round(rotY * 100) / 100,
      rotZ: Math.round(rotZ * 100) / 100,
    };
  }

  /**
   * Bakes 3D Camera Dolly and Orbit Motion into Standard Keyframes for Premiere / After Effects 3D Cameras.
   */
  static bakeCameraToKeyframes(
    initialFocal = 24,
    finalFocal = 70,
    durationSec = 3.0,
    fps = 60
  ): KeyframePoint[] {
    const totalFrames = Math.round(durationSec * fps);
    const keyframes: KeyframePoint[] = [];

    for (let f = 0; f <= totalFrames; f += 6) {
      const progress = f / totalFrames;
      const vertigo = this.evaluateDollyZoom(progress, 500, initialFocal, finalFocal);

      keyframes.push({
        id: 9970 + f,
        time: Math.round(progress * 100 * 10) / 10,
        value: Math.round(vertigo.cameraZ),
        type: 'bezier',
        handleIn: { x: 0.25, y: vertigo.cameraZ },
        handleOut: { x: 0.25, y: vertigo.cameraZ },
      });
    }

    return keyframes;
  }
}
