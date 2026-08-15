export type GraphMode = 'value' | 'velocity' | 'speed' | 'acceleration' | 'jerk' | 'time-remap';

export type GraphTool = 'select' | 'pan' | 'keyframe' | 'bezier' | 'lasso' | 'draw';

export type GraphViewport = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
};

export type GraphGridConfig = {
  showMajorGrid: boolean;
  showMinorGrid: boolean;
  showZeroLine: boolean;
  showHalfLine: boolean;
  showTargetLine: boolean;
  targetValue: number;
  snapToGrid: boolean;
  frameStep: number;
  valueStep: number;
};

export type WorkArea = {
  inFrame: number;
  outFrame: number;
  enabled: boolean;
};

export type TransformBoxBounds = {
  minTime: number;
  maxTime: number;
  minValue: number;
  maxValue: number;
};
