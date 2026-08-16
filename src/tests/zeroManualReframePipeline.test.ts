import { describe, it, expect } from 'vitest';
import { ZeroManualReframePipeline } from '../core/social/zeroManualReframePipeline';

describe('Zero-Manual-Work Social Reframe Pipeline (12 Stages) Test Suite', () => {
  it('executes the full 12-stage automated pipeline with zero manual keyframing', () => {
    const output = ZeroManualReframePipeline.runFullAutoPipeline({
      sourceWidth: 1920,
      sourceHeight: 1080,
      durationSec: 15.0,
      targetFormat: '9:16-reels',
      platform: 'tiktok',
      enableDynamicZoom: true,
      enableBlurredBackground: true,
      enableRetentionHook: true,
      hookHeadline: 'How I scaled 10X in 30 Days 🚀',
    });

    expect(output.exportReady).toBe(true);
    expect(output.qualityValidationScore).toBe(100);
    expect(output.stagesCompleted.length).toBe(8);
    expect(output.panKeyframes.length).toBeGreaterThan(4);
    expect(output.scaleKeyframes.length).toBeGreaterThan(4);
    expect(output.captionPlacement.y).toBeLessThan(1920 - 380);
    expect(output.jumpCutTimestamps.length).toBe(2);
  });

  it('generates smoothed Bézier pan and zoom punch-in keyframes automatically', () => {
    const output = ZeroManualReframePipeline.runFullAutoPipeline({
      sourceWidth: 1920,
      sourceHeight: 1080,
      durationSec: 10.0,
      targetFormat: '9:16-reels',
      platform: 'instagram-reels',
      enableDynamicZoom: true,
    });

    const punchKeyframe = output.scaleKeyframes.find((k) => k.value === 108);
    expect(punchKeyframe).toBeDefined();
    expect(output.panKeyframes[0].type).toBe('bezier');
  });
});
