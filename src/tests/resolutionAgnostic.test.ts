import { describe, it, expect } from 'vitest';
import { ResolutionIndependentSolver, MasterReframeProject, RenderProfile } from '../core/social/resolutionAgnosticProject';
import { AutoCutawayBrollDetector } from '../core/social/autoCutawayBrollDetector';
import { ConstraintLayoutSolver } from '../core/social/constraintLayoutSolver';

describe('Resolution-Independent Master Project & Constraint Engine Test Suite', () => {
  it('creates a normalized resolution-agnostic master project with persistent entity IDs', () => {
    const proj: MasterReframeProject = ResolutionIndependentSolver.createDefaultMasterProject(1920, 1080, 15.0);

    expect(proj.schemaVersion).toBe('2.0.0-semantic-agnostic');
    expect(proj.entities.length).toBe(2);
    expect(proj.entities[0].id).toBe('entity_primary_speaker');
    expect(proj.entities[0].trajectory[0].u).toBe(0.35); // Normalized (0.0 to 1.0)
    expect(proj.constraints.length).toBeGreaterThan(0);
  });

  it('resolves master project to 9:16 vertical render profile without manual re-keying', () => {
    const proj = ResolutionIndependentSolver.createDefaultMasterProject(1920, 1080, 15.0);
    const profile916: RenderProfile = {
      format: '9:16-reels',
      platform: 'tiktok',
      targetWidth: 270,
      targetHeight: 480,
      fitMode: 'smart-ambient-fit',
      depthIntensity: 1.0,
    };

    const solved = ResolutionIndependentSolver.resolveToViewport(proj, profile916);
    expect(solved.cutoffPercentage).toBe(0);
    expect(solved.cameraPanKeyframes.length).toBe(3);
    expect(solved.hookBannerPlacement.width).toBe(250);
  });

  it('resolves master project to 1:1 square render profile with zero data loss', () => {
    const proj = ResolutionIndependentSolver.createDefaultMasterProject(1920, 1080, 15.0);
    const profile11: RenderProfile = {
      format: '1:1-square',
      platform: 'instagram-reels',
      targetWidth: 380,
      targetHeight: 380,
      fitMode: 'smart-ambient-fit',
      depthIntensity: 1.0,
    };

    const solved = ResolutionIndependentSolver.resolveToViewport(proj, profile11);
    expect(solved.renderProfile.targetWidth).toBe(380);
    expect(solved.cameraPanKeyframes[0].value).toBeGreaterThanOrEqual(0);
  });

  it('applies non-destructive user override deltas on top of auto path', () => {
    let proj = ResolutionIndependentSolver.createDefaultMasterProject(1920, 1080, 15.0);
    proj = ResolutionIndependentSolver.applyUserOverrideDelta(proj, 0.0, 0.05, 0.0, 0.1);

    expect(proj.overrideDeltas.length).toBe(1);
    expect(proj.overrideDeltas[0].deltaU).toBe(0.05);

    // Resolving again incorporates the nudge
    const profile: RenderProfile = {
      format: '9:16-reels',
      platform: 'tiktok',
      targetWidth: 270,
      targetHeight: 480,
      fitMode: 'smart-ambient-fit',
      depthIntensity: 1.0,
    };
    const resolved = ResolutionIndependentSolver.resolveToViewport(proj, profile);
    expect(resolved.cameraPanKeyframes[0].value).toBeGreaterThan(0);
  });

  it('detects static talking head stretches for B-roll cutaway insertion', () => {
    const candidates = AutoCutawayBrollDetector.detectCutawayCandidates(15.0);
    expect(candidates.length).toBe(2);
    expect(candidates[0].suggestedAction).toBe('inject-broll');
    expect(candidates[0].confidence).toBeGreaterThan(0.9);
  });

  it('solves responsive constraint layout across viewports (Flexbox for Video)', () => {
    const boxes = ConstraintLayoutSolver.solveResponsiveLayout(
      300,
      500,
      { topMarginPx: 60, bottomMarginPx: 90, rightMarginPx: 30, leftMarginPx: 20 },
      [
        { id: 'top-bar', type: 'progress-line', anchor: 'top-edge', offsetRatioX: 0, offsetRatioY: 0, minHeightRatio: 0.01, maxHeightRatio: 0.02 },
        { id: 'hook', type: 'hook-banner', anchor: 'top-safe', offsetRatioX: 0, offsetRatioY: 0, minHeightRatio: 0.05, maxHeightRatio: 0.1 },
        { id: 'captions', type: 'kinetic-captions', anchor: 'bottom-safe', offsetRatioX: 0, offsetRatioY: 0, minHeightRatio: 0.1, maxHeightRatio: 0.2 },
      ]
    );

    expect(boxes.length).toBe(3);
    expect(boxes[0].height).toBeGreaterThanOrEqual(3);
    expect(boxes[1].y).toBeGreaterThanOrEqual(60);
    expect(boxes[2].y).toBeLessThan(500);
  });
});
