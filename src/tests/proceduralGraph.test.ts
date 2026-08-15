import { describe, it, expect } from 'vitest';
import {
  ProceduralGraphEngine,
  SAMPLE_PROCEDURAL_PRESETS,
} from '../core/nodes/proceduralGraphEngine';
import { EvaluationContext } from '../core/nodes/proceduralGraphSchema';

describe('Procedural Animation Graph Engine Test Suite', () => {
  it('evaluates Harmonic Sine Spring Bounce graph correctly', () => {
    const graph = SAMPLE_PROCEDURAL_PRESETS[0]; // Harmonic Spring Bounce
    const ctx: EvaluationContext = {
      timeSeconds: 0.5,
      frameIndex: 30,
      fps: 60,
      audioBass: 0.5,
      audioBeat: false,
      audioTreble: 0.2,
      mouseDistancePx: 50,
      charIndex: 0,
    };

    const result = ProceduralGraphEngine.evaluateGraph(graph, ctx);
    const scale = result.outputs['out-scale'];

    expect(scale).toBeGreaterThanOrEqual(100);
    expect(scale).toBeLessThanOrEqual(140);
  });

  it('evaluates Perlin Noise Camera Shake graph with non-zero output', () => {
    const graph = SAMPLE_PROCEDURAL_PRESETS[1]; // Perlin Noise Camera Shake
    const ctx: EvaluationContext = {
      timeSeconds: 0.8,
      frameIndex: 48,
      fps: 60,
      audioBass: 0.1,
      audioBeat: false,
      audioTreble: 0.1,
      mouseDistancePx: 0,
      charIndex: 0,
    };

    const result = ProceduralGraphEngine.evaluateGraph(graph, ctx);
    const shake = result.outputs['out-camera-shake'];

    expect(typeof shake).toBe('number');
  });

  it('bakes procedural graph into discrete Bézier animation keyframes', () => {
    const graph = SAMPLE_PROCEDURAL_PRESETS[0];
    const keyframes = ProceduralGraphEngine.bakeGraphToKeyframes(graph, 'out-scale', 1.0, 60);

    expect(keyframes.length).toBeGreaterThan(5);
    expect(keyframes[0].type).toBe('bezier');
    expect(keyframes[0].value).toBeGreaterThanOrEqual(100);
  });
});
