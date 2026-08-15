export class VfxShaderPipeline {
  /**
   * Procedural 2D Curl Noise Evaluator (Divergence-Free fluid vortex vector field)
   * Solves: Curl(F) = (dF_y/dx - dF_x/dy)
   */
  static getCurlNoise(x: number, y: number, time = 0, scale = 0.02): { vx: number; vy: number } {
    const eps = 0.001;
    const nx = x * scale;
    const ny = y * scale;

    // Potential function psi(x, y)
    const psi = (px: number, py: number) =>
      Math.sin(px + time) * Math.cos(py - time * 0.5) + Math.sin(px * 2.1 + py * 1.7 + time * 0.8) * 0.5;

    const dPsiDy = (psi(nx, ny + eps) - psi(nx, ny - eps)) / (2 * eps);
    const dPsiDx = (psi(nx + eps, ny) - psi(nx - eps, ny)) / (2 * eps);

    return {
      vx: dPsiDy * 50,
      vy: -dPsiDx * 50,
    };
  }

  /**
   * Chromatic Aberration RGB Channel Offset Simulator
   */
  static applyChromaticAberration(
    x: number,
    y: number,
    offsetPx = 4
  ): {
    rPos: { x: number; y: number };
    gPos: { x: number; y: number };
    bPos: { x: number; y: number };
  } {
    return {
      rPos: { x: x - offsetPx, y },
      gPos: { x, y },
      bPos: { x: x + offsetPx, y },
    };
  }

  /**
   * CRT / VHS Scanline & Beam Flicker Synthesizer
   */
  static evaluateCrtScanline(
    y: number,
    timeSeconds: number,
    scanlinePitch = 4
  ): { intensityMultiplier: number; isBeamFlicker: boolean } {
    const scanline = Math.sin((y / scanlinePitch) * Math.PI) * 0.5 + 0.5;
    const beamFlicker = Math.sin(timeSeconds * 120) * 0.05;
    const mult = Math.max(0.65, Math.min(1.0, 0.85 + scanline * 0.15 + beamFlicker));

    return {
      intensityMultiplier: mult,
      isBeamFlicker: Math.abs(beamFlicker) > 0.04,
    };
  }

  /**
   * Optical Anamorphic Lens Flare Generator
   * Generates horizontal blue streak flare coordinates and intensity based on point lights.
   */
  static generateAnamorphicStreak(
    lightX: number,
    lightY: number,
    canvasWidth: number,
    streakWidth = 180,
    intensity = 1.0
  ): { startX: number; endX: number; y: number; opacity: number; color: string } {
    const startX = Math.max(0, lightX - streakWidth);
    const endX = Math.min(canvasWidth, lightX + streakWidth);

    return {
      startX,
      endX,
      y: lightY,
      opacity: Math.max(0, Math.min(1, intensity * 0.8)),
      color: '#38bdf8', // Classic anamorphic horizontal blue streak
    };
  }
}
