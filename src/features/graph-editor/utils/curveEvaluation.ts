import { KeyframePoint, CurveSegment } from '../types';
import { easingFunctions } from '../../easing/easingFunctions';
import { BezierCurve, SpringCurve, BounceCurve, StepCurve } from '../../../core/curves';

/**
 * Extracts all curve segments connecting adjacent keyframes.
 */
export function getCurveSegments(keyframes: KeyframePoint[]): CurveSegment[] {
  if (!keyframes || keyframes.length < 2) return [];

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const segments: CurveSegment[] = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];
    segments.push({
      id: `seg-${k1.id}-${k2.id}`,
      startIndex: i,
      endIndex: i + 1,
      fromKeyframe: k1,
      toKeyframe: k2,
      ease: k1.ease || 'easeInOut',
      handleOut: k1.handleOut,
      handleIn: k2.handleIn,
    });
  }

  return segments;
}

/**
 * Evaluates the curve value (0-100 scale or beyond) at any given time (0-100 scale).
 * Supports per-segment independent easing, custom Bezier handles, springs, bounces, holds, and steps.
 */
export function evaluateGraphAtTime(keyframes: KeyframePoint[], time: number): number {
  if (!keyframes || keyframes.length === 0) return 0;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) {
    return sorted[0].value;
  }
  if (time >= sorted[sorted.length - 1].time) {
    return sorted[sorted.length - 1].value;
  }

  // Find the bounding segment for time
  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];

    if (time >= k1.time && time <= k2.time) {
      const duration = k2.time - k1.time;
      if (duration === 0) return k1.value;

      const tNorm = (time - k1.time) / duration;
      const easeType = k1.ease || 'easeInOut';

      // 1. Hold Mode
      if (easeType === 'hold' || k1.type === 'hold') {
        return time < k2.time ? k1.value : k2.value;
      }

      // 2. Stepped Mode
      if (easeType === 'step' || k1.type === 'step') {
        const stepCurve = new StepCurve(k1.stepCount ?? 5, 'quantized');
        const progress = stepCurve.evaluate(tNorm);
        return k1.value + progress * (k2.value - k1.value);
      }

      // 3. Spring Physics Mode
      if (easeType === 'spring') {
        const spring = new SpringCurve(k1.springParams);
        const progress = spring.evaluate(tNorm);
        return k1.value + progress * (k2.value - k1.value);
      }

      // 4. Gravity Bounce Physics Mode
      if (easeType === 'bounce') {
        const bounce = new BounceCurve(k1.bounceParams);
        const progress = bounce.evaluate(tNorm);
        return k1.value + progress * (k2.value - k1.value);
      }

      // 5. Custom Bezier Handle Mode
      if (easeType === 'bezier' || k1.type === 'bezier') {
        const p0 = k1.value;
        const p1 = k1.value + (k1.handleOut ? k1.handleOut.y : 0);
        const p2 = k2.value + (k2.handleIn ? k2.handleIn.y : 0);
        const p3 = k2.value;

        // Extract normalized horizontal tangent influence x1, x2 in [0, 1]
        const dt = Math.max(k2.time - k1.time, 0.001);
        const rawX1 = k1.handleOut ? k1.handleOut.x / dt : 0.33;
        const rawX2 = k2.handleIn ? 1 + k2.handleIn.x / dt : 0.67;

        const x1 = Math.max(0.01, Math.min(0.99, rawX1));
        const x2 = Math.max(0.01, Math.min(0.99, rawX2));

        const bezier = new BezierCurve(p0, p1, p2, p3, x1, x2);
        return bezier.evaluate(tNorm);
      }

      // 6. Built-in Easing Functions
      const easeFn = easingFunctions[easeType] || easingFunctions.easeInOut;
      const progress = easeFn(tNorm);

      return k1.value + progress * (k2.value - k1.value);
    }
  }

  return sorted[sorted.length - 1].value;
}

/**
 * Builds a smooth high-resolution SVG path representation for the keyframes.
 */
export function generateSvgPath(
  keyframes: KeyframePoint[],
  toSvgPoint: (point: { time: number; value: number }) => { x: number; y: number },
  samplesPerSegment = 80
): string {
  if (!keyframes || keyframes.length === 0) return '';

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  if (sorted.length === 1) {
    const pt = toSvgPoint(sorted[0]);
    return `M ${pt.x} ${pt.y}`;
  }

  const pathSegments: string[] = [];
  const startPt = toSvgPoint(sorted[0]);
  pathSegments.push(`M ${startPt.x.toFixed(2)} ${startPt.y.toFixed(2)}`);

  for (let i = 0; i < sorted.length - 1; i++) {
    const k1 = sorted[i];
    const k2 = sorted[i + 1];

    if (k1.ease === 'hold' || k1.type === 'hold') {
      // Step line for hold
      const ptCorner = toSvgPoint({ time: k2.time, value: k1.value });
      const ptEnd = toSvgPoint(k2);
      pathSegments.push(`L ${ptCorner.x.toFixed(2)} ${ptCorner.y.toFixed(2)}`);
      pathSegments.push(`L ${ptEnd.x.toFixed(2)} ${ptEnd.y.toFixed(2)}`);
      continue;
    }

    // High density sampling for physics curves & smooth beziers
    const actualSamples =
      k1.ease === 'bounce' || k1.ease === 'spring' || k1.ease === 'elastic'
        ? Math.max(samplesPerSegment, 100)
        : samplesPerSegment;

    for (let s = 1; s <= actualSamples; s++) {
      const tNorm = s / actualSamples;
      const curTime = k1.time + tNorm * (k2.time - k1.time);
      const curVal = evaluateGraphAtTime(sorted, curTime);
      const svgPt = toSvgPoint({ time: curTime, value: curVal });
      pathSegments.push(`L ${svgPt.x.toFixed(2)} ${svgPt.y.toFixed(2)}`);
    }
  }

  return pathSegments.join(' ');
}
