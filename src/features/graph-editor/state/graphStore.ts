import { GraphViewport, KeyframePoint, CurveLayer, GraphGridConfig } from '../types';

export const INITIAL_CURVE_LAYERS: CurveLayer[] = [
  {
    id: 'layer-pos-x',
    name: 'Position X',
    property: 'translate-x',
    color: '#38bdf8', // Sky Blue
    visible: true,
    locked: false,
    solo: false,
    keyframes: [
      { id: 1, time: 10, value: 20, type: 'bezier', ease: 'easeInOut', handleOut: { x: 15, y: 0, angle: 0, length: 15 } },
      { id: 2, time: 38, value: 85, type: 'bezier', ease: 'easeOut', handleIn: { x: -10, y: 15, angle: 125, length: 18 }, handleOut: { x: 12, y: -20, angle: -60, length: 23 } },
      { id: 3, time: 68, value: 35, type: 'bezier', ease: 'easeInOut', handleIn: { x: -12, y: -10, angle: -140, length: 16 }, handleOut: { x: 10, y: 25, angle: 70, length: 27 } },
      { id: 4, time: 92, value: 95, type: 'bezier', ease: 'easeOut', handleIn: { x: -15, y: 10, angle: 145, length: 18 } },
    ],
    showGhost: true,
    ghostKeyframes: [
      { id: 1, time: 10, value: 20, ease: 'easeInOut' },
      { id: 2, time: 38, value: 85, ease: 'easeOut' },
      { id: 3, time: 68, value: 35, ease: 'easeInOut' },
      { id: 4, time: 92, value: 95, ease: 'easeOut' },
    ],
  },
  {
    id: 'layer-scale',
    name: 'Scale Uniform',
    property: 'scale',
    color: '#a855f7', // Purple
    visible: false,
    locked: false,
    solo: false,
    keyframes: [
      { id: 101, time: 0, value: 40, type: 'bezier', ease: 'easeInOut' },
      { id: 102, time: 50, value: 110, type: 'bezier', ease: 'easeInOut' },
      { id: 103, time: 100, value: 100, type: 'bezier', ease: 'bounce' },
    ],
    showGhost: false,
  },
  {
    id: 'layer-rotation',
    name: 'Rotation Angle',
    property: 'rotate',
    color: '#10b981', // Emerald Green
    visible: false,
    locked: false,
    solo: false,
    keyframes: [
      { id: 201, time: 0, value: 0, type: 'linear', ease: 'linear' },
      { id: 202, time: 100, value: 100, type: 'linear', ease: 'linear' },
    ],
    showGhost: false,
  },
];

export const DEFAULT_GRID_CONFIG: GraphGridConfig = {
  showMajorGrid: true,
  showMinorGrid: true,
  showZeroLine: true,
  showHalfLine: true,
  showTargetLine: true,
  targetValue: 100,
  snapToGrid: false,
  frameStep: 10,
  valueStep: 25,
};

export const DEFAULT_VIEWPORT: GraphViewport = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
};
