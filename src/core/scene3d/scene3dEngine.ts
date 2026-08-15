export interface Layer3DDepthNode {
  id: string;
  name: string;
  zDepth: number; // e.g. 0 (foreground) to 1000 (deep background)
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  opacity: number;
}

export interface Camera3DRig {
  positionX: number;
  positionY: number;
  positionZ: number; // Camera Dolly
  fovPerspectivePx: number; // e.g. 800px
  orbitAngleX: number;
  orbitAngleY: number;
  handheldShakeIntensity: number;
}

export const DEFAULT_CAMERA_RIG: Camera3DRig = {
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  fovPerspectivePx: 800,
  orbitAngleX: 0,
  orbitAngleY: 0,
  handheldShakeIntensity: 0.2,
};

export const SAMPLE_3D_SCENE_LAYERS: Layer3DDepthNode[] = [
  { id: 'l3d-bg', name: 'Background Parallax Grid', zDepth: 600, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1.5, opacity: 0.4 },
  { id: 'l3d-card', name: 'Interactive UI Card', zDepth: 250, rotationX: 8, rotationY: -12, rotationZ: 0, scale: 1.0, opacity: 1.0 },
  { id: 'l3d-text', name: 'Hero Title 3D', zDepth: 100, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1.0, opacity: 1.0 },
  { id: 'l3d-fg', name: 'Floating Spark Particles', zDepth: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1.0, opacity: 0.9 },
];

/**
 * Computes 2.5D/3D matrix transform style for any layer taking into account camera dolly and parallax depth.
 */
export function calculate3DLayerTransform(
  layer: Layer3DDepthNode,
  camera: Camera3DRig = DEFAULT_CAMERA_RIG,
  currentFrame = 0
): string {
  // Compute Handheld Noise
  const shakeX = Math.sin(currentFrame * 0.1) * camera.handheldShakeIntensity * 8;
  const shakeY = Math.cos(currentFrame * 0.12) * camera.handheldShakeIntensity * 8;

  const totalZ = layer.zDepth - camera.positionZ;
  const parallaxFactor = 1 - (layer.zDepth / 1200);

  const finalX = (camera.positionX + shakeX) * parallaxFactor;
  const finalY = (camera.positionY + shakeY) * parallaxFactor;
  const rotX = layer.rotationX + camera.orbitAngleX;
  const rotY = layer.rotationY + camera.orbitAngleY;

  return `perspective(${camera.fovPerspectivePx}px) translate3d(${finalX}px, ${finalY}px, ${-totalZ * 0.5}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${layer.rotationZ}deg) scale(${layer.scale})`;
}
