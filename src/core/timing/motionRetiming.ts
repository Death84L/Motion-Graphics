import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface TimeWarpCurvePreset {
  id: string;
  name: string;
  desc: string;
  warpKeyframes: KeyframePoint[];
}

export const DEFAULT_WARP_PRESETS: TimeWarpCurvePreset[] = [
  {
    id: 'speed-ramp',
    name: 'Dynamic Speed Ramp',
    desc: 'Slow start -> 4x speed rush -> slow settle',
    warpKeyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', ease: 'easeIn' },
      { id: 2, time: 30, value: 15, type: 'bezier', ease: 'easeInOut' },
      { id: 3, time: 70, value: 85, type: 'bezier', ease: 'easeInOut' },
      { id: 4, time: 100, value: 100, type: 'bezier', ease: 'easeOut' },
    ],
  },
  {
    id: 'freeze-frame',
    name: '1-Sec Mid-Motion Freeze',
    desc: 'Pauses playback completely from frame 40 to 60',
    warpKeyframes: [
      { id: 1, time: 0, value: 0, type: 'linear' },
      { id: 2, time: 40, value: 40, type: 'hold' },
      { id: 3, time: 60, value: 40, type: 'linear' },
      { id: 4, time: 100, value: 100, type: 'linear' },
    ],
  },
  {
    id: 'ping-pong',
    name: 'Ping-Pong Reverse',
    desc: 'Plays forward to 100% then reverses back to 0%',
    warpKeyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', ease: 'easeInOut' },
      { id: 2, time: 50, value: 100, type: 'bezier', ease: 'easeInOut' },
      { id: 3, time: 100, value: 0, type: 'bezier', ease: 'easeInOut' },
    ],
  },
];

/**
 * Retimes base keyframes through a non-linear time warping curve T_out(T_in).
 */
export function applyTimeWarpCurve(
  baseKeyframes: KeyframePoint[],
  warpCurveKeyframes: KeyframePoint[],
  samples = 20
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const tIn = (i / samples) * 100;
    const tWarped = evaluateGraphAtTime(warpCurveKeyframes, tIn);
    const finalVal = evaluateGraphAtTime(baseKeyframes, tWarped);

    result.push({
      id: 7000 + i,
      time: tIn,
      value: Math.round(finalVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
