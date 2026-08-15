export type PhysicsMaterialType =
  | 'rubber'
  | 'metal'
  | 'wood'
  | 'jelly'
  | 'ice'
  | 'foam'
  | 'fabric';

export interface PhysicsMaterialConfig {
  name: string;
  density: number; // kg/m²
  restitution: number; // 0.0 (inelastic) to 0.95 (super bouncy)
  friction: number; // 0.0 (frictionless ice) to 0.8 (sticky rubber)
  dragCoefficient: number; // air resistance
  compliance: number; // soft-body flexibility (0 = rigid, 0.8 = jelly)
}

export const MATERIAL_PRESETS: Record<PhysicsMaterialType, PhysicsMaterialConfig> = {
  rubber: { name: 'Rubber', density: 1.2, restitution: 0.85, friction: 0.7, dragCoefficient: 0.05, compliance: 0.1 },
  metal: { name: 'Solid Metal', density: 7.8, restitution: 0.15, friction: 0.25, dragCoefficient: 0.02, compliance: 0.0 },
  wood: { name: 'Hard Wood', density: 0.7, restitution: 0.45, friction: 0.4, dragCoefficient: 0.04, compliance: 0.0 },
  jelly: { name: 'Soft Jelly / Blob', density: 0.9, restitution: 0.75, friction: 0.3, dragCoefficient: 0.08, compliance: 0.75 },
  ice: { name: 'Smooth Ice', density: 0.9, restitution: 0.2, friction: 0.02, dragCoefficient: 0.01, compliance: 0.0 },
  foam: { name: 'Soft Foam', density: 0.1, restitution: 0.25, friction: 0.5, dragCoefficient: 0.35, compliance: 0.5 },
  fabric: { name: 'Cloth / Fabric', density: 0.3, restitution: 0.05, friction: 0.6, dragCoefficient: 0.45, compliance: 0.9 },
};

export type ColliderShapeType = 'circle' | 'rectangle' | 'soft-body' | 'rope-chain' | 'pendulum';

export interface PhysicsBody {
  id: string;
  name: string;
  shape: ColliderShapeType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  radius: number;
  width: number;
  height: number;
  rotationDeg: number;
  angularVelocity: number;
  material: PhysicsMaterialType;
  isPinned: boolean;
  color: string;
}

export interface PhysicsSpringConstraint {
  id: string;
  bodyAId: string;
  bodyBId: string;
  restLength: number;
  stiffness: number;
  damping: number;
}

export interface PhysicsWorldConfig {
  gravityX: number;
  gravityY: number; // e.g. 980 px/s²
  timeScale: number; // 0.1 to 2.0
  substeps: number; // 1 to 8
  windForceX: number;
  windTurbulence: number;
  pointAttractorStrength: number; // positive = attract, negative = repel
  attractorX: number;
  attractorY: number;
  boundsWidth: number;
  boundsHeight: number;
}

export interface CollisionEvent {
  timestampMs: number;
  bodyAId: string;
  bodyBId: string;
  impactVelocity: number;
  pointX: number;
  pointY: number;
}

export interface PhysicsTelemetry {
  kineticEnergy: number; // 1/2 m v²
  potentialEnergy: number; // m g h
  totalMomentum: number; // m v
  peakVelocity: number;
  activeCollisionCount: number;
}

export interface PhysicsPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  bodies: PhysicsBody[];
  constraints: PhysicsSpringConstraint[];
  world: PhysicsWorldConfig;
}
