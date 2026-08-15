import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface TimeRemapPreset {
  id: string;
  name: string;
  description: string;
  keyframes: KeyframePoint[];
}

export const DEFAULT_TIME_REMAP_PRESETS: TimeRemapPreset[] = [
  {
    id: 'speed-ramp',
    name: 'Dynamic Speed Ramp',
    description: 'Fast rush into slow-mo dramatic hold then fast finish',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeIn' },
      { id: 2, time: 30, value: 45, ease: 'easeInOut' },
      { id: 3, time: 70, value: 55, ease: 'easeInOut' }, // Flat slow-mo span
      { id: 4, time: 100, value: 100, ease: 'easeOut' },
    ],
  },
  {
    id: 'freeze-frame',
    name: 'Freeze Frame (1 Sec)',
    description: 'Instant zero-velocity freeze at middle then resumes',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'linear' },
      { id: 2, time: 40, value: 40, ease: 'hold' },
      { id: 3, time: 60, value: 40, ease: 'linear' },
      { id: 4, time: 100, value: 100, ease: 'linear' },
    ],
  },
  {
    id: 'rewind-reverse',
    name: 'Fast Rewind / Reverse',
    description: 'Plays forward, fast reverses backward, and plays out',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeInOut' },
      { id: 2, time: 40, value: 80, ease: 'easeInOut' },
      { id: 3, time: 70, value: 20, ease: 'easeInOut' }, // Reverse slope
      { id: 4, time: 100, value: 100, ease: 'easeInOut' },
    ],
  },
];

/**
 * Evaluates time remapping playback time given input source time.
 */
export function evaluateRemappedTime(
  remapKeyframes: KeyframePoint[],
  inputSourceTime: number
): number {
  return evaluateGraphAtTime(remapKeyframes, inputSourceTime);
}
