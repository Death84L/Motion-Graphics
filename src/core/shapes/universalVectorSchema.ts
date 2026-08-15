export type VectorShapeType =
  | 'rectangle'
  | 'rounded-rect'
  | 'circle'
  | 'ellipse'
  | 'star'
  | 'polygon'
  | 'diamond'
  | 'capsule'
  | 'heart'
  | 'ring'
  | 'burst'
  | 'custom-path';

export interface VectorPoint {
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

export interface VectorPathData {
  points: VectorPoint[];
  isClosed: boolean;
}

export interface VectorRepeaterConfig {
  count: number;
  radialRotationDeg: number;
  scaleStagger: number; // e.g. 0.95 per copy
  opacityStagger: number; // e.g. 0.9 per copy
}

export interface UniversalVectorShape {
  id: string;
  name: string;
  type: VectorShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  pointsCount: number; // For star, polygon, burst
  innerRadius: number; // For star / ring
  cornerRadius: number; // For rounded-rect
  rotationDeg: number;
  scale: number;
  opacity: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  trimStart: number; // 0.0 to 1.0 (write-on)
  trimEnd: number; // 0.0 to 1.0
  trimOffset: number; // 0.0 to 1.0
  morphRatio: number; // 0.0 (Shape A) to 1.0 (Shape B)
  repeater?: VectorRepeaterConfig;
}

export interface ShapeMorphPair {
  id: string;
  name: string;
  fromShape: VectorShapeType;
  toShape: VectorShapeType;
  description: string;
}

export const SAMPLE_SHAPE_MORPH_PAIRS: ShapeMorphPair[] = [
  { id: 'm1', name: 'Circle ➔ 5-Point Star', fromShape: 'circle', toShape: 'star', description: 'Smooth organic vertex expansion into a 5-point star.' },
  { id: 'm2', name: 'Rounded Rect ➔ Hexagon', fromShape: 'rounded-rect', toShape: 'polygon', description: 'Box deformation into geometric 6-sided polygon.' },
  { id: 'm3', name: 'Diamond ➔ Heart', fromShape: 'diamond', toShape: 'heart', description: 'Angular diamond curving into bezier organic heart.' },
];
