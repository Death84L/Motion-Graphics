import {
  UniversalVectorShape,
  VectorPoint,
  VectorShapeType,
} from './universalVectorSchema';

export class VectorEngine {
  /**
   * Generates normalized vector sample points for any basic or parametric shape.
   */
  static getShapePoints(
    type: VectorShapeType,
    width = 100,
    height = 100,
    samples = 32,
    innerRadiusRatio = 0.45
  ): VectorPoint[] {
    const points: VectorPoint[] = [];
    const rx = width / 2;
    const ry = height / 2;

    switch (type) {
      case 'circle':
      case 'ellipse': {
        for (let i = 0; i < samples; i++) {
          const angle = (i / samples) * Math.PI * 2;
          points.push({
            x: Math.cos(angle) * rx,
            y: Math.sin(angle) * ry,
          });
        }
        break;
      }
      case 'star': {
        const numPoints = 5;
        for (let i = 0; i < samples; i++) {
          const angle = (i / samples) * Math.PI * 2;
          const starAngle = (i / samples) * numPoints * Math.PI * 2;
          const isOuter = (Math.cos(starAngle) + 1) / 2;
          const r = rx * (innerRadiusRatio + isOuter * (1 - innerRadiusRatio));
          points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
          });
        }
        break;
      }
      case 'polygon': {
        const sides = 6;
        for (let i = 0; i < samples; i++) {
          const angle = (i / samples) * Math.PI * 2;
          const segAngle = Math.PI / sides;
          const modAngle = Math.abs((angle % (2 * segAngle)) - segAngle);
          const r = rx * Math.cos(segAngle) / Math.cos(modAngle);
          points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
          });
        }
        break;
      }
      case 'heart': {
        for (let i = 0; i < samples; i++) {
          const t = (i / samples) * Math.PI * 2;
          // Parametric heart formula
          const x = (16 * Math.pow(Math.sin(t), 3)) * (rx / 16);
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * (ry / 16);
          points.push({ x, y });
        }
        break;
      }
      case 'diamond': {
        for (let i = 0; i < samples; i++) {
          const angle = (i / samples) * Math.PI * 2;
          const r = rx / (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)));
          points.push({
            x: Math.cos(angle) * r,
            y: Math.sin(angle) * r,
          });
        }
        break;
      }
      case 'rectangle':
      case 'rounded-rect':
      default: {
        for (let i = 0; i < samples; i++) {
          const angle = (i / samples) * Math.PI * 2;
          const r = Math.min(rx / Math.abs(Math.cos(angle) || 0.001), ry / Math.abs(Math.sin(angle) || 0.001));
          points.push({
            x: Math.cos(angle) * Math.min(r, rx),
            y: Math.sin(angle) * Math.min(r, ry),
          });
        }
        break;
      }
    }

    return points;
  }

  /**
   * Continuous Vector Path Morphing (0.0 to 1.0) between Shape A and Shape B.
   */
  static morphShapes(
    fromType: VectorShapeType,
    toType: VectorShapeType,
    morphRatio: number,
    width = 100,
    height = 100,
    samples = 32
  ): VectorPoint[] {
    const pointsA = this.getShapePoints(fromType, width, height, samples);
    const pointsB = this.getShapePoints(toType, width, height, samples);
    const w = Math.max(0, Math.min(1, morphRatio));

    return pointsA.map((ptA, idx) => {
      const ptB = pointsB[idx] || ptA;
      return {
        x: ptA.x * (1 - w) + ptB.x * w,
        y: ptA.y * (1 - w) + ptB.y * w,
      };
    });
  }

  /**
   * Converts an array of vector points into an SVG Path String (`d` attribute).
   */
  static pointsToSvgPath(points: VectorPoint[], isClosed = true): string {
    if (points.length === 0) return '';
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x.toFixed(2)} ${points[i].y.toFixed(2)}`;
    }

    if (isClosed) {
      d += ' Z';
    }
    return d;
  }
}
