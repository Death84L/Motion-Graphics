import { describe, it, expect } from 'vitest';
import { ZeroCutoffEngine } from '../core/social/zeroCutoffEngine';
import { PanoramicSweepEngine } from '../core/social/panoramicSweepEngine';

describe('Zero-Cutoff & Panoramic Sweep Engine Test Suite', () => {
  it('solves 100% zero-cutoff geometry for 16:9 to 9:16 vertical conversion', () => {
    const geo = ZeroCutoffEngine.solveZeroCutoffGeometry({
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetWidth: 202,
      targetHeight: 360,
      mockupType: 'glass-smartphone',
    });

    expect(geo.cutoffPercentage).toBe(0);
    expect(geo.contentWidth).toBeLessThanOrEqual(202);
    expect(geo.contentHeight).toBeLessThanOrEqual(360);
    expect(geo.paddingTop).toBeGreaterThan(0);
    expect(geo.mockupFrameStyle?.borderRadius).toBe(24);
    expect(geo.blurBackdropStyle.blurRadius).toBe(30);
  });

  it('solves reverse pillar infill for 9:16 vertical to 16:9 widescreen conversion', () => {
    const pillar = ZeroCutoffEngine.solveReversePillarInfill(1080, 1920, 1920, 1080);

    expect(pillar.centerVideoHeight).toBe(1080);
    expect(pillar.centerVideoWidth).toBe(608);
    expect(pillar.leftPillarWidth).toBe(656);
    expect(pillar.rightPillarWidth).toBe(656);
    expect(pillar.pillarBlurRadius).toBe(32);
  });

  it('generates continuous panoramic sweep keyframes covering 100% of wide footage', () => {
    const sweep = PanoramicSweepEngine.generatePanoramicSweepKeyframes({
      durationSec: 15.0,
      sourceWidth: 1920,
      sourceHeight: 1080,
      targetWidth: 608,
      subjects: [
        { id: '1', name: 'Host', normalizedX: 0.2, dwellTimeSec: 3.0 },
        { id: '2', name: 'Guest', normalizedX: 0.8, dwellTimeSec: 3.0 },
      ],
      sweepMode: 'speed-ramped-dwell',
    });

    expect(sweep.coveragePercent).toBe(100);
    expect(sweep.totalPansCount).toBe(5);
    expect(sweep.panKeyframes[0].value).toBe(0);
    expect(sweep.panKeyframes[sweep.panKeyframes.length - 1].value).toBe(1312);
  });
});
