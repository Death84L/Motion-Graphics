import { KeyframePoint } from '../../features/graph-editor/types';

export interface SpringStageConfig {
  stiffness: number; // e.g. 180
  damping: number; // e.g. 12
  mass: number; // e.g. 1.0
}

/**
 * Evaluates a multi-stage cascading spring physics chain S1 -> S2 -> S3.
 */
export function evaluateSpringChain(
  stages: SpringStageConfig[],
  targetValue = 100,
  durationFrames = 60
): KeyframePoint[] {
  const points: KeyframePoint[] = [];
  const dt = 1 / 30; // 30fps timestep

  // State arrays for each stage [pos, vel]
  const pos = stages.map(() => 0);
  const vel = stages.map(() => 0);

  for (let frame = 0; frame <= durationFrames; frame++) {
    for (let s = 0; s < stages.length; s++) {
      const cfg = stages[s];
      const target = s === 0 ? targetValue : pos[s - 1];

      const springForce = -cfg.stiffness * (pos[s] - target);
      const dampingForce = -cfg.damping * vel[s];
      const acceleration = (springForce + dampingForce) / cfg.mass;

      vel[s] += acceleration * dt;
      pos[s] += vel[s] * dt;
    }

    const lastPos = pos[stages.length - 1];
    const timeNorm = (frame / durationFrames) * 100;

    points.push({
      id: 11000 + frame,
      time: Math.round(timeNorm * 10) / 10,
      value: Math.round(lastPos * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return points;
}
