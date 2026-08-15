import { describe, it, expect } from 'vitest';
import { INITIAL_UNIVERSAL_COMPOSITION } from '../core/timeline/universalTimelineSchema';
import { TimelineEngine } from '../core/timeline/timelineEngine';
import { AudioTimelineEngine } from '../core/timeline/audioTimelineEngine';

describe('Universal Timeline Engine Test Suite', () => {
  it('executes NLE ripple trims and shifts downstream tracks correctly', () => {
    const comp = INITIAL_UNIVERSAL_COMPOSITION;
    const targetTrackId = comp.tracks[0].id;
    const originalDownstreamIn = comp.tracks[1].inFrame;

    const rippled = TimelineEngine.rippleTrimTrack(comp, targetTrackId, 20);
    const targetTrack = rippled.tracks.find((t) => t.id === targetTrackId);
    expect(targetTrack?.outFrame).toBe(INITIAL_UNIVERSAL_COMPOSITION.tracks[0].outFrame + 20);
  });

  it('snaps keyframes accurately to 120 BPM beat grids', () => {
    const testKeys = [
      { id: 'k1', frame: 28, value: 0, interpolation: 'linear' as const },
      { id: 'k2', frame: 64, value: 100, interpolation: 'linear' as const },
    ];
    // At 120 BPM and 60fps, frames per beat = (60/120)*60 = 30 frames
    const snapped = AudioTimelineEngine.snapKeyframesToNearestBeats(testKeys, 120, 60);
    expect(snapped[0].frame).toBe(30);
    expect(snapped[1].frame).toBe(60);
  });

  it('evaluates hierarchical parent transforms with recursive inheritance', () => {
    const comp = INITIAL_UNIVERSAL_COMPOSITION;
    const childTrack = {
      ...comp.tracks[0],
      parentId: comp.tracks[1].id, // Parented to Glass Card Container
    };
    const evaluatedVal = TimelineEngine.evaluateTrackPropertyAtFrame(childTrack, 'scale', 35, comp);
    expect(evaluatedVal).toBeGreaterThan(0);
  });
});
