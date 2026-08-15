import { KeyframePoint } from '../../features/graph-editor/types';

export interface BeatMarker {
  id: string;
  frame: number;
  beatIndex: number;
  isDownbeat: boolean;
}

/**
 * Calculates musical beat marker positions across timeline frames based on BPM and FPS.
 */
export function generateBeatGrid(bpm = 120, fps = 30): BeatMarker[] {
  const framesPerBeat = (60 / bpm) * fps;
  const beats: BeatMarker[] = [];

  let count = 0;
  for (let f = 0; f <= 100; f += framesPerBeat) {
    beats.push({
      id: `beat-${count}`,
      frame: Math.round(f * 10) / 10,
      beatIndex: count + 1,
      isDownbeat: count % 4 === 0,
    });
    count++;
  }

  return beats;
}

/**
 * Snaps all keyframes to the nearest rhythmic beat marker.
 */
export function snapKeyframesToBeats(
  keyframes: KeyframePoint[],
  beats: BeatMarker[]
): KeyframePoint[] {
  if (beats.length === 0) return keyframes;

  return keyframes.map((k) => {
    let nearestBeat = beats[0].frame;
    let minDiff = Math.abs(k.time - nearestBeat);

    for (const b of beats) {
      const diff = Math.abs(k.time - b.frame);
      if (diff < minDiff) {
        minDiff = diff;
        nearestBeat = b.frame;
      }
    }

    return {
      ...k,
      time: Math.max(0, Math.min(100, nearestBeat)),
    };
  });
}
