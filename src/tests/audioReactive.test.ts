import { describe, it, expect } from 'vitest';
import { AudioReactiveEngine } from '../core/audio/audioReactiveEngine';
import { MusicIntelligenceEngine } from '../core/audio/musicIntelligenceEngine';
import { AudioModulationGraphEngine } from '../core/audio/audioModulationGraph';
import { AudioKeyframeBaker } from '../core/audio/audioKeyframeBaker';

describe('Audio-Reactive Motion Engine Test Suite', () => {
  it('generates 8-band spectral analysis frames with valid energy ranges', () => {
    const frames = AudioReactiveEngine.generateSpectralFrames(2.0, 60, 128);
    expect(frames.length).toBe(120); // 2 seconds at 60fps = 120 frames

    const sampleFrame = frames[10];
    expect(sampleFrame.bands['sub-bass']).toBeGreaterThanOrEqual(0);
    expect(sampleFrame.bands['sub-bass']).toBeLessThanOrEqual(1.0);
    expect(sampleFrame.bands['treble']).toBeGreaterThanOrEqual(0);
    expect(sampleFrame.rms).toBeGreaterThanOrEqual(0);
  });

  it('detects BPM and musical beat events from spectral frames', () => {
    const frames = AudioReactiveEngine.generateSpectralFrames(4.0, 60, 128);
    const musicInfo = MusicIntelligenceEngine.analyzeMusicStructure(frames, 60);

    expect(musicInfo.bpm).toBe(128);
    expect(musicInfo.confidence).toBeGreaterThan(0.9);
    expect(musicInfo.events.length).toBeGreaterThan(0);
  });

  it('evaluates audio modulation graph and threshold gates correctly', () => {
    const frame = {
      timestampMs: 0,
      rms: 0.8,
      peak: 0.95,
      bands: {
        'sub-bass': 0.9,
        'bass': 0.85,
        'low-mid': 0.4,
        'mid': 0.5,
        'high-mid': 0.3,
        'treble': 0.2,
        'high-treble': 0.1,
        'rms-volume': 0.8,
      },
      spectralCentroidHz: 450,
      isBeat: true,
      isOnset: true,
    };

    const binding = {
      id: 'b-test',
      name: 'Bass -> Scale',
      sourceBand: 'bass' as const,
      targetProperty: 'scale' as const,
      multiplier: 1.5,
      threshold: 0.2,
      minOutput: 100,
      maxOutput: 150,
      smoothingAttack: 0.8,
      smoothingRelease: 0.2,
      invert: false,
      enabled: true,
    };

    const outputs = AudioModulationGraphEngine.evaluateModulation(frame, [binding]);
    // With 0.85 bass and 0.2 threshold, output should be scaled > 100%
    expect(outputs['scale']).toBeGreaterThan(100);
  });

  it('bakes spectral modulation into simplified Bézier keyframes', () => {
    const frames = AudioReactiveEngine.generateSpectralFrames(1.0, 60, 128);
    const binding = {
      id: 'b-bake',
      name: 'Kick -> Scale',
      sourceBand: 'kick-transient' as const,
      targetProperty: 'scale' as const,
      multiplier: 1.2,
      threshold: 0.1,
      minOutput: 100,
      maxOutput: 140,
      smoothingAttack: 0.9,
      smoothingRelease: 0.1,
      invert: false,
      enabled: true,
    };

    const keyframes = AudioKeyframeBaker.bakeAudioToKeyframes(frames, binding, 60, 0.5);
    expect(keyframes.length).toBeGreaterThan(1);
    expect(keyframes[0].value).toBeGreaterThanOrEqual(100);
  });
});
