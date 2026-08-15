import { KeyframePoint } from '../../features/graph-editor/types';

export type LfoWaveform = 'sine' | 'triangle' | 'sawtooth' | 'square' | 'pulse';

export interface LfoConfig {
  waveform: LfoWaveform;
  frequencyHz: number; // e.g. 2.0
  amplitude: number; // e.g. 25%
  offset: number; // e.g. 50%
}

/**
 * Generates periodic procedural LFO modulation waveforms.
 */
export function generateLfoCurve(config: LfoConfig, samples = 80): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const phase = (t / 100) * config.frequencyHz * 2 * Math.PI;
    let wave = 0;

    if (config.waveform === 'sine') {
      wave = Math.sin(phase);
    } else if (config.waveform === 'triangle') {
      wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    } else if (config.waveform === 'sawtooth') {
      wave = (2 * ((phase / (2 * Math.PI)) % 1)) - 1;
    } else if (config.waveform === 'square') {
      wave = Math.sin(phase) >= 0 ? 1 : -1;
    } else {
      wave = Math.sin(phase) > 0.6 ? 1 : 0;
    }

    const val = config.offset + wave * config.amplitude;

    result.push({
      id: 21000 + i,
      time: t,
      value: Math.round(val * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
