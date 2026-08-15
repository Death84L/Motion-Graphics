import { describe, it, expect } from 'vitest';
import { ExtendedVfxEngine } from '../core/vfx/extendedVfxEngine';

describe('VFX Shaders, Optics & Glitch Test Suite', () => {
  it('evaluates multi-element anamorphic lens flare geometry', () => {
    const flare = ExtendedVfxEngine.evaluateLensFlare(150, 120, 480, 320, 1.2, '#38bdf8');
    expect(flare.length).toBeGreaterThan(5);

    const hotspot = flare.find((el) => el.type === 'core-hotspot');
    expect(hotspot).toBeDefined();
    expect(hotspot?.x).toBe(150);
    expect(hotspot?.y).toBe(120);

    const streak = flare.find((el) => el.type === 'horizontal-streak');
    expect(streak).toBeDefined();
    expect(streak?.size).toBeGreaterThan(200);
  });

  it('evaluates digital glitch scanline displacement bands', () => {
    const bands = ExtendedVfxEngine.evaluateGlitchBands(1.0, 320, 0.8);
    expect(bands.length).toBeGreaterThan(0);
    expect(bands[0].height).toBeGreaterThan(0);
    expect(typeof bands[0].shiftX).toBe('number');
  });

  it('generates jagged lightning electrical arc points between coordinates', () => {
    const arc = ExtendedVfxEngine.generateLightningArc(10, 10, 100, 100, 10, 15);
    expect(arc.length).toBe(11);
    expect(arc[0]).toEqual({ x: 10, y: 10 });
    expect(arc[arc.length - 1]).toEqual({ x: 100, y: 100 });
  });

  it('bakes VFX effect trajectories into standard Bézier keyframes', () => {
    const keyframes = ExtendedVfxEngine.bakeVfxToKeyframes('anamorphic-lens-flare', 2.0);
    expect(keyframes.length).toBeGreaterThan(5);
    expect(keyframes[0].type).toBe('bezier');
  });
});
