import { describe, it, expect } from 'vitest';
import { DepthParallaxEngine } from '../core/social/depthParallaxEngine';
import { MultiSpeakerDirector } from '../core/social/multiSpeakerDirector';
import { AudioKinematicsEngine } from '../core/social/audioKinematicsEngine';
import { ViralRetentionEngine } from '../core/social/viralRetentionEngine';
import { BatchReframeProcessor } from '../core/social/batchReframeProcessor';

describe('Comprehensive Social Reframe Engine Test Suite', () => {
  it('computes 2.5D spatial depth parallax rig with Z-offset and camera roll', () => {
    const output = DepthParallaxEngine.computeSpatialParallaxRig({
      opticalZIntensity: 1.5,
      characterCenter: { x: 400, y: 300 },
      durationSec: 10.0,
      enableRimLight: true,
      enableVolumetricDust: true,
      enableDutchAngleRoll: true,
    });

    expect(output.foregroundLayer.zDepthOffset).toBeLessThan(0);
    expect(output.backgroundLayer.zDepthOffset).toBeGreaterThan(0);
    expect(output.foregroundLayer.panKeyframes.length).toBe(9);
    expect(output.backgroundLayer.blurRadiusPx).toBeGreaterThan(25);
    expect(output.cameraController.dollyZKeyframes.length).toBe(9);
    expect(output.cameraController.rollAngleKeyframes.length).toBe(9);
  });

  it('solves multi-speaker director layouts for 50-50, 70-30, and PiP docking', () => {
    const layout50 = MultiSpeakerDirector.solveDirectorLayout(
      1920,
      1080,
      1080,
      1920,
      [
        { id: 'speaker-a', name: 'Alex', x: 400, y: 540, width: 300, height: 400, isSpeaking: true, confidence: 0.95 },
        { id: 'speaker-b', name: 'Sarah', x: 1500, y: 540, width: 300, height: 400, isSpeaking: false, confidence: 0.92 },
      ],
      '50-50'
    );

    expect(layout50.mode).toBe('50-50');
    expect(layout50.hostFrame.height).toBe(960);
    expect(layout50.guestFrame?.height).toBe(960);

    const layout70 = MultiSpeakerDirector.solveDirectorLayout(
      1920,
      1080,
      1080,
      1920,
      [],
      '70-30-host'
    );
    expect(layout70.hostFrame.height).toBe(1344);
    expect(layout70.guestFrame?.height).toBe(576);

    const layoutPip = MultiSpeakerDirector.solveDirectorLayout(
      1920,
      1080,
      1080,
      1920,
      [],
      'pip-docked'
    );
    expect(layoutPip.pipDocking).toBeDefined();
    expect(layoutPip.pipDocking?.size).toBeGreaterThan(200);
  });

  it('analyzes audio kinematics, silence pauses, and cadence WPM', () => {
    const analysis = AudioKinematicsEngine.analyzeAudioKinematics(15.0, -38, 0.35, 45);

    expect(analysis.wordsPerMinute).toBe(180);
    expect(analysis.pacingRating).toBe('Optimal Fast');
    expect(analysis.silenceIntervals.length).toBeGreaterThan(1);
    expect(analysis.jumpCutTimestamps.length).toBeGreaterThan(1);
    expect(analysis.scalePunchKeyframes.length).toBe(5);
  });

  it('generates viral retention hook themes and emoji reaction triggers', () => {
    const theme = ViralRetentionEngine.getRetentionHookTheme('viral-yellow');
    expect(theme.backgroundColor).toBe('#fde047');
    expect(theme.textColor).toBe('#040711');

    const cyber = ViralRetentionEngine.getRetentionHookTheme('cyberpunk-neon');
    expect(cyber.textColor).toBe('#38bdf8');

    const emojis = ViralRetentionEngine.generateReactionTriggers(15.0);
    expect(emojis.length).toBe(4);
    expect(emojis[0].emoji).toBe('🔥');
  });

  it('processes 1-to-many batch reframing across all 4 social ratios (9:16, 1:1, 4:5, 16:9)', () => {
    const batch = BatchReframeProcessor.processAllRatios(1920, 1080, 15.0, 'tiktok', []);

    expect(batch.totalFormatsGenerated).toBe(4);
    expect(batch.results.length).toBe(4);
    expect(batch.results[0].format).toBe('9:16-reels');
    expect(batch.results[1].format).toBe('1:1-square');
    expect(batch.results[2].format).toBe('4:5-portrait');
    expect(batch.results[3].format).toBe('16:9-landscape');
    expect(batch.results[0].safeZoneComplianceScore).toBe(100);
    expect(batch.results[0].isExportReady).toBe(true);
  });
});
