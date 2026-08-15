import { DataPoint, InfographicConfig } from './chartSchema';
import { KeyframePoint } from '../../features/graph-editor/types';

export interface EvaluatedBarItem {
  label: string;
  currentValue: number;
  widthPercent: number;
  rank: number;
  color: string;
}

export class InfographicsEngine {
  /**
   * Evaluates Animated Bar Chart and Racing Bar Positions at normalized progress t (0.0 to 1.0).
   */
  static evaluateBars(
    data: DataPoint[],
    progress: number,
    isStaggered = true
  ): EvaluatedBarItem[] {
    const t = Math.max(0, Math.min(1, progress));
    const maxVal = Math.max(...data.map((d) => d.value), 1);

    const evaluated = data.map((item, idx) => {
      const delay = isStaggered ? idx * 0.12 : 0;
      const localT = Math.max(0, Math.min(1, (t - delay) / (1 - delay || 1)));
      // Spring smoothstep
      const smoothT = localT * localT * (3 - 2 * localT);

      const curVal = item.value * smoothT;
      return {
        label: item.label,
        currentValue: Math.round(curVal * 10) / 10,
        widthPercent: Math.round((curVal / maxVal) * 100 * 10) / 10,
        rank: 0,
        color: item.color,
      };
    });

    // Rank sort for racing bars
    const sorted = [...evaluated].sort((a, b) => b.currentValue - a.currentValue);
    sorted.forEach((item, rIdx) => {
      const orig = evaluated.find((e) => e.label === item.label);
      if (orig) orig.rank = rIdx;
    });

    return evaluated;
  }

  /**
   * Generates SVG Path Data for Animated Line Graphs.
   */
  static generateLinePath(
    data: DataPoint[],
    width: number,
    height: number,
    progress: number
  ): string {
    if (data.length === 0) return '';
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const stepX = width / Math.max(1, data.length - 1);

    const points = data.map((d, idx) => {
      const x = idx * stepX;
      const targetY = height - (d.value / maxVal) * (height * 0.8) - 10;
      // Animate growth from bottom
      const y = height - (height - targetY) * Math.min(1, progress * 1.2);
      return { x, y };
    });

    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  }

  /**
   * Bakes Infographic Motion into Standard Bézier Keyframes.
   */
  static bakeInfographicToKeyframes(data: DataPoint[], durationSec = 2.0): KeyframePoint[] {
    const keyframes: KeyframePoint[] = [];
    const samples = 10;

    for (let i = 0; i <= samples; i++) {
      const prog = i / samples;
      const bars = this.evaluateBars(data, prog, false);
      const avgVal = bars.reduce((sum, b) => sum + b.currentValue, 0) / (bars.length || 1);

      keyframes.push({
        id: 9900 + i,
        time: Math.round(prog * 100 * 10) / 10,
        value: Math.round(avgVal * 10) / 10,
        type: 'bezier',
        handleIn: { x: 0.2, y: avgVal },
        handleOut: { x: 0.2, y: avgVal },
      });
    }

    return keyframes;
  }
}
