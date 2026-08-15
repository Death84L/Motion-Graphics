import { KeyframePoint } from '../../features/graph-editor/types';

/**
 * Tests if point (px, py) is inside an axis-aligned bounding box.
 */
export function isPointInRect(
  px: number,
  py: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): boolean {
  return px >= minX && px <= maxX && py >= minY && py <= maxY;
}

/**
 * Standard Ray-casting algorithm for testing if point (px, py) is inside a polygon (lasso).
 */
export function isPointInPolygon(
  px: number,
  py: number,
  polygon: { x: number; y: number }[]
): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;

    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi || 0.0001) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Filters keyframes falling inside marquee bounding box in screen space.
 */
export function filterKeyframesInMarquee(
  keyframes: KeyframePoint[],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  toSvgPoint: (kf: KeyframePoint) => { x: number; y: number }
): number[] {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  return keyframes
    .filter((kf) => {
      const pt = toSvgPoint(kf);
      return isPointInRect(pt.x, pt.y, minX, minY, maxX, maxY);
    })
    .map((k) => k.id);
}

/**
 * Filters keyframes falling inside lasso polygon in screen space.
 */
export function filterKeyframesInLasso(
  keyframes: KeyframePoint[],
  lassoPoints: { x: number; y: number }[],
  toSvgPoint: (kf: KeyframePoint) => { x: number; y: number }
): number[] {
  return keyframes
    .filter((kf) => {
      const pt = toSvgPoint(kf);
      return isPointInPolygon(pt.x, pt.y, lassoPoints);
    })
    .map((k) => k.id);
}
