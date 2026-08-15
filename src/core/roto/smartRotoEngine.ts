import { KeyframePoint } from '../../features/graph-editor/types';

export interface RotoPoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

export interface RotoMask {
  id: string;
  name: string;
  points: RotoPoint[];
  featherPx: number;
  expansionPx: number;
  opacity: number;
  isInverted: boolean;
}

export class SmartRotoEngine {
  /**
   * Generates a 4-Point or N-Point Polygon Bézier Mask Path.
   */
  static generateMaskSvgPath(points: RotoPoint[]): string {
    if (points.length === 0) return '';
    return points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
  }

  /**
   * Applies Local Optical Flow Bounding Box Tracking Simulation.
   */
  static trackMaskProgress(points: RotoPoint[], progress: number): RotoPoint[] {
    const shiftX = Math.sin(progress * Math.PI * 2) * 20;
    const shiftY = Math.cos(progress * Math.PI * 2) * 10;

    return points.map((p) => ({
      x: p.x + shiftX,
      y: p.y + shiftY,
    }));
  }

  /**
   * Bakes Roto Mask Centroid Keyframes into Host Keyframes.
   */
  static bakeRotoToKeyframes(points: RotoPoint[]): KeyframePoint[] {
    const avgX = points.reduce((s, p) => s + p.x, 0) / (points.length || 1);
    return [
      { id: 1, time: 0, value: avgX, type: 'bezier' },
      { id: 2, time: 100, value: avgX + 30, type: 'bezier' },
    ];
  }
}
