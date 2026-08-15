import { KeyframePoint } from '../../features/graph-editor/types';
import { evaluateDerivativeAtTime } from '../derivatives/derivativeEvaluation';

export interface ContinuityBreak {
  time: number;
  order: 'C0' | 'C1' | 'C2' | 'C3';
  description: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Analyzes parametric continuity orders C0 (position), C1 (velocity), C2 (acceleration), and C3 (jerk).
 */
export function analyzeCurveContinuity(
  keyframes: KeyframePoint[],
  samples = 80
): { breaks: ContinuityBreak[]; isC0: boolean; isC1: boolean; isC2: boolean; isC3: boolean } {
  const breaks: ContinuityBreak[] = [];
  let isC0 = true;
  let isC1 = true;
  let isC2 = true;
  let isC3 = true;

  if (keyframes.length < 2) return { breaks, isC0, isC1, isC2, isC3 };

  for (let i = 1; i < samples; i++) {
    const t = (i / samples) * 100;
    const dPrev = evaluateDerivativeAtTime(keyframes, t - 0.5);
    const dNext = evaluateDerivativeAtTime(keyframes, t + 0.5);

    // C1 check: Velocity jump > 20 %/frame
    if (Math.abs(dNext.velocity - dPrev.velocity) > 20) {
      isC1 = false;
      breaks.push({
        time: t,
        order: 'C1',
        description: `Velocity discontinuity of ${(Math.abs(dNext.velocity - dPrev.velocity)).toFixed(1)}%/s`,
        severity: 'error',
      });
    }

    // C2 check: Acceleration jump > 35 %/frame²
    if (Math.abs(dNext.acceleration - dPrev.acceleration) > 35) {
      isC2 = false;
      breaks.push({
        time: t,
        order: 'C2',
        description: `Acceleration impulse step at ${t.toFixed(0)}f`,
        severity: 'warning',
      });
    }

    // C3 check: Jerk spike > 80 %/frame³
    if (Math.abs(dNext.jerk) > 80) {
      isC3 = false;
      breaks.push({
        time: t,
        order: 'C3',
        description: `Mechanical jerk impulse at ${t.toFixed(0)}f`,
        severity: 'info',
      });
    }
  }

  return { breaks, isC0, isC1, isC2, isC3 };
}
