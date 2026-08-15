export interface CameraMotionConfig {
  zoom: number; // 1.0 = 100%
  panX: number; // px offset
  panY: number; // px offset
  tiltAngle: number; // degrees
  shakeIntensity: number; // 0 to 1
  handheldNoise: boolean;
}

export const DEFAULT_CAMERA_CONFIG: CameraMotionConfig = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
  tiltAngle: 0,
  shakeIntensity: 0,
  handheldNoise: false,
};

/**
 * Computes camera transform matrix offsets at a given frame.
 */
export function evaluateCameraMotionAtFrame(
  config: CameraMotionConfig,
  currentFrame: number,
  mode: 'cinematic-push' | 'handheld-shake' | 'orbit-circle' | 'static'
): CameraMotionConfig {
  let zoom = config.zoom;
  let panX = config.panX;
  let panY = config.panY;
  let tilt = config.tiltAngle;

  switch (mode) {
    case 'cinematic-push': {
      const progress = (currentFrame % 100) / 100;
      zoom = config.zoom + progress * 0.25; // Gentle push-in
      panY = config.panY - progress * 15;
      break;
    }

    case 'handheld-shake': {
      const intensity = (config.shakeIntensity || 0.6) * 6;
      panX += Math.sin(currentFrame * 0.4) * intensity + Math.cos(currentFrame * 0.9) * (intensity * 0.5);
      panY += Math.cos(currentFrame * 0.35) * intensity + Math.sin(currentFrame * 0.8) * (intensity * 0.5);
      tilt += Math.sin(currentFrame * 0.2) * 0.8;
      break;
    }

    case 'orbit-circle': {
      const angle = (currentFrame / 100) * Math.PI * 2;
      const radius = 30;
      panX += Math.cos(angle) * radius;
      panY += Math.sin(angle) * (radius * 0.6);
      tilt += Math.sin(angle) * 1.5;
      break;
    }

    default:
      break;
  }

  return {
    zoom: Math.round(zoom * 100) / 100,
    panX: Math.round(panX * 10) / 10,
    panY: Math.round(panY * 10) / 10,
    tiltAngle: Math.round(tilt * 10) / 10,
    shakeIntensity: config.shakeIntensity,
    handheldNoise: config.handheldNoise,
  };
}

/**
 * Generates an SVG/CSS transform string representing 2.5D camera space.
 */
export function getCameraTransformStyle(camera: CameraMotionConfig): string {
  return `scale(${camera.zoom}) translate(${camera.panX}px, ${camera.panY}px) rotate(${camera.tiltAngle}deg)`;
}
