import { describe, it, expect } from 'vitest';
import { ExtendedParticleEcosystem, BoidAgent3D, MagneticDipoleField } from '../core/particles/extendedParticleEcosystem';

describe('Extended Particle Ecosystem & 150+ Features Test Suite', () => {
  it('generates 3D Spiral DNA Double-Helix coordinates', () => {
    const { strandA, strandB } = ExtendedParticleEcosystem.generateDnaHelixPositions(30, 40, 200, 2);
    expect(strandA.length).toBe(30);
    expect(strandB.length).toBe(30);
    expect(typeof strandA[0].x).toBe('number');
    expect(typeof strandA[0].z).toBe('number');
    expect(strandA[0].y).toBeLessThan(strandA[strandA.length - 1].y);
  });

  it('generates Fibonacci spherical lattice points', () => {
    const sphere = ExtendedParticleEcosystem.generateFibonacciSpherePoints(50, 60);
    expect(sphere.length).toBe(50);
    expect(typeof sphere[0].x).toBe('number');
    expect(typeof sphere[0].y).toBe('number');
    expect(typeof sphere[0].z).toBe('number');
  });

  it('solves Craig Reynolds 3D Boids flocking kinematics (Separation, Alignment, Cohesion)', () => {
    const boids: BoidAgent3D[] = [
      { id: 1, x: 100, y: 100, z: 0, vx: 2, vy: 0, vz: 0, maxSpeed: 4, maxForce: 0.2, neighborRadius: 50, separationRadius: 20 },
      { id: 2, x: 105, y: 100, z: 0, vx: 2, vy: 0, vz: 0, maxSpeed: 4, maxForce: 0.2, neighborRadius: 50, separationRadius: 20 },
    ];

    const updated = ExtendedParticleEcosystem.stepBoidsFlock(boids, { x: 200, y: 100, z: 0 });
    expect(updated.length).toBe(2);
    expect(updated[0].vx).toBeDefined();
  });

  it('evaluates Magnetic Dipole Vector Field forces', () => {
    const dipole: MagneticDipoleField = {
      north: { x: 100, y: 100, z: 0 },
      south: { x: 200, y: 100, z: 0 },
      intensity: 500,
    };

    const force = ExtendedParticleEcosystem.evaluateMagneticDipoleField({ x: 150, y: 100, z: 0 }, dipole);
    expect(typeof force.fx).toBe('number');
    expect(typeof force.fy).toBe('number');
  });

  it('computes Inter-System Modulations (Collision Trauma, Velocity Blur, Audio Multiplier)', () => {
    const sampleParticles = [
      { x: 100, y: 100, z: 0, vx: 10, vy: 5, vz: 0 },
      { x: 200, y: 200, z: 0, vx: 8, vy: -4, vz: 0 },
    ];

    const mod = ExtendedParticleEcosystem.computeInterSystemModulations(sampleParticles, 4, 0.8);
    expect(mod.cameraShakeTrauma).toBeGreaterThan(0.5);
    expect(mod.motionBlurAmountPx).toBeGreaterThan(5);
    expect(mod.audioEmissionMultiplier).toBeGreaterThan(2.0);
    expect(mod.activeClusterCentroid.x).toBe(150);
  });
});
