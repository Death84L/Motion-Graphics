import { KeyframePoint } from '../../features/graph-editor/types';
import { analyzeCurveContinuity, ContinuityBreak } from './continuityAnalyzer';
import { runCurveDiagnostics } from '../analysis/curveAnalysisOverlay';

export interface GraphHealthStatus {
  overallHealthScore: number; // 0-100
  c0Status: boolean;
  c1Status: boolean;
  c2Status: boolean;
  overshootCount: number;
  jerkSpikeCount: number;
  breaks: ContinuityBreak[];
}

/**
 * Computes live comprehensive health telemetry for the active graph.
 */
export function evaluateGraphHealth(keyframes: KeyframePoint[]): GraphHealthStatus {
  if (keyframes.length < 2) {
    return {
      overallHealthScore: 100,
      c0Status: true,
      c1Status: true,
      c2Status: true,
      overshootCount: 0,
      jerkSpikeCount: 0,
      breaks: [],
    };
  }

  const { breaks, isC0, isC1, isC2 } = analyzeCurveContinuity(keyframes, 60);
  const diags = runCurveDiagnostics(keyframes, 60);

  const overshootCount = diags.filter((d) => d.type === 'overshoot').length;
  const jerkSpikeCount = diags.filter((d) => d.type === 'jerk-spike').length;

  let penalty = 0;
  if (!isC1) penalty += 25;
  if (!isC2) penalty += 15;
  penalty += overshootCount * 10;
  penalty += jerkSpikeCount * 8;

  const overallHealthScore = Math.max(20, Math.min(100, 100 - penalty));

  return {
    overallHealthScore,
    c0Status: isC0,
    c1Status: isC1,
    c2Status: isC2,
    overshootCount,
    jerkSpikeCount,
    breaks,
  };
}
