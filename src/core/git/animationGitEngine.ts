import { KeyframePoint } from '../../features/graph-editor/types';
import { extractMotionProfile } from '../math/motionMatchingEngine';

export interface MotionBranch {
  id: string;
  name: string;
  author: string;
  createdAt: number;
  keyframes: KeyframePoint[];
}

export interface MotionDiffReport {
  durationDeltaMs: number;
  energyDelta: number;
  overshootDeltaPercent: number;
  peakVelocityDelta: number;
  summary: string;
}

/**
 * Calculates a Git-like semantic motion diff comparing two keyframe animation versions.
 */
export function calculateMotionDiff(
  keyframesA: KeyframePoint[],
  keyframesB: KeyframePoint[]
): MotionDiffReport {
  const profA = extractMotionProfile(keyframesA);
  const profB = extractMotionProfile(keyframesB);

  const durDelta = Math.round((profB.duration - profA.duration) * 1000);
  const energyDelta = profB.energyScore - profA.energyScore;
  const overshootDelta = profB.overshootPercent - profA.overshootPercent;
  const velDelta = Math.round((profB.peakVelocity - profA.peakVelocity) * 10) / 10;

  const summary = `Branch diff: Duration ${durDelta >= 0 ? '+' : ''}${durDelta}ms, Energy ${energyDelta >= 0 ? '+' : ''}${energyDelta}, Overshoot ${overshootDelta >= 0 ? '+' : ''}${overshootDelta}%, Peak Velocity ${velDelta >= 0 ? '+' : ''}${velDelta} units/s.`;

  return {
    durationDeltaMs: durDelta,
    energyDelta,
    overshootDeltaPercent: overshootDelta,
    peakVelocityDelta: velDelta,
    summary,
  };
}

export class AnimationGitManager {
  private branches: Map<string, MotionBranch> = new Map();
  private activeBranchId = 'main';

  constructor(initialKeyframes: KeyframePoint[] = []) {
    this.createBranch('main', initialKeyframes, 'Initial Animation');
  }

  createBranch(branchName: string, keyframes: KeyframePoint[], author = 'Designer'): MotionBranch {
    const branch: MotionBranch = {
      id: branchName,
      name: branchName,
      author,
      createdAt: Date.now(),
      keyframes: JSON.parse(JSON.stringify(keyframes)),
    };
    this.branches.set(branchName, branch);
    return branch;
  }

  getBranches(): MotionBranch[] {
    return Array.from(this.branches.values());
  }

  getActiveBranch(): MotionBranch | undefined {
    return this.branches.get(this.activeBranchId);
  }

  switchBranch(branchName: string): MotionBranch | undefined {
    if (this.branches.has(branchName)) {
      this.activeBranchId = branchName;
      return this.branches.get(branchName);
    }
    return undefined;
  }
}
