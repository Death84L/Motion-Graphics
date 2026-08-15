import { KeyframePoint } from '../../features/graph-editor/types';

export interface PolishConfig {
  addAnticipation: boolean;
  addOvershoot: boolean;
  smoothJitter: boolean;
  dampingFactor: number;
}

export class LocalProceduralAssistant {
  /**
   * 1-Click Professional Motion Polish Optimizer
   * Enhances raw keyframes by injecting subtle anticipation wind-up and physical overshoot decay.
   */
  static polishMotionKeyframes(
    keyframes: KeyframePoint[],
    config: PolishConfig = { addAnticipation: true, addOvershoot: true, smoothJitter: true, dampingFactor: 0.8 }
  ): KeyframePoint[] {
    if (keyframes.length < 2) return keyframes;
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    const start = sorted[0];
    const end = sorted[sorted.length - 1];
    const totalDuration = end.time - start.time || 1;
    const deltaVal = end.value - start.value;

    const polished: KeyframePoint[] = [];

    // 1. Initial Start Key
    polished.push({ ...start, type: 'bezier', handleOut: { x: 0.2, y: start.value } });

    // 2. Anticipation Wind-Up (-6% in opposite direction at 12% time)
    if (config.addAnticipation && Math.abs(deltaVal) > 10) {
      polished.push({
        id: 91001,
        time: Math.round((start.time + totalDuration * 0.12) * 10) / 10,
        value: Math.round((start.value - deltaVal * 0.06) * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.2, y: start.value },
        handleOut: { x: 0.2, y: start.value },
      });
    }

    // 3. Fast Main Surge Point (85% value at 60% time)
    polished.push({
      id: 91002,
      time: Math.round((start.time + totalDuration * 0.6) * 10) / 10,
      value: Math.round((start.value + deltaVal * 0.85) * 10) / 10,
      type: 'bezier',
      handleIn: { x: 0.2, y: start.value + deltaVal * 0.85 },
      handleOut: { x: 0.2, y: start.value + deltaVal * 0.85 },
    });

    // 4. Physical Overshoot (+8% beyond target at 82% time)
    if (config.addOvershoot && Math.abs(deltaVal) > 10) {
      polished.push({
        id: 91003,
        time: Math.round((start.time + totalDuration * 0.82) * 10) / 10,
        value: Math.round((end.value + deltaVal * 0.08 * config.dampingFactor) * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.2, y: end.value + deltaVal * 0.08 },
        handleOut: { x: 0.2, y: end.value + deltaVal * 0.08 },
      });
    }

    // 5. Final Settle Key
    polished.push({ ...end, type: 'bezier', handleIn: { x: 0.2, y: end.value } });

    return polished;
  }

  /**
   * Evaluates Motion DNA Cohesion Score (0 to 100) across all layer curves in a project.
   */
  static evaluateMotionCohesion(curves: KeyframePoint[][]): { score: number; recommendations: string[] } {
    if (curves.length <= 1) return { score: 98, recommendations: ['Project motion is harmonious.'] };

    let totalDurationVariance = 0;
    const durations = curves.map((c) => {
      const s = [...c].sort((a, b) => a.time - b.time);
      return (s[s.length - 1]?.time || 0) - (s[0]?.time || 0);
    });

    const avgDuration = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
    durations.forEach((d) => {
      totalDurationVariance += Math.abs(d - avgDuration);
    });

    const normalizedVar = totalDurationVariance / (durations.length || 1);
    const score = Math.max(65, Math.min(100, Math.round(100 - normalizedVar * 0.4)));

    const recommendations: string[] = [];
    if (score < 85) {
      recommendations.push('Align transition durations across related layers for tighter cohesion.');
      recommendations.push('Apply living parametric presets to standardize spring damping ratios.');
    } else {
      recommendations.push('Cohesive kinematic physics across all animation tracks.');
    }

    return { score, recommendations };
  }

  /**
   * Text Contrast Auto-Enhancer
   * Computes optimal font text fill and drop-shadow opacity based on background luma.
   */
  static getOptimalTextStyles(bgLumaR: number, bgLumaG: number, bgLumaB: number): {
    textColor: string;
    shadowColor: string;
    shadowBlur: number;
    recommendedWeight: number;
  } {
    const luma = (0.2126 * bgLumaR + 0.7152 * bgLumaG + 0.0722 * bgLumaB) / 255;
    if (luma > 0.55) {
      // Light background: Use crisp dark typography
      return {
        textColor: '#090e1a',
        shadowColor: 'rgba(255, 255, 255, 0.4)',
        shadowBlur: 2,
        recommendedWeight: 800,
      };
    } else {
      // Dark background: Use bright glowing typography
      return {
        textColor: '#f8fafc',
        shadowColor: 'rgba(56, 189, 248, 0.6)',
        shadowBlur: 8,
        recommendedWeight: 700,
      };
    }
  }
}
