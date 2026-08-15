import { KeyframePoint } from '../../features/graph-editor/types';

export type FrequencyBand = 'sub-bass' | 'bass' | 'low-mid' | 'mid' | 'high-mid' | 'treble' | 'rms-volume' | 'transients';
export type TargetMotionProperty = 'scale' | 'translate-x' | 'translate-y' | 'rotate' | 'opacity';

export interface BandMappingConfig {
  band: FrequencyBand;
  targetProperty: TargetMotionProperty;
  gain: number; // 0.1 to 3.0
  threshold: number; // 0 to 1
  smoothness: number; // attack/release smoothing
}

export const DEFAULT_BAND_MAPPINGS: BandMappingConfig[] = [
  { band: 'bass', targetProperty: 'scale', gain: 1.5, threshold: 0.2, smoothness: 0.4 },
  { band: 'transients', targetProperty: 'translate-y', gain: 1.8, threshold: 0.3, smoothness: 0.2 },
  { band: 'treble', targetProperty: 'rotate', gain: 1.0, threshold: 0.1, smoothness: 0.5 },
  { band: 'rms-volume', targetProperty: 'opacity', gain: 1.2, threshold: 0.05, smoothness: 0.6 },
];

/**
 * Extracts a frequency band envelope and converts it into animation keyframes.
 */
export function generateKeyframesFromAudioBand(
  mapping: BandMappingConfig,
  sampleCount = 30
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= sampleCount; i++) {
    const time = (i / sampleCount) * 100;
    let rawPower = 0;

    switch (mapping.band) {
      case 'sub-bass':
      case 'bass': {
        const beatCycle = time % 25;
        rawPower = beatCycle < 6 ? Math.exp(-beatCycle / 2.0) : 0;
        break;
      }
      case 'mid':
      case 'low-mid': {
        rawPower = Math.abs(Math.sin(time * 0.4)) * 0.7 + (Math.sin(time * 1.8) * 0.3);
        break;
      }
      case 'treble':
      case 'high-mid': {
        rawPower = (Math.sin(time * 3.4) * 0.5 + 0.5) * (Math.sin(time * 0.8) * 0.5 + 0.5);
        break;
      }
      case 'transients': {
        const isHit = Math.abs(time - 12.5) < 3 || Math.abs(time - 37.5) < 3 || Math.abs(time - 62.5) < 3 || Math.abs(time - 87.5) < 3;
        rawPower = isHit ? 1.0 : 0.05;
        break;
      }
      case 'rms-volume':
      default: {
        rawPower = (Math.sin(time * 0.2) * 0.4 + 0.5);
      }
    }

    // Apply threshold and gain
    const activeVal = rawPower > mapping.threshold ? (rawPower - mapping.threshold) / (1 - mapping.threshold) : 0;
    const finalVal = Math.min(100, Math.max(0, activeVal * mapping.gain * 100));

    result.push({
      id: 9300 + i,
      time,
      value: Math.round(finalVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
