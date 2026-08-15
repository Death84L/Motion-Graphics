import { KeyframePoint } from '../../features/graph-editor/types';

export interface PhysicsSimulationConfig {
  gravity: number; // e.g. 9.8 or 18
  mass: number; // e.g. 1.0 kg
  restitution: number; // 0 (clay) to 0.85 (rubber)
  friction: number; // 0.05 to 0.5
  initialVelocityY: number; // e.g. -12
  initialHeightPx: number; // e.g. 200
  floorLevelPx: number; // e.g. 0
  totalFrames: number;
}

export const DEFAULT_PHYSICS_CONFIG: PhysicsSimulationConfig = {
  gravity: 16.0,
  mass: 1.0,
  restitution: 0.72,
  friction: 0.12,
  initialVelocityY: 0,
  initialHeightPx: 200,
  floorLevelPx: 0,
  totalFrames: 80,
};

/**
 * Runs a deterministic 2D physics integration (Verlet/Euler) simulating realistic bounces
 * and converts the physics trajectory into editable Bézier KeyframePoints.
 */
export function simulatePhysicsTrajectory(
  config: PhysicsSimulationConfig = DEFAULT_PHYSICS_CONFIG
): { trajectory: Array<{ frame: number; y: number; vy: number }>; keyframes: KeyframePoint[] } {
  let y = config.initialHeightPx;
  let vy = config.initialVelocityY;
  const dt = 1 / 30; // 30 fps
  const trajectory: Array<{ frame: number; y: number; vy: number }> = [];
  const keyframes: KeyframePoint[] = [];

  keyframes.push({ id: 1, time: 0, value: y, type: 'bezier', handleOut: { x: 0.2, y: 0.8 } });

  let bounceCount = 0;

  for (let f = 0; f <= config.totalFrames; f++) {
    // Gravity acceleration
    vy += config.gravity * dt * 40;
    y -= vy * dt * 10;

    // Floor Collision
    if (y <= config.floorLevelPx) {
      y = config.floorLevelPx;
      vy = -vy * config.restitution;
      bounceCount++;

      // Record bounce keyframe
      if (Math.abs(vy) > 1 && f > 0) {
        keyframes.push({
          id: keyframes.length + 1,
          time: f,
          value: 0,
          type: 'bezier',
          handleIn: { x: 0.25, y: 0 },
          handleOut: { x: 0.25, y: 0 },
        });
      }
    }

    trajectory.push({ frame: f, y: Math.max(0, Math.round(y * 10) / 10), vy: Math.round(vy * 10) / 10 });
  }

  // Final Keyframe
  if (keyframes[keyframes.length - 1].time !== config.totalFrames) {
    keyframes.push({
      id: keyframes.length + 1,
      time: config.totalFrames,
      value: 0,
      type: 'bezier',
      handleIn: { x: 0.5, y: 1.0 },
    });
  }

  return { trajectory, keyframes };
}
