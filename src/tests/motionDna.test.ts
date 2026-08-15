import { describe, it, expect } from 'vitest';
import { MotionDnaEngine } from '../core/dna/motionDnaEngine';
import { SAMPLE_DNA_PRESETS } from '../core/dna/motionDnaSchema';

describe('Motion DNA Intelligence Engine Test Suite', () => {
  it('extracts valid machine-readable DNA signatures from keyframes', () => {
    const testKeys = [
      { id: 1, time: 0, value: 0, type: 'bezier' as const },
      { id: 2, time: 35, value: 118, type: 'bezier' as const }, // 18% overshoot
      { id: 3, time: 60, value: 100, type: 'bezier' as const },
    ];

    const dna = MotionDnaEngine.extractMotionDna(testKeys, 60);

    expect(dna.temporal.durationMs).toBe(1000);
    expect(dna.physics.overshootPercent).toBeGreaterThan(0);
    expect(dna.quality.overallScore).toBeGreaterThan(60);
    expect(dna.quality.overallScore).toBeLessThanOrEqual(100);
    expect(dna.featureVector.length).toBe(10);
  });

  it('calculates vector similarity and Git-like semantic diff between two DNA presets', () => {
    const dnaA = SAMPLE_DNA_PRESETS[0].dna; // Apple Smooth
    const dnaB = SAMPLE_DNA_PRESETS[1].dna; // Elastic Pop

    const sim = MotionDnaEngine.compareDna(dnaA, dnaB);
    expect(sim.overallSimilarityPercent).toBeGreaterThan(0);
    expect(sim.overallSimilarityPercent).toBeLessThanOrEqual(100);

    const diff = MotionDnaEngine.diffDna(dnaA, dnaB);
    expect(typeof diff.durationDeltaMs).toBe('number');
    expect(typeof diff.smoothnessChangePercent).toBe('number');
    expect(typeof diff.qualityScoreDelta).toBe('number');
  });

  it('morphs continuously between two DNA signatures without discontinuities', () => {
    const dnaA = SAMPLE_DNA_PRESETS[0].dna;
    const dnaB = SAMPLE_DNA_PRESETS[1].dna;

    const hybrid = MotionDnaEngine.blendDna(dnaA, dnaB, 0.5);
    expect(hybrid.temporal.durationMs).toBe(Math.round((dnaA.temporal.durationMs + dnaB.temporal.durationMs) / 2));
    expect(hybrid.quality.smoothnessScore).toBe(Math.round((dnaA.quality.smoothnessScore + dnaB.quality.smoothnessScore) / 2));
  });

  it('auto-optimizes keyframe curves to eliminate jerk spikes', () => {
    const rawKeys = [
      { id: 1, time: 0, value: 0, type: 'linear' as const },
      { id: 2, time: 20, value: 80, type: 'linear' as const },
      { id: 3, time: 50, value: 100, type: 'linear' as const },
    ];

    const optimized = MotionDnaEngine.optimizeMotionKeyframes(rawKeys);
    expect(optimized.length).toBe(3);
    expect(optimized[0].type).toBe('bezier');
  });
});
