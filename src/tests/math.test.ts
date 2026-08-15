import { describe, it, expect } from 'vitest';
import { calculateCurveDerivatives } from '../core/math/derivativesGraphEngine';
import { simulatePhysicsTrajectory } from '../core/physics/physicsSandboxEngine';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Deterministic Math & Physics Test Suite', () => {
  it('calculates numerical derivatives (velocity dv/dt)', () => {
    const testKeyframes: KeyframePoint[] = [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 30, value: 100, type: 'bezier' },
    ];
    const derivatives = calculateCurveDerivatives(testKeyframes, 20);
    expect(derivatives.length).toBe(21);
    expect(derivatives[10].velocity).toBeGreaterThan(0);
  });

  it('integrates 2D physics restitution bounces', () => {
    const sim = simulatePhysicsTrajectory({
      gravity: 16,
      mass: 1,
      restitution: 0.7,
      friction: 0.1,
      initialVelocityY: 0,
      initialHeightPx: 200,
      floorLevelPx: 0,
      totalFrames: 60,
    });
    expect(sim.trajectory.length).toBe(61);
    expect(sim.keyframes.length).toBeGreaterThanOrEqual(2);
  });
});
