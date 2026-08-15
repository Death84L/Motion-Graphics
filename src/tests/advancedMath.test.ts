import { describe, it, expect } from 'vitest';
import { AdvancedCalculusEngine } from '../core/math/advancedCalculusEngine';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Advanced Calculus & Numerical Integration Test Suite', () => {
  it('solves harmonic oscillator ODE via RK4 integration accurately', () => {
    // dy/dt = -y (exponential decay dy/dt = -y -> y(t) = y0 * e^-t)
    const res = AdvancedCalculusEngine.rk4Integrate((t, y) => -y, 100, 0, 1.0, 50);
    expect(res.values.length).toBe(51);
    expect(res.values[0]).toBe(100);
    // At t = 1, e^-1 = ~0.3678 -> 36.8
    const finalVal = res.values[res.values.length - 1];
    expect(finalVal).toBeGreaterThan(35);
    expect(finalVal).toBeLessThan(38);
  });

  it('converts Catmull-Rom control points into cubic Bézier handles', () => {
    const p0 = { x: 0, y: 0 };
    const p1 = { x: 10, y: 50 };
    const p2 = { x: 20, y: 80 };
    const p3 = { x: 30, y: 100 };

    const bez = AdvancedCalculusEngine.catmullRomToBezier(p0, p1, p2, p3);
    expect(bez.start).toEqual(p1);
    expect(bez.end).toEqual(p2);
    expect(bez.control1.x).toBeGreaterThan(p1.x);
    expect(bez.control2.x).toBeLessThan(p2.x);
  });

  it('generates blue-noise Poisson disc sampling points without clustering', () => {
    const pts = AdvancedCalculusEngine.generatePoissonDiscPoints(400, 400, 40, 20);
    expect(pts.length).toBeGreaterThan(10);
    // Verify distance between any pair is >= minRadius
    for (let i = 0; i < Math.min(20, pts.length); i++) {
      for (let j = i + 1; j < Math.min(20, pts.length); j++) {
        const dist = Math.sqrt(Math.pow(pts[i].x - pts[j].x, 2) + Math.pow(pts[i].y - pts[j].y, 2));
        expect(dist).toBeGreaterThanOrEqual(38); // With small numerical epsilon
      }
    }
  });

  it('filters noise using Bilateral filter while preserving sharp edges', () => {
    const noisySignal = [0, 2, -1, 1, 100, 98, 102, 99];
    const filtered = AdvancedCalculusEngine.bilateralFilterCurve(noisySignal, 1.5, 20);
    expect(filtered.length).toBe(noisySignal.length);
    // Step edge around index 4 should be preserved
    expect(filtered[3]).toBeLessThan(20);
    expect(filtered[4]).toBeGreaterThan(80);
  });
});
