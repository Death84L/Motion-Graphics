import { KeyframePoint } from '../../features/graph-editor/types';
import {
  PhysicsBody,
  PhysicsSpringConstraint,
  PhysicsWorldConfig,
} from './universalPhysicsSchema';
import { UniversalPhysicsEngine } from './universalPhysicsEngine';

export class PhysicsKeyframeBaker {
  /**
   * Runs an offline deterministic physics simulation and bakes the target body's trajectory
   * into clean, optimized Bézier keyframes.
   */
  static bakeSimulationToKeyframes(
    initialBodies: PhysicsBody[],
    constraints: PhysicsSpringConstraint[],
    world: PhysicsWorldConfig,
    targetBodyId: string,
    targetProperty: 'y' | 'x' | 'velocity' = 'y',
    durationSeconds = 3.0,
    fps = 60
  ): KeyframePoint[] {
    let currentBodies = initialBodies.map((b) => ({ ...b }));
    const totalFrames = Math.round(durationSeconds * fps);
    const dt = 1 / fps;

    const rawSamples: { frame: number; timeNorm: number; val: number }[] = [];

    for (let f = 0; f <= totalFrames; f++) {
      const target = currentBodies.find((b) => b.id === targetBodyId) || currentBodies[0];
      let val = 0;
      if (targetProperty === 'y') {
        val = world.boundsHeight - target.y; // Invert for standard bottom-up coordinate space
      } else if (targetProperty === 'x') {
        val = target.x;
      } else {
        val = Math.sqrt(target.vx * target.vx + target.vy * target.vy);
      }

      rawSamples.push({
        frame: f,
        timeNorm: Math.round((f / totalFrames) * 100 * 10) / 10,
        val: Math.round(val * 10) / 10,
      });

      // Advance physics simulation
      const res = UniversalPhysicsEngine.stepSimulation(currentBodies, constraints, world, dt);
      currentBodies = res.bodies;
    }

    // Adaptive sampling: sample every 3 frames and all local extrema / bounces
    const bakedKeyframes: KeyframePoint[] = [];

    rawSamples.forEach((sample, idx) => {
      const isStart = idx === 0;
      const isEnd = idx === rawSamples.length - 1;
      const isPeriodic = idx % 4 === 0;

      // Local Extrema Detection (Bounce peak or floor contact)
      let isExtremum = false;
      if (idx > 0 && idx < rawSamples.length - 1) {
        const prev = rawSamples[idx - 1].val;
        const curr = sample.val;
        const next = rawSamples[idx + 1].val;
        if ((curr >= prev && curr > next) || (curr <= prev && curr < next)) {
          isExtremum = true;
        }
      }

      if (isStart || isEnd || isPeriodic || isExtremum) {
        bakedKeyframes.push({
          id: 9900 + idx,
          time: sample.timeNorm,
          value: sample.val,
          type: 'bezier',
          handleIn: { x: 0.2, y: sample.val },
          handleOut: { x: 0.2, y: sample.val },
        });
      }
    });

    return bakedKeyframes;
  }
}
