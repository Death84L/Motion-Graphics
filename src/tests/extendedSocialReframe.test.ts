import { describe, it, expect } from 'vitest';
import {
  ExtendedSocialReframeEngine,
  SpeakerProfile,
} from '../core/social/extendedSocialReframeEngine';

describe('Extended Social Reframe Engine Test Suite', () => {
  it('computes Split-Screen Duplex composition layout for 2 speakers', () => {
    const speakers: SpeakerProfile[] = [
      { id: 'speaker-a', name: 'Host', x: 400, y: 540, isActive: true },
      { id: 'speaker-b', name: 'Guest', x: 1400, y: 540, isActive: false },
    ];

    const result = ExtendedSocialReframeEngine.computeMultiSpeakerLayout(
      1920,
      1080,
      speakers,
      'speaker-a',
      'split-duplex',
      '9:16-reels'
    );

    expect(result.layoutMode).toBe('split-duplex');
    expect(result.primaryCrop.height).toBe(540);
    expect(result.secondaryCrop).toBeDefined();
    expect(result.secondaryCrop?.y).toBe(540);
  });

  it('computes Tri-Stack composition layout for gaming and reaction videos', () => {
    const speakers: SpeakerProfile[] = [
      { id: 'host', name: 'Host', x: 300, y: 300, isActive: true },
      { id: 'guest', name: 'Guest', x: 1500, y: 300, isActive: false },
    ];

    const result = ExtendedSocialReframeEngine.computeMultiSpeakerLayout(
      1920,
      1080,
      speakers,
      'host',
      'tri-stack',
      '9:16-reels'
    );

    expect(result.layoutMode).toBe('tri-stack');
    expect(result.primaryCrop.height).toBe(360);
    expect(result.secondaryCrop?.height).toBe(360);
    expect(result.tertiaryCrop?.height).toBe(360);
  });

  it('computes Blurred Ambient Background Mirror padding for centered 16:9 video', () => {
    const result = ExtendedSocialReframeEngine.computeMultiSpeakerLayout(
      1920,
      1080,
      [],
      'speaker-a',
      'blurred-mirror',
      '9:16-reels'
    );

    expect(result.layoutMode).toBe('blurred-mirror');
    expect(result.blurredBackgroundPadding).toBeDefined();
    expect(result.blurredBackgroundPadding?.blurRadius).toBe(30);
    expect(result.blurredBackgroundPadding?.topH).toBeGreaterThan(0);
  });

  it('filters micro-jitter with deadband pan tolerance window', () => {
    const currentPanX = 500;
    // Micro movement within deadband radius (40px)
    const microMoveX = 520;
    const filteredMicro = ExtendedSocialReframeEngine.filterDeadbandPan(currentPanX, microMoveX, 45);
    expect(filteredMicro).toBe(currentPanX); // Stationary

    // Large movement outside deadband
    const largeMoveX = 800;
    const filteredLarge = ExtendedSocialReframeEngine.filterDeadbandPan(currentPanX, largeMoveX, 45, 0.2);
    expect(filteredLarge).toBeGreaterThan(currentPanX);
  });

  it('solves safe caption placement avoiding TikTok bottom descriptions and faces', () => {
    const placement = ExtendedSocialReframeEngine.solveSafeCaptionPlacement(1920, 700, 90, {
      topMarginPx: 120,
      bottomMarginPx: 380,
      rightMarginPx: 140,
      leftMarginPx: 40,
    });

    expect(placement.y).toBeLessThan(1920 - 380);
    expect(placement.y).toBeGreaterThan(120);
  });

  it('bakes reframe pan and scale trajectory into standard Bézier keyframes', () => {
    const trajectory = [
      { time: 0, panX: 200, scale: 1.0 },
      { time: 1.5, panX: 350, scale: 1.08 },
    ];

    const keyframes = ExtendedSocialReframeEngine.bakeReframeTrajectoryToKeyframes(trajectory);
    expect(keyframes.length).toBe(2);
    expect(keyframes[0].value).toBe(200);
    expect(keyframes[1].value).toBe(350);
  });
});
