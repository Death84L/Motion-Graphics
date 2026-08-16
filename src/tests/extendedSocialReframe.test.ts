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

  it('generates complete After Effects ExtendScript (.jsx) project with 3D camera controller', () => {
    const jsx = ExtendedSocialReframeEngine.generateAfterEffectsProjectScript({
      sourceWidth: 1920,
      sourceHeight: 1080,
      durationSec: 15.0,
      format: '9:16-reels',
      platform: 'tiktok',
      hookText: 'Scale 10X Fast',
      panKeyframes: [{ id: 1, time: 0, value: 400, type: 'bezier' }],
      scaleKeyframes: [{ id: 2, time: 0, value: 100, type: 'bezier' }],
    });

    expect(jsx).toContain('Reframed_9:16-REELS');
    expect(jsx).toContain('Reframe_Camera_Controller');
    expect(jsx).toContain('Scale 10X Fast');
  });

  it('generates complete Adobe Premiere Pro UXP multi-track sequence JSON', () => {
    const jsonStr = ExtendedSocialReframeEngine.generatePremiereUxpSequence({
      sourceWidth: 1920,
      sourceHeight: 1080,
      durationSec: 15.0,
      format: '1:1-square',
      platform: 'instagram-reels',
      hookText: 'Scale 10X Fast',
      panKeyframes: [{ id: 1, time: 0, value: 400, type: 'bezier' }],
      scaleKeyframes: [{ id: 2, time: 0, value: 100, type: 'bezier' }],
    });

    const parsed = JSON.parse(jsonStr);
    expect(parsed.host).toBe('premierepro');
    expect(parsed.targetFormat).toBe('1:1-square');
    expect(parsed.sequenceSettings.width).toBe(1080);
    expect(parsed.sequenceSettings.height).toBe(1080);
    expect(parsed.tracks.length).toBe(4);
  });

  it('generates procedural backdrop CSS for studio radial, cyberpunk, and ambient glow', () => {
    const studio = ExtendedSocialReframeEngine.getProceduralBackdropCSS('studio-dark-radial');
    expect(studio.background).toContain('radial-gradient');
    expect(studio.hasBlurLayer).toBe(false);

    const cyber = ExtendedSocialReframeEngine.getProceduralBackdropCSS('cyberpunk-gradient');
    expect(cyber.background).toContain('rgba(236, 72, 153');

    const ambient = ExtendedSocialReframeEngine.getProceduralBackdropCSS('ambient-color-glow', 'test.mp4');
    expect(ambient.hasBlurLayer).toBe(true);
  });
});
