import { describe, it, expect } from 'vitest';
import { AutoTransitionSoundEngine } from '../core/social/autoTransitionSoundEngine';
import { AutoColorAudioMasterEngine } from '../core/social/autoColorAudioMasterEngine';
import { KineticLowerThirdsEngine } from '../core/social/kineticLowerThirdsEngine';

describe('Auto Color, Audio DSP, Transitions & Kinetic Lower Thirds Test Suite', () => {
  it('selects correct cinematic transition and SFX based on cut type', () => {
    const speakerCut = AutoTransitionSoundEngine.selectTransitionForCut('hard-speaker-cut', 2.5);
    expect(speakerCut.recommendedTransition).toBe('whip-pan');
    expect(speakerCut.soundEffect).toBe('whoosh-air');

    const brollCut = AutoTransitionSoundEngine.selectTransitionForCut('broll-insert', 5.0);
    expect(brollCut.recommendedTransition).toBe('zoom-blur-push');
  });

  it('snaps timeline keyframes to musical beat grid (128 BPM)', () => {
    const snapped = AutoTransitionSoundEngine.snapTimestampToBeat(1.02, 128, '1/4');
    expect(snapped).toBe(0.938); // Exact nearest 1/4 beat step
  });

  it('returns platform-compliant target LUFS specifications', () => {
    const tiktokSpec = AutoColorAudioMasterEngine.getPlatformAudioSpec('tiktok');
    expect(tiktokSpec.targetLufs).toBe(-14.0);

    const igSpec = AutoColorAudioMasterEngine.getPlatformAudioSpec('instagram-reels');
    expect(igSpec.targetLufs).toBe(-16.0);
  });

  it('calculates dynamic music auto-ducking volume envelope', () => {
    const ducked = AutoColorAudioMasterEngine.computeMusicDuckingVolume(true);
    const unDucked = AutoColorAudioMasterEngine.computeMusicDuckingVolume(false);

    expect(ducked).toBeLessThan(unDucked);
    expect(ducked).toBe(0.18); // ~ -15dB
  });

  it('computes crop-aware sharpness compensation on punch-in zoom', () => {
    const compensation = AutoColorAudioMasterEngine.solveCropSharpnessCompensation(1.6);
    expect(compensation.unsharpMaskAmount).toBeGreaterThan(20);
    expect(compensation.contrastBoostPercent).toBeGreaterThan(5);
    expect(compensation.filterCss).toContain('contrast');
  });

  it('applies 1-click color grade styling', () => {
    const tealOrange = AutoColorAudioMasterEngine.solveColorGrade('teal-orange-modern');
    expect(tealOrange.lutName).toBe('Teal_Orange_Blockbuster_3D.cube');
    expect(tealOrange.colorFilterCss).toContain('hue-rotate');
  });

  it('animates speaker lower-third badge visibility smoothly', () => {
    const visibleStart = KineticLowerThirdsEngine.isBadgeVisible(0.15, 0.0, 5.0);
    expect(visibleStart.isVisible).toBe(true);
    expect(visibleStart.opacity).toBeGreaterThan(0);

    const hiddenAfterTimeout = KineticLowerThirdsEngine.isBadgeVisible(4.0, 0.0, 5.0, 3.5);
    expect(hiddenAfterTimeout.isVisible).toBe(false);
  });
});
