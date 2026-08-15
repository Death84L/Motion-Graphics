import { describe, it, expect } from 'vitest';
import { ColorScienceEngine } from '../core/color/colorScienceEngine';
import { VfxShaderPipeline } from '../core/vfx/vfxShaderPipeline';
import { FoleySynthesisEngine } from '../core/audio/foleySynthesisEngine';
import { LocalProceduralAssistant } from '../core/ai/localProceduralAssistant';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Color Science, VFX, Audio & Local AI Test Suite', () => {
  it('applies 3-way color wheels lift/gamma/gain', () => {
    const res = ColorScienceEngine.applyColorWheels(128, 128, 128, {
      lift: { r: 0.1, g: 0, b: 0, luma: 0 },
      gamma: { r: 1.0, g: 1.0, b: 1.0, luma: 1.0 },
      gain: { r: 1.2, g: 1.0, b: 1.0, luma: 1.0 },
      offset: { r: 0, g: 0, b: 0, luma: 0 },
    });
    expect(res.r).toBeGreaterThan(res.g);
  });

  it('generates Adobe/DaVinci .cube 3D LUT string', () => {
    const cubeStr = ColorScienceEngine.generate3dCubeLut(5, 'Test_Lut', (r, g, b) => ({ r, g, b }));
    expect(cubeStr).toContain('TITLE "Test_Lut"');
    expect(cubeStr).toContain('LUT_3D_SIZE 5');
  });

  it('evaluates curl noise divergence-free vectors', () => {
    const curl = VfxShaderPipeline.getCurlNoise(100, 100, 1.0);
    expect(typeof curl.vx).toBe('number');
    expect(typeof curl.vy).toBe('number');
  });

  it('calculates automatic audio ducking multiplier based on voiceover level', () => {
    const quietDucking = FoleySynthesisEngine.calculateDuckingMultiplier(0.05);
    expect(quietDucking).toBe(1.0); // No ducking when quiet

    const loudDucking = FoleySynthesisEngine.calculateDuckingMultiplier(0.4);
    expect(loudDucking).toBeLessThan(1.0); // Duck background audio when loud
  });

  it('polishes keyframes with anticipation wind-up and physical overshoot', () => {
    const rawKeys: KeyframePoint[] = [
      { id: 1, time: 0, value: 0, type: 'bezier' },
      { id: 2, time: 100, value: 500, type: 'bezier' },
    ];
    const polished = LocalProceduralAssistant.polishMotionKeyframes(rawKeys);
    expect(polished.length).toBeGreaterThan(rawKeys.length);
    // Should contain anticipation key (negative value)
    const anticipationKey = polished.find((k) => k.value < 0);
    expect(anticipationKey).toBeDefined();
  });
});
