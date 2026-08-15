import { KeyframePoint } from '../../features/graph-editor/types';
import { computeAutoTangents } from '../math/tangentMath';

export interface AudioEnvelopePreset {
  id: string;
  name: string;
  bpm: number;
  intensity: number;
}

export const DEFAULT_AUDIO_PRESETS: AudioEnvelopePreset[] = [
  { id: 'bass-drop', name: '128 BPM Bass Drop', bpm: 128, intensity: 1.0 },
  { id: 'lofi-beat', name: '85 BPM Lo-Fi Pulse', bpm: 85, intensity: 0.75 },
  { id: 'dnb-rush', name: '174 BPM Drum & Bass', bpm: 174, intensity: 1.2 },
];

/**
 * Generates an audio amplitude envelope curve synchronized to BPM and rhythm impulses.
 */
export function generateAudioEnvelopeKeyframes(
  bpm = 120,
  fps = 30,
  intensity = 1.0,
  threshold = 15
): KeyframePoint[] {
  const framesPerBeat = (60 / bpm) * fps;
  const points: KeyframePoint[] = [];

  for (let t = 0; t <= 100; t += 4) {
    const beatPhase = (t % framesPerBeat) / framesPerBeat;
    // Sharp attack, exponential decay on beat hit
    const attackDecay = Math.exp(-beatPhase * 4.5);
    const amp = (threshold + attackDecay * (100 - threshold)) * intensity;

    points.push({
      id: 3000 + t,
      time: t,
      value: Math.max(0, Math.min(100, Math.round(amp * 10) / 10)),
      type: 'bezier',
      ease: 'easeOut',
    });
  }

  return points.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.25);
    return { ...kf, handleIn, handleOut };
  });
}
