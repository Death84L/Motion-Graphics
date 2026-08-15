import { describe, it, expect } from 'vitest';
import { ExtendedKineticTextEngine } from '../core/typography/extendedKineticTextEngine';
import { UiMicroInteractionEngine } from '../core/ui/uiMicroInteractionEngine';

describe('Extended Typography & UI Micro-Interactions Test Suite', () => {
  it('evaluates Alex Hormozi high-contrast captions with keyword pop styling', () => {
    const states = ExtendedKineticTextEngine.evaluateExtendedStyle(
      'SCALE YOUR MOTION',
      'alex-hormozi',
      0.5,
      36,
      0.5
    );

    expect(states.length).toBe('SCALE YOUR MOTION'.length);
    // First word 'SCALE' should have yellow highlight color
    expect(states[0].color).toBe('#facc15');
    expect(states[0].fontWeight).toBeGreaterThanOrEqual(900);
  });

  it('evaluates Liquid Molten Chrome wave displacement and specular styling', () => {
    const states = ExtendedKineticTextEngine.evaluateExtendedStyle(
      'CHROME',
      'liquid-chrome',
      1.0,
      36,
      0.2
    );

    expect(states.length).toBe(6);
    expect(states[0].shadow).toContain('rgba(255, 255, 255');
    expect(typeof states[0].y).toBe('number');
  });

  it('calculates Dynamic Island squircle expansion dimensions smoothly', () => {
    const compact = UiMicroInteractionEngine.evaluateDynamicIsland(0.0);
    expect(compact.width).toBe(120);
    expect(compact.height).toBe(36);

    const expanded = UiMicroInteractionEngine.evaluateDynamicIsland(1.0);
    expect(expanded.width).toBe(340);
    expect(expanded.height).toBe(160);
  });

  it('calculates fluid clamp() font-size formula correctly', () => {
    const clampFormula = UiMicroInteractionEngine.calculateFluidFontSize(20, 48, 375, 1920);
    expect(clampFormula).toContain('clamp(20px,');
    expect(clampFormula).toContain('48px)');
    expect(clampFormula).toContain('vw');
  });

  it('generates valid neumorphic dual shadow CSS strings', () => {
    const flatShadow = UiMicroInteractionEngine.getNeumorphicShadow(8, false);
    expect(flatShadow).toContain('8px 8px 16px');

    const insetShadow = UiMicroInteractionEngine.getNeumorphicShadow(4, true);
    expect(insetShadow).toContain('inset 4px 4px 8px');
  });
});
