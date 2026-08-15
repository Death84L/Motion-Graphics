import { KeyframePoint } from '../../features/graph-editor/types';
import { runCurveDiagnostics, CurveDiagnosticIssue } from './curveAnalysisOverlay';
import { smoothKeyframes } from '../math/smoothingAlgorithms';
import { computeAutoTangents } from '../math/tangentMath';

export interface MotionQualityReport {
  overallScore: number;
  smoothness: number;
  continuity: number;
  overshootControl: number;
  accelerationBalance: number;
  jerkScore: number;
  issues: CurveDiagnosticIssue[];
  suggestions: { id: string; title: string; actionType: 'smooth' | 'clamp-overshoot' | 'auto-tangents' }[];
}

/**
 * Evaluates the 0-100 Motion Quality Score of a curve and generates motion-debugging diagnostics.
 */
export function evaluateMotionQuality(keyframes: KeyframePoint[]): MotionQualityReport {
  if (keyframes.length < 2) {
    return {
      overallScore: 100,
      smoothness: 100,
      continuity: 100,
      overshootControl: 100,
      accelerationBalance: 100,
      jerkScore: 100,
      issues: [],
      suggestions: [],
    };
  }

  const issues = runCurveDiagnostics(keyframes, 80);

  const jerkIssues = issues.filter((i) => i.type === 'jerk-spike').length;
  const discontIssues = issues.filter((i) => i.type === 'discontinuity').length;
  const overshootIssues = issues.filter((i) => i.type === 'overshoot').length;

  const jerkScore = Math.max(30, Math.min(100, 100 - jerkIssues * 14));
  const continuity = Math.max(25, Math.min(100, 100 - discontIssues * 20));
  const overshootControl = overshootIssues > 0 ? 75 : 98;
  const smoothness = Math.round((jerkScore + continuity) / 2);
  const accelerationBalance = Math.max(40, Math.min(100, 95 - jerkIssues * 8));

  const overallScore = Math.round(
    smoothness * 0.3 + continuity * 0.25 + overshootControl * 0.15 + accelerationBalance * 0.15 + jerkScore * 0.15
  );

  const suggestions: { id: string; title: string; actionType: 'smooth' | 'clamp-overshoot' | 'auto-tangents' }[] = [];

  if (jerkIssues > 0) {
    suggestions.push({
      id: 'fix-jerk',
      title: `Reduce Jerk & Soften Impulses (${jerkIssues} detected)`,
      actionType: 'smooth',
    });
  }

  if (discontIssues > 0) {
    suggestions.push({
      id: 'fix-tangents',
      title: 'Auto-Solve Tangents to Fix Velocity Discontinuities',
      actionType: 'auto-tangents',
    });
  }

  if (overshootIssues > 0) {
    suggestions.push({
      id: 'fix-overshoot',
      title: 'Clamp Overshoot to 0–100% Boundary',
      actionType: 'clamp-overshoot',
    });
  }

  return {
    overallScore,
    smoothness,
    continuity,
    overshootControl,
    accelerationBalance,
    jerkScore,
    issues,
    suggestions,
  };
}

/**
 * Applies automated quick fixes based on motion quality suggestions.
 */
export function applyMotionQuickFix(
  keyframes: KeyframePoint[],
  actionType: 'smooth' | 'clamp-overshoot' | 'auto-tangents'
): KeyframePoint[] {
  if (actionType === 'smooth') {
    return smoothKeyframes(keyframes, 1);
  }

  if (actionType === 'clamp-overshoot') {
    return keyframes.map((k) => ({
      ...k,
      value: Math.max(0, Math.min(100, k.value)),
      handleIn: k.handleIn ? { ...k.handleIn, y: 0 } : undefined,
      handleOut: k.handleOut ? { ...k.handleOut, y: 0 } : undefined,
    }));
  }

  if (actionType === 'auto-tangents') {
    return keyframes.map((kf, i, arr) => {
      const prev = i > 0 ? arr[i - 1] : null;
      const next = i < arr.length - 1 ? arr[i + 1] : null;
      const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);
      return {
        ...kf,
        handleIn,
        handleOut,
        symmetrical: true,
      };
    });
  }

  return keyframes;
}
