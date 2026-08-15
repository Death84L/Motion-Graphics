import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface FollowerMotionConfig {
  delayFrames: number; // e.g. 5
  damping: number; // e.g. 0.85
  elasticity: number; // e.g. 0.2
  offsetValue: number; // e.g. 0
}

/**
 * Creates delayed, damped follower motion tracking a leader curve.
 */
export function generateFollowerCurve(
  leaderKeyframes: KeyframePoint[],
  config: FollowerMotionConfig,
  samples = 60
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * 100;
    const delayedTime = Math.max(0, t - config.delayFrames);
    const leaderVal = evaluateGraphAtTime(leaderKeyframes, delayedTime);

    const followerVal = leaderVal * config.damping + config.offsetValue;

    result.push({
      id: 12000 + i,
      time: t,
      value: Math.round(followerVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
