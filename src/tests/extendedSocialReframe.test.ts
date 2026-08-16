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

  it('computes exact viewport dimensions for 1:1, 4:5, 9:16, and 16:9', () => {
    const square = ExtendedSocialReframeEngine.computeViewportDimensions('1:1-square');
    expect(square.width).toBe(280);
    expect(square.height).toBe(280);
    expect(square.aspectRatio).toBe('1 / 1');

    const portrait = ExtendedSocialReframeEngine.computeViewportDimensions('4:5-portrait');
    expect(portrait.width).toBe(240);
    expect(portrait.height).toBe(300);

    const vertical = ExtendedSocialReframeEngine.computeViewportDimensions('9:16-reels');
    expect(vertical.width).toBe(202);
    expect(vertical.height).toBe(360);
  });

  it('computes 2.5D multi-plane depth parallax rig keyframes', () => {
    const rig = ExtendedSocialReframeEngine.compute25DParallaxRig({ x: 250, y: 150 }, 1.5, 5.0);

    expect(rig.foregroundPanKeyframes.length).toBeGreaterThan(4);
    expect(rig.foregroundScaleKeyframes.length).toBeGreaterThan(4);
    expect(rig.backgroundPanKeyframes.length).toBeGreaterThan(4);
    expect(rig.backgroundScaleKeyframes.length).toBeGreaterThan(4);
    expect(rig.cameraZDepthKeyframes.length).toBeGreaterThan(4);
    expect(rig.cameraZDepthKeyframes[rig.cameraZDepthKeyframes.length - 1].value).toBeLessThan(0);
  });
});
