import { describe, it, expect } from 'vitest';
import { VectorEngine } from '../core/shapes/vectorEngine';
import { UniversalTypographyEngine } from '../core/typography/universalTypographyEngine';
import { KineticTypographyConfig } from '../core/typography/universalTypographySchema';

describe('Vector & Kinetic Typography Engine Test Suite', () => {
  it('generates parametric SVG path points for circle and star shapes', () => {
    const circlePoints = VectorEngine.getShapePoints('circle', 100, 100, 32);
    expect(circlePoints.length).toBe(32);

    const starPoints = VectorEngine.getShapePoints('star', 100, 100, 32);
    expect(starPoints.length).toBe(32);

    const svgPath = VectorEngine.pointsToSvgPath(circlePoints, true);
    expect(svgPath).toContain('M ');
    expect(svgPath).toContain(' Z');
  });

  it('morphs continuously between Circle and Star without vertex mismatch', () => {
    const morphedHalf = VectorEngine.morphShapes('circle', 'star', 0.5, 100, 100, 32);
    expect(morphedHalf.length).toBe(32);
    expect(typeof morphedHalf[0].x).toBe('number');
    expect(typeof morphedHalf[0].y).toBe('number');
  });

  it('evaluates kinetic typography character states with matrix scramble and wave', () => {
    const config: KineticTypographyConfig = {
      text: 'MOTION',
      fontSize: 32,
      letterSpacingPx: 4,
      lineHeightPx: 40,
      animationMode: 'kinetic-wave',
      progress: 0.5,
      staggerMs: 40,
      durationMs: 1000,
      fillColor: '#f8fafc',
      glowColor: '#38bdf8',
    };

    const states = UniversalTypographyEngine.evaluateTypography(config, 0.5);
    expect(states.length).toBe(6); // 'MOTION' has 6 chars
    expect(states[0].originalChar).toBe('M');
    // Wave mode should oscillate Y position
    expect(typeof states[0].y).toBe('number');
  });

  it('bakes kinetic typography trajectory into Bézier keyframes', () => {
    const config: KineticTypographyConfig = {
      text: 'POP',
      fontSize: 32,
      letterSpacingPx: 4,
      lineHeightPx: 40,
      animationMode: 'elastic-char-pop',
      progress: 1.0,
      staggerMs: 40,
      durationMs: 800,
      fillColor: '#f8fafc',
      glowColor: '#38bdf8',
    };

    const keyframes = UniversalTypographyEngine.bakeTypographyToKeyframes(config, 1.0, 60);
    expect(keyframes.length).toBeGreaterThan(5);
    expect(keyframes[0].type).toBe('bezier');
  });
});
