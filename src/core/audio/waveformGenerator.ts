export interface AudioSamplePoint {
  time: number; // 0 to 100 timeline percentage
  amplitude: number; // 0 to 1 normalized volume
  rms: number; // root mean square power
  transient: boolean; // peak / beat hit
}

export type AudioTrackPreset = 'drum-beat' | 'synth-bass' | 'lead-melody' | 'cinematic-hit' | 'speech-voice';

export interface AudioWaveformConfig {
  track: AudioTrackPreset;
  volume: number; // 0.1 to 2.0
  density: number; // number of samples
  showRMS: boolean;
  showTransients: boolean;
  color: string;
  opacity: number;
}

export const DEFAULT_AUDIO_CONFIG: AudioWaveformConfig = {
  track: 'drum-beat',
  volume: 1.0,
  density: 180,
  showRMS: true,
  showTransients: true,
  color: '#38bdf8',
  opacity: 0.35,
};

/**
 * Generates synthetic or procedural audio waveform envelope data synced to timeline (0-100 frames).
 */
export function generateWaveformData(config: AudioWaveformConfig): AudioSamplePoint[] {
  const { track, volume, density } = config;
  const samples: AudioSamplePoint[] = [];

  for (let i = 0; i <= density; i++) {
    const time = (i / density) * 100;
    let rawAmp = 0;

    switch (track) {
      case 'drum-beat': {
        // Kick on 0, 25, 50, 75; Snare on 12.5, 37.5, 62.5, 87.5; Hi-hats
        const kickDist = Math.min(time % 25, 25 - (time % 25));
        const kickEnv = Math.max(0, 1 - kickDist / 3.5);

        const snarePhase = (time + 12.5) % 25;
        const snareDist = Math.min(snarePhase, 25 - snarePhase);
        const snareEnv = Math.max(0, 1 - snareDist / 4.0) * 0.8;

        const noise = (Math.sin(time * 8.5) * 0.5 + 0.5) * 0.15;
        rawAmp = Math.min(1, (kickEnv * 0.9 + snareEnv * 0.7 + noise) * volume);
        break;
      }

      case 'synth-bass': {
        // Smooth undulating sidechained sub-bass
        const lfo = Math.sin(time * 0.35) * 0.5 + 0.5;
        const sub = Math.sin(time * 1.8) * 0.4 + 0.5;
        const wobble = Math.sin(time * 0.8 + Math.cos(time * 0.2) * 2) * 0.3;
        rawAmp = Math.min(1, Math.max(0, (lfo * 0.6 + sub * 0.3 + wobble) * volume));
        break;
      }

      case 'lead-melody': {
        // Arpeggiator bursts
        const note = Math.sin(time * 1.2);
        const envelope = Math.abs(Math.sin(time * 0.4)) * (Math.sin(time * 3.1) * 0.5 + 0.5);
        rawAmp = Math.min(1, Math.max(0, (envelope * 0.8 + Math.abs(note) * 0.2) * volume));
        break;
      }

      case 'cinematic-hit': {
        // Massive initial impact with exponential decay
        const impact1 = time < 45 ? Math.exp(-time / 8) : 0;
        const impact2 = time >= 45 && time < 80 ? Math.exp(-(time - 45) / 10) * 0.9 : 0;
        const subRumble = (Math.sin(time * 0.6) * 0.5 + 0.5) * 0.2;
        rawAmp = Math.min(1, (impact1 + impact2 + subRumble) * volume);
        break;
      }

      case 'speech-voice': {
        // Syllable clusters and natural pauses
        const isPause = (time > 20 && time < 28) || (time > 65 && time < 75);
        if (isPause) {
          rawAmp = (Math.random() * 0.05) * volume;
        } else {
          const formants =
            Math.sin(time * 2.2) * 0.3 +
            Math.sin(time * 4.7) * 0.3 +
            Math.sin(time * 0.9) * 0.4;
          rawAmp = Math.min(1, Math.max(0, (Math.abs(formants) * 0.8 + 0.1) * volume));
        }
        break;
      }

      default:
        rawAmp = (Math.sin(time * 0.5) * 0.5 + 0.5) * volume;
    }

    const rms = Math.sqrt(rawAmp * rawAmp * 0.7);
    const transient = rawAmp > 0.72;

    samples.push({
      time,
      amplitude: Math.min(1, Math.max(0, rawAmp)),
      rms: Math.min(1, Math.max(0, rms)),
      transient,
    });
  }

  return samples;
}
