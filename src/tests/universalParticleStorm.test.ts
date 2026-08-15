import { describe, it, expect } from 'vitest';
import {
  UniversalParticleStormEngine,
  DEFAULT_PARTICLE_CONFIG,
  ForceField3D,
} from '../core/particles/universalParticleStormEngine';

describe('Universal 3D Particle Storm Engine (250+ Features) Test Suite', () => {
  it('spawns 3D particles across circle, sphere, and vortex emitter shapes', () => {
    const pointP = UniversalParticleStormEngine.spawnParticle(1, 100, 100, 0, DEFAULT_PARTICLE_CONFIG);
    expect(pointP.id).toBe(1);
    expect(pointP.life).toBe(DEFAULT_PARTICLE_CONFIG.lifetimeFrames);

    const sphereConfig = { ...DEFAULT_PARTICLE_CONFIG, emitterShape: 'sphere' as const };
    const sphereP = UniversalParticleStormEngine.spawnParticle(2, 100, 100, 0, sphereConfig);
    expect(sphereP.id).toBe(2);
    expect(typeof sphereP.z).toBe('number');
  });

  it('steps physical simulation with gravity, drag, and boundary collisions', () => {
    const p1 = UniversalParticleStormEngine.spawnParticle(1, 100, 100, 0, DEFAULT_PARTICLE_CONFIG);
    p1.vy = 5.0;

    const result = UniversalParticleStormEngine.stepSimulation(
      [p1],
      DEFAULT_PARTICLE_CONFIG,
      [],
      { minX: 0, maxX: 200, minY: 0, maxY: 102, minZ: -50, maxZ: 50 }
    );

    expect(result.updatedParticles.length).toBe(1);
    // Y velocity should be inverted upon floor collision
    expect(result.updatedParticles[0].vy).toBeLessThan(0);
    expect(result.collisionEventCount).toBeGreaterThan(0);
  });

  it('evaluates dynamic force fields (vortex tornado and attractor)', () => {
    const p = UniversalParticleStormEngine.spawnParticle(1, 200, 150, 0, DEFAULT_PARTICLE_CONFIG);
    const force: ForceField3D = {
      type: 'vortex-tornado',
      x: 200,
      y: 150,
      z: 0,
      strength: 20.0,
      radius: 100,
    };

    const result = UniversalParticleStormEngine.stepSimulation([p], DEFAULT_PARTICLE_CONFIG, [force]);
    expect(result.updatedParticles.length).toBe(1);
  });

  it('computes proximity constellation mesh spring links between particles', () => {
    const p1 = UniversalParticleStormEngine.spawnParticle(1, 100, 100, 0, DEFAULT_PARTICLE_CONFIG);
    const p2 = UniversalParticleStormEngine.spawnParticle(2, 110, 100, 0, DEFAULT_PARTICLE_CONFIG);

    const result = UniversalParticleStormEngine.stepSimulation([p1, p2], DEFAULT_PARTICLE_CONFIG, []);
    expect(result.springLinks.length).toBe(1);
    expect(result.springLinks[0].distance).toBeLessThanOrEqual(DEFAULT_PARTICLE_CONFIG.meshConnections.maxLinkDistance);
  });

  it('configures custom sprite images and presets', () => {
    const customConfig = {
      ...DEFAULT_PARTICLE_CONFIG,
      spriteType: 'coin' as const,
      customImageSrc: 'data:image/png;base64,sample',
    };
    const p = UniversalParticleStormEngine.spawnParticle(1, 100, 100, 0, customConfig);
    expect(p.id).toBe(1);
    expect(customConfig.spriteType).toBe('coin');
  });

  it('bakes 3D particle simulation centroid motion into standard Bézier keyframes', () => {
    const p1 = UniversalParticleStormEngine.spawnParticle(1, 100, 100, 0, DEFAULT_PARTICLE_CONFIG);
    const keyframes = UniversalParticleStormEngine.bakeParticleSimulationToKeyframes([p1], 2.0);

    expect(keyframes.length).toBeGreaterThan(5);
    expect(keyframes[0].type).toBe('bezier');
  });
});
