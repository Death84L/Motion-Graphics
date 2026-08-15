import { KeyframePoint } from '../../features/graph-editor/types';

export type MusicalSubdivision = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

/**
 * Quantizes keyframe timestamps onto strict musical rhythmic grids.
 */
export function quantizeKeyframesToRhythm(
  keyframes: KeyframePoint[],
  bpm = 120,
  fps = 30,
  subdivision: MusicalSubdivision = '1/4'
): KeyframePoint[] {
  const beatDurationFrames = (60 / bpm) * fps;

  const divisionMultipliers: Record<MusicalSubdivision, number> = {
    '1/1': 4.0,
    '1/2': 2.0,
    '1/4': 1.0,
    '1/8': 0.5,
    '1/16': 0.25,
    '1/32': 0.125,
  };

  const gridInterval = beatDurationFrames * divisionMultipliers[subdivision];

  return keyframes.map((k) => {
    const quantizedTime = Math.round(k.time / gridInterval) * gridInterval;
    return {
      ...k,
      time: Math.max(0, Math.min(100, Math.round(quantizedTime * 10) / 10)),
    };
  }).sort((a, b) => a.time - b.time);
}
