export type AudioFrequencyBandId =
  | 'sub-bass' // 20 - 60 Hz
  | 'bass' // 60 - 250 Hz
  | 'low-mid' // 250 - 500 Hz
  | 'mid' // 500 - 2000 Hz
  | 'high-mid' // 2000 - 4000 Hz
  | 'treble' // 4000 - 8000 Hz
  | 'high-treble' // 8000 - 16000 Hz
  | 'rms-volume';

export interface SpectralAnalysisFrame {
  timestampMs: number;
  rms: number; // 0.0 to 1.0
  peak: number; // 0.0 to 1.0
  bands: Record<AudioFrequencyBandId, number>; // 0.0 to 1.0 per band
  spectralCentroidHz: number;
  isBeat: boolean;
  isOnset: boolean;
}

export class AudioReactiveEngine {
  /**
   * Generates synthetic or sampled multi-band spectral analysis frames for a given timeline duration.
   */
  static generateSpectralFrames(
    durationSeconds = 4.0,
    fps = 60,
    bpm = 128
  ): SpectralAnalysisFrame[] {
    const totalFrames = Math.round(durationSeconds * fps);
    const frames: SpectralAnalysisFrame[] = [];
    const framesPerBeat = (60 / bpm) * fps;

    let smoothedBass = 0;
    let smoothedMid = 0;
    let smoothedTreble = 0;

    for (let f = 0; f < totalFrames; f++) {
      const timeMs = (f / fps) * 1000;
      const beatDist = (f % framesPerBeat);
      const isBeat = beatDist < 1.5;
      const isOnset = beatDist < 1.0 || (f % (framesPerBeat * 0.5)) < 1.0;

      // Raw synthetic band energies
      const rawSubBass = isBeat ? 1.0 : Math.max(0, 1.0 - beatDist / 5.0) * 0.8;
      const rawBass = isBeat ? 0.95 : Math.max(0.1, Math.sin(f * 0.3) * 0.4 + 0.3);
      const rawLowMid = Math.abs(Math.sin(f * 0.45)) * 0.6 + (isBeat ? 0.4 : 0.1);
      const rawMid = Math.abs(Math.cos(f * 0.6)) * 0.7;
      const rawHighMid = Math.abs(Math.sin(f * 1.1)) * 0.5;
      const rawTreble = (f % (framesPerBeat * 0.5)) < 2 ? 0.85 : Math.random() * 0.25;
      const rawHighTreble = Math.random() * 0.3;

      // Envelope follower (Attack: 0.8, Release: 0.15)
      smoothedBass += (rawBass - smoothedBass) * (rawBass > smoothedBass ? 0.8 : 0.15);
      smoothedMid += (rawMid - smoothedMid) * (rawMid > smoothedMid ? 0.7 : 0.2);
      smoothedTreble += (rawTreble - smoothedTreble) * (rawTreble > smoothedTreble ? 0.9 : 0.3);

      const rms = (smoothedBass * 0.5 + smoothedMid * 0.3 + smoothedTreble * 0.2);
      const peak = Math.max(rawSubBass, rawBass, rawTreble);

      frames.push({
        timestampMs: timeMs,
        rms: Math.min(1.0, Math.max(0, rms)),
        peak: Math.min(1.0, Math.max(0, peak)),
        bands: {
          'sub-bass': Math.min(1.0, Math.max(0, rawSubBass)),
          'bass': Math.min(1.0, Math.max(0, smoothedBass)),
          'low-mid': Math.min(1.0, Math.max(0, rawLowMid)),
          'mid': Math.min(1.0, Math.max(0, smoothedMid)),
          'high-mid': Math.min(1.0, Math.max(0, rawHighMid)),
          'treble': Math.min(1.0, Math.max(0, smoothedTreble)),
          'high-treble': Math.min(1.0, Math.max(0, rawHighTreble)),
          'rms-volume': Math.min(1.0, Math.max(0, rms)),
        },
        spectralCentroidHz: 120 + smoothedMid * 2400 + smoothedTreble * 5000,
        isBeat,
        isOnset,
      });
    }

    return frames;
  }

  /**
   * Applies asymmetric envelope follower smoothing (Attack / Release filter).
   */
  static applyEnvelopeFollower(
    inputSignals: number[],
    attackCoeff = 0.8,
    releaseCoeff = 0.15
  ): number[] {
    const smoothed: number[] = [];
    let current = 0;

    for (const val of inputSignals) {
      const coeff = val > current ? attackCoeff : releaseCoeff;
      current += (val - current) * coeff;
      smoothed.push(current);
    }

    return smoothed;
  }
}
