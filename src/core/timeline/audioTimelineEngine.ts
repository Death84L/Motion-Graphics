import { UniversalKeyframe, UniversalMarker } from './universalTimelineSchema';

export interface AudioPeakMarker {
  frame: number;
  amplitude: number; // 0.0 to 1.0
  isBeat: boolean;
}

export class AudioTimelineEngine {
  /**
   * Generates a synthetic or sampled audio amplitude waveform array.
   */
  static generateWaveformBuffer(totalFrames = 180, bpm = 120, fps = 60): number[] {
    const buffer: number[] = [];
    const framesPerBeat = (60 / bpm) * fps;

    for (let f = 0; f < totalFrames; f++) {
      const beatDist = Math.abs((f % framesPerBeat) - 0);
      const isNearBeat = beatDist < 4 || beatDist > framesPerBeat - 4;
      const baseAmp = isNearBeat ? 0.85 + Math.sin(f * 0.5) * 0.15 : 0.25 + Math.sin(f * 0.2) * 0.2;
      buffer.push(Math.max(0.05, Math.min(1.0, baseAmp)));
    }

    return buffer;
  }

  /**
   * Generates beat markers across the timeline according to BPM and time signature.
   */
  static generateBeatMarkers(totalFrames = 180, bpm = 120, fps = 60): UniversalMarker[] {
    const markers: UniversalMarker[] = [];
    const framesPerBeat = (60 / bpm) * fps;
    let count = 1;

    for (let f = 0; f < totalFrames; f += framesPerBeat) {
      markers.push({
        id: `beat-m-${Math.round(f)}`,
        frame: Math.round(f),
        label: `Beat ${count}`,
        color: count % 4 === 1 ? '#ec4899' : '#38bdf8', // Downbeat highlight
        type: 'beat',
      });
      count++;
    }

    return markers;
  }

  /**
   * Automatically aligns selected keyframes to the nearest musical beats.
   */
  static snapKeyframesToNearestBeats(
    keyframes: UniversalKeyframe[],
    bpm = 120,
    fps = 60
  ): UniversalKeyframe[] {
    const framesPerBeat = (60 / bpm) * fps;

    return keyframes.map((k) => {
      const nearestBeat = Math.round(k.frame / framesPerBeat) * framesPerBeat;
      return {
        ...k,
        frame: Math.round(nearestBeat),
      };
    });
  }
}
