import { describe, it, expect } from 'vitest';
import { BlenderCurveEngine } from '../core/curves/blenderCurveEngine';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Blender-Style Curve Engine Test Suite', () => {
  const sampleKeyframes: KeyframePoint[] = [
    { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: 0 } },
    { id: 2, time: 50, value: 100, type: 'bezier', handleIn: { x: 0.2, y: 100 }, handleOut: { x: 0.2, y: 100 } },
    { id: 3, time: 100, value: 0, type: 'bezier', handleIn: { x: 0.2, y: 0 } },
  ];

  it('applies auto-clamped handle type to local peak extremum', () => {
    const updated = BlenderCurveEngine.applyHandleType(sampleKeyframes, [2], 'auto-clamped');
    expect(updated[1].handleIn?.y).toBe(100);
    expect(updated[1].handleOut?.y).toBe(100);
  });

  it('applies vector handles pointing directly toward adjacent keyframes', () => {
    const updated = BlenderCurveEngine.applyHandleType(sampleKeyframes, [2], 'vector');
    expect(updated[1].type).toBe('bezier');
    expect(typeof updated[1].handleIn?.y).toBe('number');
  });

  it('flips curve horizontally across time (reverse motion)', () => {
    const reversed = BlenderCurveEngine.transformCurve(sampleKeyframes, [1, 2, 3], 'flip-x', 'median');
    expect(reversed[0].time).toBe(100); // was 0
    expect(reversed[1].time).toBe(50);  // was 50
    expect(reversed[2].time).toBe(0);   // was 100
  });

  it('quantizes keyframe times to nearest integer frame', () => {
    const decimalKeys: KeyframePoint[] = [
      { id: 10, time: 24.3, value: 50, type: 'bezier' },
      { id: 11, time: 48.7, value: 80, type: 'bezier' },
    ];
    const quantized = BlenderCurveEngine.transformCurve(decimalKeys, [10, 11], 'quantize');
    expect(quantized[0].time).toBe(24);
    expect(quantized[1].time).toBe(49);
  });

  it('computes calculus derivatives and telemetry score', () => {
    const telemetry = BlenderCurveEngine.analyzeCurveTelemetry(sampleKeyframes, 60);
    expect(telemetry.durationMs).toBeGreaterThan(0);
    expect(telemetry.peakVelocity).toBeGreaterThan(0);
    expect(telemetry.smoothnessScore).toBeGreaterThanOrEqual(60);
  });

  it('simplifies redundant keyframes using Ramer-Douglas-Peucker reduction', () => {
    const denseKeys: KeyframePoint[] = [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 25, value: 25, type: 'bezier' }, // collinear point
      { id: 3, time: 50, value: 50, type: 'bezier' }, // collinear point
      { id: 4, time: 100, value: 100, type: 'bezier' },
    ];
    const simplified = BlenderCurveEngine.simplifyCurve(denseKeys, 0.5);
    expect(simplified.length).toBeLessThan(denseKeys.length);
  });
});
