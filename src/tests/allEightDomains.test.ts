import { describe, it, expect } from 'vitest';
import { InfographicsEngine } from '../core/charts/infographicsEngine';
import { SAMPLE_CHART_DATA } from '../core/charts/chartSchema';
import { ParticleStormEngine } from '../core/particles/particleStormEngine';
import { SmartRotoEngine } from '../core/roto/smartRotoEngine';
import { PlanarCornerPinEngine } from '../core/matchmove/planarCornerPinEngine';
import { SpeechToMotionEngine } from '../core/speech/speechToMotionEngine';
import { ViralReframeEngine } from '../core/social/viralReframeEngine';
import { MotionPackageEngine, SAMPLE_PACKAGES } from '../core/packages/motionPackageEngine';

describe('8 Flagship Next-Gen Domains Test Suite', () => {
  it('Domain 1: InfographicsEngine evaluates racing bar ranks accurately', () => {
    const bars = InfographicsEngine.evaluateBars(SAMPLE_CHART_DATA, 0.8, false);
    expect(bars.length).toBe(SAMPLE_CHART_DATA.length);
    expect(bars[0].currentValue).toBeGreaterThan(0);
    // Highest value item should have rank 0
    const highest = bars.reduce((max, b) => (b.currentValue > max.currentValue ? b : max), bars[0]);
    expect(highest.rank).toBe(0);
  });

  it('Domain 2: ParticleStormEngine advances 60FPS simulation step', () => {
    const particles = ParticleStormEngine.spawnParticles('sparks-embers', 20, 400, 300);
    expect(particles.length).toBe(20);
    const stepped = ParticleStormEngine.stepSimulation(particles, 400, 300, 0.05);
    expect(stepped.length).toBe(20);
    expect(stepped[0].life).toBeLessThan(particles[0].life);
  });

  it('Domain 3: SmartRotoEngine generates closed SVG polygon mask path', () => {
    const points = [{ x: 10, y: 10 }, { x: 50, y: 10 }, { x: 50, y: 50 }, { x: 10, y: 50 }];
    const path = SmartRotoEngine.generateMaskSvgPath(points);
    expect(path).toContain('M 10.0 10.0');
    expect(path).toContain('Z');
  });

  it('Domain 4: PlanarCornerPinEngine formats polygon points string', () => {
    const corners = {
      topLeft: { x: 10, y: 20 },
      topRight: { x: 100, y: 25 },
      bottomRight: { x: 95, y: 80 },
      bottomLeft: { x: 15, y: 75 },
    };
    const poly = PlanarCornerPinEngine.getPolygonPoints(corners);
    expect(poly).toBe('10,20 100,25 95,80 15,75');
  });

  it('Domain 5: SpeechToMotionEngine generates timed word sequence', () => {
    const words = SpeechToMotionEngine.generateTimedTranscript('Hello world motion design studio', 4.0);
    expect(words.length).toBe(5);
    expect(words[0].startSec).toBe(0);
    expect(words[words.length - 1].endSec).toBeCloseTo(3.9, 1);
  });

  it('Domain 6: ViralReframeEngine computes 9:16 vertical crop bounds', () => {
    const box = ViralReframeEngine.computeReframeBox(1920, 1080, 960, '9:16-reels');
    // Height is 1080, Width is (1080 * 9)/16 = 607.5 -> 608
    expect(box.height).toBe(1080);
    expect(box.width).toBeCloseTo(608, 1);
    expect(box.x).toBeGreaterThan(0);
  });

  it('Domain 7: MotionPackageEngine serializes and deserializes .motionpkg', () => {
    const pkg = SAMPLE_PACKAGES[0];
    const jsonStr = MotionPackageEngine.exportPackage(pkg);
    const imported = MotionPackageEngine.importPackage(jsonStr);
    expect(imported).not.toBeNull();
    expect(imported?.id).toBe(pkg.id);
    expect(imported?.name).toBe(pkg.name);
  });
});
