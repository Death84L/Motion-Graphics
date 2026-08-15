import { describe, it, expect } from 'vitest';
import { BrollEngine } from '../core/broll/brollEngine';
import { SAMPLE_BROLL_LIBRARY, KenBurnsConfig } from '../core/broll/brollSchema';

describe('Universal B-Roll Engine Test Suite', () => {
  it('evaluates smooth Ken Burns scale and pan values at progress points', () => {
    const config: KenBurnsConfig = {
      direction: 'zoom-in',
      zoomStart: 1.0,
      zoomEnd: 1.25,
      easing: 'smooth',
    };

    const start = BrollEngine.evaluateKenBurns(config, 0.0);
    expect(start.scale).toBe(1.0);

    const mid = BrollEngine.evaluateKenBurns(config, 0.5);
    expect(mid.scale).toBeGreaterThan(1.0);
    expect(mid.scale).toBeLessThan(1.25);

    const end = BrollEngine.evaluateKenBurns(config, 1.0);
    expect(end.scale).toBe(1.25);
  });

  it('automatically sequences B-Roll clips synchronized to 128 BPM beat grid', () => {
    const scene = BrollEngine.autoSequenceToBeat(SAMPLE_BROLL_LIBRARY, 128, 4, 10.0);
    expect(scene.clips.length).toBeGreaterThan(3);
    expect(scene.musicBpm).toBe(128);
    // At 128 BPM and 4 beats/cut, each cut duration is 60/128 * 4 = 1.875s
    expect(scene.clips[0].durationSec).toBeCloseTo(1.875, 2);
    expect(scene.totalDurationSec).toBeCloseTo(10.0, 1);
  });

  it('bakes Ken Burns zoom trajectory into standard Bézier keyframes', () => {
    const clip = SAMPLE_BROLL_LIBRARY[0];
    const keyframes = BrollEngine.bakeKenBurnsToKeyframes(clip, 'scale', 60);

    expect(keyframes.length).toBeGreaterThan(5);
    expect(keyframes[0].type).toBe('bezier');
    expect(keyframes[0].value).toBe(100); // 1.0 scale = 100%
  });
});
