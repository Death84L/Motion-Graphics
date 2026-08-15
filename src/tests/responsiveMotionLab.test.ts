import { describe, it, expect } from 'vitest';
import { ResponsiveMotionLabEngine } from '../core/responsive/responsiveMotionLabEngine';
import { DEVICE_PROFILES } from '../core/responsive/responsiveMotionSchema';

describe('Responsive Motion Lab Engine Test Suite', () => {
  it('evaluates Level 5 Semantic Intent motion across desktop and mobile', () => {
    // Desktop Evaluation (1920x1080)
    const desktopRes = ResponsiveMotionLabEngine.evaluateResponsiveMotion(
      1920,
      1080,
      400,
      120,
      1.0,
      800,
      'level5-semantic',
      { mode: 'dock-edge-right', edgeMarginPx: 24 },
      DEVICE_PROFILES['desktop-hd']
    );

    // Mobile Evaluation (390x844 iPhone)
    const mobileRes = ResponsiveMotionLabEngine.evaluateResponsiveMotion(
      390,
      844,
      400,
      120,
      1.0,
      800,
      'level5-semantic',
      { mode: 'dock-edge-right', edgeMarginPx: 24 },
      DEVICE_PROFILES['mobile-portrait']
    );

    // Desktop duration should be longer (~800ms) than mobile duration (~420-500ms)
    expect(desktopRes.adaptedDurationMs).toBeGreaterThan(mobileRes.adaptedDurationMs);
    // Mobile position X should be within mobile bounds (< 390px)
    expect(mobileRes.adaptedPositionX).toBeLessThanOrEqual(390);
  });

  it('detects top and bottom safe area violations on mobile devices', () => {
    const iphoneProfile = DEVICE_PROFILES['mobile-portrait']; // Top safe area = 47px

    // Position Y = 10px overlaps with the 47px Dynamic Island/Notch
    const violationRes = ResponsiveMotionLabEngine.evaluateResponsiveMotion(
      390,
      844,
      100,
      10, // Overlaps notch
      1.0,
      600,
      'level1-fixed',
      undefined,
      iphoneProfile
    );

    expect(violationRes.isInsideSafeArea).toBe(false);
    expect(violationRes.safeAreaViolationMessage).toContain('Top Safe-Area violation');
  });

  it('generates valid responsive CSS media queries with reduced motion accessibility', () => {
    const css = ResponsiveMotionLabEngine.generateResponsiveCss([]);
    expect(css).toContain('@media (max-width: 1024px)');
    expect(css).toContain('@media (max-width: 640px)');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
