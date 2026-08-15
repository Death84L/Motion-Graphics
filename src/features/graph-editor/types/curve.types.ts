import { KeyframePoint, EasingType, BezierHandle } from './keyframe.types';

export interface CurveSegment {
  id: string;
  startIndex: number;
  endIndex: number;
  fromKeyframe: KeyframePoint;
  toKeyframe: KeyframePoint;
  ease: EasingType;
  handleOut?: BezierHandle;
  handleIn?: BezierHandle;
}

export interface CurveLayer {
  id: string;
  name: string;
  property: string;
  color: string;
  visible: boolean;
  locked: boolean;
  solo: boolean;
  keyframes: KeyframePoint[];
  ghostKeyframes?: KeyframePoint[];
  showGhost?: boolean;
  preExtrapolation?: 'constant' | 'linear' | 'cycle' | 'cycleOffset' | 'pingPong';
  postExtrapolation?: 'constant' | 'linear' | 'cycle' | 'cycleOffset' | 'pingPong';
}

export interface DerivativePoint {
  time: number;
  value: number;
  velocity: number;
  speed: number;
  acceleration: number;
}

export interface CurveBounds {
  minTime: number;
  maxTime: number;
  minValue: number;
  maxValue: number;
}
