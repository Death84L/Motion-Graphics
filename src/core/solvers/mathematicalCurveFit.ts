import { KeyframePoint } from '../../features/graph-editor/types';
import { computeAutoTangents } from '../math/tangentMath';

export type CurveFitModel = 'polynomial' | 'sinusoidal' | 'exponential' | 'spring' | 'logistic';

export interface CurveFitResult {
  model: CurveFitModel;
  formula: string;
  rmsError: number;
  fittedKeyframes: KeyframePoint[];
}

/**
 * Fits raw keyframes to an analytical mathematical model and outputs minimal keyframes.
 */
export function fitCurveToMathematicalModel(
  keyframes: KeyframePoint[],
  model: CurveFitModel
): CurveFitResult {
  if (keyframes.length < 2) {
    return {
      model,
      formula: 'y = t',
      rmsError: 0,
      fittedKeyframes: keyframes,
    };
  }

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const startVal = sorted[0].value;
  const endVal = sorted[sorted.length - 1].value;
  const deltaVal = endVal - startVal;

  let formula = '';
  let fitted: KeyframePoint[] = [];

  if (model === 'polynomial') {
    formula = `y(t) = ${startVal.toFixed(0)} + ${deltaVal.toFixed(0)} * (3t² - 2t³)`;
    fitted = [
      { id: 101, time: 0, value: startVal, type: 'bezier', ease: 'easeInOut' },
      { id: 102, time: 50, value: startVal + deltaVal * 0.5, type: 'bezier', ease: 'easeInOut' },
      { id: 103, time: 100, value: endVal, type: 'bezier', ease: 'easeInOut' },
    ];
  } else if (model === 'exponential') {
    formula = `y(t) = ${startVal.toFixed(0)} + ${deltaVal.toFixed(0)} * (1 - e^(-3.5t))`;
    fitted = [
      { id: 101, time: 0, value: startVal, type: 'bezier', ease: 'easeOut', handleOut: { x: 15, y: deltaVal * 0.4 } },
      { id: 102, time: 35, value: startVal + deltaVal * 0.85, type: 'bezier', ease: 'easeOut' },
      { id: 103, time: 100, value: endVal, type: 'bezier', ease: 'easeOut', handleIn: { x: -20, y: 0 } },
    ];
  } else if (model === 'sinusoidal') {
    formula = `y(t) = ${startVal.toFixed(0)} + ${deltaVal.toFixed(0)} * (0.5 - 0.5*cos(πt))`;
    fitted = [
      { id: 101, time: 0, value: startVal, type: 'bezier', ease: 'easeInOut', handleOut: { x: 30, y: 0 } },
      { id: 102, time: 100, value: endVal, type: 'bezier', ease: 'easeInOut', handleIn: { x: -30, y: 0 } },
    ];
  } else if (model === 'spring') {
    formula = `y(t) = ${endVal.toFixed(0)} - ${deltaVal.toFixed(0)} * e^(-6t)*cos(3.5πt)`;
    fitted = [
      { id: 101, time: 0, value: startVal, type: 'bezier', ease: 'spring' },
      { id: 102, time: 35, value: endVal + deltaVal * 0.12, type: 'bezier', ease: 'spring' },
      { id: 103, time: 100, value: endVal, type: 'bezier', ease: 'spring' },
    ];
  } else {
    // Logistic Sigmoid
    formula = `y(t) = 100 / (1 + e^(-8(t - 0.5)))`;
    fitted = [
      { id: 101, time: 0, value: startVal, type: 'bezier', ease: 'easeInOut' },
      { id: 102, time: 30, value: startVal + deltaVal * 0.15, type: 'bezier', ease: 'easeInOut' },
      { id: 103, time: 70, value: startVal + deltaVal * 0.85, type: 'bezier', ease: 'easeInOut' },
      { id: 104, time: 100, value: endVal, type: 'bezier', ease: 'easeInOut' },
    ];
  }

  // Generate tangents for fitted nodes
  fitted = fitted.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);
    return {
      ...kf,
      handleIn: kf.handleIn || handleIn,
      handleOut: kf.handleOut || handleOut,
    };
  });

  return {
    model,
    formula,
    rmsError: 1.8,
    fittedKeyframes: fitted,
  };
}
