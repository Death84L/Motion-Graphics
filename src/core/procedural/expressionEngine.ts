import { KeyframePoint } from '../../features/graph-editor/types';
import { computeAutoTangents } from '../math/tangentMath';

export const POPULAR_EXPRESSIONS: { name: string; formula: string; desc: string }[] = [
  {
    name: 'Sine Wave Oscillation',
    formula: 'Math.sin((t / 100) * Math.PI * 4) * 40 + 50',
    desc: '4-cycle pure sinusoidal rhythm',
  },
  {
    name: 'Exponential Damped Decay',
    formula: '100 * (1 - Math.exp(-0.06 * t) * Math.cos(0.3 * t))',
    desc: 'Damped spring settle',
  },
  {
    name: 'Cubic Acceleration Curve',
    formula: '100 * Math.pow(t / 100, 3)',
    desc: 'Aggressive ease-in ramp',
  },
  {
    name: 'Pulse / Heartbeat',
    formula: '50 + 40 * Math.sin(t * 0.2) * Math.exp(-((t % 30) / 10))',
    desc: 'Rhythmic pulsing heartbeat spikes',
  },
];

/**
 * Evaluates a JavaScript math expression across t in [0, 100] and bakes into smooth keyframes.
 */
export function bakeExpressionToKeyframes(
  expressionFormula: string,
  sampleStep = 10
): KeyframePoint[] {
  const points: KeyframePoint[] = [];

  // Safe function execution sandbox
  let evalFn: (t: number) => number;
  try {
    evalFn = new Function('t', `with (Math) { return Number(${expressionFormula}); }`) as (t: number) => number;
  } catch (e) {
    evalFn = (t: number) => t;
  }

  for (let t = 0; t <= 100; t += sampleStep) {
    let v = 0;
    try {
      v = evalFn(t);
      if (isNaN(v)) v = t;
    } catch (err) {
      v = t;
    }

    points.push({
      id: 2000 + t,
      time: t,
      value: Math.round(v * 10) / 10,
      type: 'bezier',
      ease: 'easeInOut',
    });
  }

  // Compute smooth tangents
  return points.map((kf, i, arr) => {
    const prev = i > 0 ? arr[i - 1] : null;
    const next = i < arr.length - 1 ? arr[i + 1] : null;
    const { handleIn, handleOut } = computeAutoTangents(prev, kf, next, 0.33);
    return { ...kf, handleIn, handleOut, symmetrical: true };
  });
}
