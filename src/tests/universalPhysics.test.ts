import { describe, it, expect } from 'vitest';
import {
  UniversalPhysicsEngine,
  SAMPLE_PHYSICS_PRESETS,
} from '../core/physics/universalPhysicsEngine';
import { PhysicsKeyframeBaker } from '../core/physics/physicsKeyframeBaker';

describe('Universal Physics Simulation Engine Test Suite', () => {
  it('advances multi-body simulation and resolves gravity & floor collisions', () => {
    const preset = SAMPLE_PHYSICS_PRESETS[0]; // Bouncy rubber balls
    const initialY = preset.bodies[0].y;

    const res = UniversalPhysicsEngine.stepSimulation(
      preset.bodies,
      preset.constraints,
      preset.world,
      1 / 60
    );

    // Gravity should pull bodies downwards
    expect(res.bodies[0].y).toBeGreaterThan(initialY);
    expect(res.telemetry.kineticEnergy).toBeGreaterThan(0);
    expect(res.telemetry.totalMomentum).toBeGreaterThan(0);
  });

  it('solves spring constraints between connected bodies in soft jelly mesh', () => {
    const jellyPreset = SAMPLE_PHYSICS_PRESETS[1]; // Soft Jelly Blob
    const res = UniversalPhysicsEngine.stepSimulation(
      jellyPreset.bodies,
      jellyPreset.constraints,
      jellyPreset.world,
      1 / 60
    );

    expect(res.bodies.length).toBe(4);
    // Bodies should remain linked within spring rest lengths
    const dx = res.bodies[1].x - res.bodies[0].x;
    const dy = res.bodies[1].y - res.bodies[0].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    expect(dist).toBeGreaterThan(40);
    expect(dist).toBeLessThan(90);
  });

  it('bakes physical simulation trajectory into optimized Bézier keyframes', () => {
    const preset = SAMPLE_PHYSICS_PRESETS[0];
    const keyframes = PhysicsKeyframeBaker.bakeSimulationToKeyframes(
      preset.bodies,
      preset.constraints,
      preset.world,
      preset.bodies[0].id,
      'y',
      1.5,
      60
    );

    expect(keyframes.length).toBeGreaterThan(3);
    expect(keyframes[0].type).toBe('bezier');
    expect(keyframes[0].time).toBe(0);
  });
});
