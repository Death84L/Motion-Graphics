import { describe, it, expect } from 'vitest';
import { Universal3dCameraEngine } from '../core/scene3d/universal3dCameraEngine';
import { UniversalTransitionsEngine } from '../core/transitions/universalTransitionsEngine';

describe('3D Camera, Parallax & Universal Transitions Test Suite', () => {
  it('calculates 3D camera FOV accurately based on focal length', () => {
    // 50mm on 36mm sensor -> FOV ~ 39.6 deg
    const fov50 = Universal3dCameraEngine.calculateFovDegrees(50, 36);
    expect(fov50).toBeGreaterThan(38);
    expect(fov50).toBeLessThan(42);

    // 24mm wide angle -> FOV ~ 73.7 deg
    const fov24 = Universal3dCameraEngine.calculateFovDegrees(24, 36);
    expect(fov24).toBeGreaterThan(70);
  });

  it('evaluates Dolly Zoom (Vertigo Effect) camera distance and focal length', () => {
    const vertigo = Universal3dCameraEngine.evaluateDollyZoom(0.5, 500, 24, 85);
    expect(vertigo.focalLength).toBeGreaterThan(24);
    expect(vertigo.focalLength).toBeLessThan(85);
    expect(vertigo.cameraZ).toBeGreaterThan(500);
  });

  it('evaluates Directional Wipe transition progress', () => {
    const start = UniversalTransitionsEngine.evaluateTransition('directional-wipe', 0.0, 1920, 1080);
    expect(start.wipeX).toBe(0);

    const end = UniversalTransitionsEngine.evaluateTransition('directional-wipe', 1.0, 1920, 1080);
    expect(end.wipeX).toBe(1920);
  });

  it('neutralizes green screen color spill on actor RGB pixels', () => {
    // R=100, G=220 (spill), B=100 -> Max allowed G is (100+100)/2 = 100
    const despilled = UniversalTransitionsEngine.applyColorDespill(100, 220, 100, true);
    expect(despilled.g).toBe(100);
    expect(despilled.r).toBe(100);
    expect(despilled.b).toBe(100);
  });
});
