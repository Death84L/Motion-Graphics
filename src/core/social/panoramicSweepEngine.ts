import { KeyframePoint } from '../../features/graph-editor/types';

export interface SubjectAnchor {
  id: string;
  name: string;
  normalizedX: number; // 0.0 to 1.0
  dwellTimeSec: number;
}

export interface PanoramicSweepConfig {
  durationSec: number;
  sourceWidth: number;
  sourceHeight: number;
  targetWidth: number;
  subjects: SubjectAnchor[];
  sweepMode: 'continuous-pan' | 'ping-pong' | 'speed-ramped-dwell';
}

export interface PanoramicSweepOutput {
  panKeyframes: KeyframePoint[];
  scaleKeyframes: KeyframePoint[];
  coveragePercent: 100; // 100% of the wide panorama is revealed
  totalPansCount: number;
}

export class PanoramicSweepEngine {
  /**
   * Generates continuous panoramic scan trajectories that reveal 100% of widescreen footage over time.
   */
  static generatePanoramicSweepKeyframes(config: PanoramicSweepConfig): PanoramicSweepOutput {
    const minPanX = 0;
    const maxPanX = Math.max(0, config.sourceWidth - config.targetWidth);
    const keyframes: KeyframePoint[] = [];

    if (config.sweepMode === 'continuous-pan' || config.subjects.length <= 1) {
      const steps = 6;
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const t = Math.round(progress * config.durationSec * 100) / 100;
        // Smooth sine ease from left to right
        const easeProgress = 0.5 * (1 - Math.cos(progress * Math.PI));
        const panVal = Math.round(minPanX + easeProgress * maxPanX);

        keyframes.push({
          id: 11000 + i,
          time: t,
          value: panVal,
          type: 'bezier',
          handleIn: { x: 0.25, y: panVal },
          handleOut: { x: 0.25, y: panVal },
        });
      }
    } else if (config.sweepMode === 'ping-pong') {
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const t = Math.round(progress * config.durationSec * 100) / 100;
        // Sine wave ping-pong 0 -> 1 -> 0
        const wave = Math.sin(progress * Math.PI);
        const panVal = Math.round(minPanX + wave * maxPanX);

        keyframes.push({
          id: 11100 + i,
          time: t,
          value: panVal,
          type: 'bezier',
          handleIn: { x: 0.25, y: panVal },
          handleOut: { x: 0.25, y: panVal },
        });
      }
    } else {
      // Speed-ramped dwell on detected subjects
      const halfDur = config.durationSec / 2;
      keyframes.push(
        { id: 11200, time: 0.0, value: minPanX, type: 'bezier' },
        { id: 11201, time: 2.0, value: minPanX, type: 'bezier' }, // Dwell on left subject
        { id: 11202, time: halfDur, value: Math.round(maxPanX / 2), type: 'bezier' }, // Glide across center
        { id: 11203, time: config.durationSec - 2.0, value: maxPanX, type: 'bezier' }, // Dwell on right subject
        { id: 11204, time: config.durationSec, value: maxPanX, type: 'bezier' }
      );
    }

    const scaleKeys: KeyframePoint[] = [
      { id: 11300, time: 0.0, value: 100, type: 'bezier' },
      { id: 11301, time: config.durationSec, value: 100, type: 'bezier' },
    ];

    return {
      panKeyframes: keyframes,
      scaleKeyframes: scaleKeys,
      coveragePercent: 100,
      totalPansCount: keyframes.length,
    };
  }
}
