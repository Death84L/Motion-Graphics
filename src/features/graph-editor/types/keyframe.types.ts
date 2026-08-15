export type Point = {
  x: number;
  y: number;
};

export type BezierHandle = {
  x: number; // relative offset in time (frames or units)
  y: number; // relative offset in value (%)
  angle?: number; // angle in degrees (-180 to 180)
  length?: number; // handle vector magnitude
};

export type KeyframeType = 'linear' | 'bezier' | 'auto' | 'hold' | 'step';

export type TangentType = 'auto' | 'linear' | 'flat' | 'continuous' | 'broken' | 'free';

export type EasingType =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'bounce'
  | 'elastic'
  | 'anticipate'
  | 'back'
  | 'cubic'
  | 'step'
  | 'bezier'
  | 'spring'
  | 'hold';

export interface SpringParams {
  stiffness: number; // default 120
  damping: number; // default 14
  mass: number; // default 1
  amplitude: number; // default 100
  frequency: number; // default 3.5
}

export interface BounceParams {
  bounces: number; // default 3
  decay: number; // default 0.65
  gravity: number; // default 9.8
}

export type KeyframePoint = {
  id: number;
  time: number; // 0 to 100 (% or frames)
  value: number; // 0 to 100 (or beyond)
  type?: KeyframeType; // 'linear' | 'bezier' | 'auto' | 'hold' | 'step'
  ease?: EasingType;
  tangentType?: TangentType;
  handleIn?: BezierHandle;
  handleOut?: BezierHandle;
  lockedAngle?: boolean;
  lockedLength?: boolean;
  symmetrical?: boolean;
  stepCount?: number; // for step easing
  springParams?: SpringParams;
  bounceParams?: BounceParams;
  selected?: boolean;
};

export type PreviewProperty =
  | 'translate-x'
  | 'translate-y'
  | 'scale'
  | 'rotate'
  | 'opacity'
  | 'morph';
