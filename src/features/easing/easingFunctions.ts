import { EasingType } from '../graph-editor/types';

export interface EasingPreset {
  id: EasingType;
  name: string;
  category: string;
  description: string;
  fn: (t: number) => number;
  cubicBezier?: [number, number, number, number]; // [x1, y1, x2, y2]
}

export const easingFunctions: Record<EasingType, (t: number) => number> = {
  linear: (t: number) => t,

  ease: (t: number) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  easeIn: (t: number) => t * t * t,

  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),

  easeInOut: (t: number) => {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    let x = t;

    if (x < 1 / d1) {
      return n1 * x * x;
    } else if (x < 2 / d1) {
      return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
      return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
      return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
  },

  elastic: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  spring: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    const decay = Math.exp(-6 * t);
    return 1 - decay * Math.cos(t * Math.PI * 3.5);
  },

  anticipate: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },

  back: (t: number) => {
    const s = 1.70158;
    const x = t - 1;
    return x * x * ((s + 1) * x + s) + 1;
  },

  cubic: (t: number) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  },

  step: (t: number) => {
    return t >= 1 ? 1 : Math.floor(t * 5) / 5;
  },

  hold: (t: number) => {
    return t >= 1 ? 1 : 0;
  },

  bezier: (t: number) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },
};

export const easingPresetsList: EasingPreset[] = [
  {
    id: 'bounce',
    name: 'Bounce Out',
    category: 'Physics',
    description: 'Realistic gravity bounce settling with decaying arcs',
    fn: easingFunctions.bounce,
  },
  {
    id: 'spring',
    name: 'Harmonic Spring',
    category: 'Physics',
    description: 'Damped spring oscillation with rapid settling',
    fn: easingFunctions.spring,
  },
  {
    id: 'elastic',
    name: 'Elastic Wave',
    category: 'Physics',
    description: 'Springy oscillation with decaying tension',
    fn: easingFunctions.elastic,
  },
  {
    id: 'easeInOut',
    name: 'Ease In-Out',
    category: 'Smooth',
    description: 'Slow start, fast middle, smooth stop',
    fn: easingFunctions.easeInOut,
    cubicBezier: [0.65, 0, 0.35, 1],
  },
  {
    id: 'easeOut',
    name: 'Ease Out (Cubic)',
    category: 'Deceleration',
    description: 'Starts fast and settles smoothly',
    fn: easingFunctions.easeOut,
    cubicBezier: [0.33, 1, 0.68, 1],
  },
  {
    id: 'easeIn',
    name: 'Ease In (Cubic)',
    category: 'Acceleration',
    description: 'Starts slow and accelerates fast',
    fn: easingFunctions.easeIn,
    cubicBezier: [0.32, 0, 0.67, 0],
  },
  {
    id: 'anticipate',
    name: 'Anticipate / Back',
    category: 'Expressive',
    description: 'Pulls back slightly before rushing forward',
    fn: easingFunctions.anticipate,
    cubicBezier: [0.36, 0, 0.66, -0.56],
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'Standard',
    description: 'Constant speed throughout motion',
    fn: easingFunctions.linear,
    cubicBezier: [0, 0, 1, 1],
  },
  {
    id: 'step',
    name: 'Stepped (5 Steps)',
    category: 'Discrete',
    description: 'Quantized stepped motion for retro stylings',
    fn: easingFunctions.step,
  },
  {
    id: 'hold',
    name: 'Hold Keyframe',
    category: 'Discrete',
    description: 'Maintains static value until the next keyframe',
    fn: easingFunctions.hold,
  },
];
