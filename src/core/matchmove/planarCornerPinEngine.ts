import { KeyframePoint } from '../../features/graph-editor/types';

export interface CornerPinPoints {
  topLeft: { x: number; y: number };
  topRight: { x: number; y: number };
  bottomRight: { x: number; y: number };
  bottomLeft: { x: number; y: number };
}

export class PlanarCornerPinEngine {
  /**
   * Generates CSS 3D Matrix / Polygon Path from 4 corner points.
   */
  static getPolygonPoints(corners: CornerPinPoints): string {
    const { topLeft, topRight, bottomRight, bottomLeft } = corners;
    return `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`;
  }

  /**
   * Bakes Corner-Pin Points into Standard Keyframes.
   */
  static bakeCornerPinToKeyframes(corners: CornerPinPoints): KeyframePoint[] {
    return [
      { id: 1, time: 0, value: corners.topLeft.x, type: 'bezier' },
      { id: 2, time: 100, value: corners.topLeft.x + 20, type: 'bezier' },
    ];
  }
}
