import { CurveLayer, KeyframePoint } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';

export interface CurveDriverRelationship {
  id: string;
  driverLayerId: string;
  driverPropertyName: string;
  drivenLayerId: string;
  drivenPropertyName: string;
  multiplier: number; // e.g. 1.5x or -1.0x (invert)
  offset: number; // constant value shift
  timeLagFrames: number; // latency / follow delay
  clampMin?: number;
  clampMax?: number;
  expressionType?: 'linear' | 'inverse' | 'sinusoidal' | 'squared';
}

export const DEFAULT_DRIVERS: CurveDriverRelationship[] = [
  {
    id: 'drv-pos-rot',
    driverLayerId: 'layer-pos-x',
    driverPropertyName: 'Position X',
    drivenLayerId: 'layer-rot',
    drivenPropertyName: 'Rotation',
    multiplier: 1.8,
    offset: 0,
    timeLagFrames: 2,
    expressionType: 'linear',
  },
  {
    id: 'drv-scale-opac',
    driverLayerId: 'layer-scale',
    driverPropertyName: 'Scale',
    drivenLayerId: 'layer-opacity',
    drivenPropertyName: 'Opacity',
    multiplier: 1.0,
    offset: 0,
    timeLagFrames: 0,
    expressionType: 'linear',
  },
];

/**
 * Computes driven layer keyframes dynamically derived from driver source curve.
 */
export function computeDrivenCurve(
  driverKeyframes: KeyframePoint[],
  relation: CurveDriverRelationship,
  sampleSteps = 25
): KeyframePoint[] {
  const result: KeyframePoint[] = [];

  for (let i = 0; i <= sampleSteps; i++) {
    const t = (i / sampleSteps) * 100;
    const driverT = Math.max(0, Math.min(100, t - relation.timeLagFrames));
    const driverVal = evaluateGraphAtTime(driverKeyframes, driverT);

    let drivenVal = driverVal * relation.multiplier + relation.offset;

    if (relation.expressionType === 'inverse') {
      drivenVal = 100 - drivenVal;
    } else if (relation.expressionType === 'sinusoidal') {
      drivenVal = Math.sin((drivenVal / 100) * Math.PI) * 100;
    }

    if (relation.clampMin !== undefined) drivenVal = Math.max(relation.clampMin, drivenVal);
    if (relation.clampMax !== undefined) drivenVal = Math.min(relation.clampMax, drivenVal);

    result.push({
      id: 8500 + i,
      time: t,
      value: Math.round(drivenVal * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  return result;
}
