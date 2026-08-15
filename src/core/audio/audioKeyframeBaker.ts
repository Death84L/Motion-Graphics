import { KeyframePoint } from '../../features/graph-editor/types';
import { SpectralAnalysisFrame } from './audioReactiveEngine';
import {
  AudioModulationBinding,
  AudioModulationGraphEngine,
  TargetMotionPropertyId,
} from './audioModulationGraph';

export class AudioKeyframeBaker {
  /**
   * Bakes audio spectral analysis frames into discrete Bézier animation keyframes.
   */
  static bakeAudioToKeyframes(
    frames: SpectralAnalysisFrame[],
    binding: AudioModulationBinding,
    fps = 60,
    simplifyTolerance = 0.5
  ): KeyframePoint[] {
    const rawPoints: { time: number; value: number }[] = [];

    frames.forEach((f, idx) => {
      const time = (idx / fps) * 100; // Normalized 0-100 timeline space
      const evaluated = AudioModulationGraphEngine.evaluateModulation(f, [binding]);
      rawPoints.push({
        time: Math.round(time * 10) / 10,
        value: evaluated[binding.targetProperty] ?? binding.minOutput,
      });
    });

    // Simplify curve with tolerance
    const simplified = this.simplifyCurve(rawPoints, simplifyTolerance);

    return simplified.map((pt, idx) => ({
      id: 9500 + idx,
      time: pt.time,
      value: pt.value,
      type: 'bezier',
      handleIn: { x: 0.25, y: pt.value },
      handleOut: { x: 0.25, y: pt.value },
    }));
  }

  /**
   * Ramer-Douglas-Peucker 1D/2D curve simplification algorithm.
   */
  private static simplifyCurve(
    points: { time: number; value: number }[],
    tolerance: number
  ): { time: number; value: number }[] {
    if (points.length <= 2) return points;

    let maxDist = 0;
    let maxIdx = 0;
    const start = points[0];
    const end = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i++) {
      const pt = points[i];
      // Perpendicular distance to line (start -> end)
      const dist = Math.abs(
        (end.value - start.value) * pt.time -
          (end.time - start.time) * pt.value +
          end.time * start.value -
          end.value * start.time
      ) / Math.sqrt(Math.pow(end.value - start.value, 2) + Math.pow(end.time - start.time, 2) || 1);

      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > tolerance) {
      const left = this.simplifyCurve(points.slice(0, maxIdx + 1), tolerance);
      const right = this.simplifyCurve(points.slice(maxIdx), tolerance);
      return [...left.slice(0, left.length - 1), ...right];
    } else {
      return [start, end];
    }
  }
}
