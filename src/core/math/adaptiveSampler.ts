/**
 * Recursive curvature-adaptive sampling algorithm.
 * Evaluates fn(t) over [t0, t1]. If the midpoint deviates from linear interpolation
 * by more than maxTolerance, recursively subdivides the interval.
 */
export function adaptiveSample(
  fn: (t: number) => number,
  t0 = 0,
  t1 = 1,
  maxTolerance = 0.5,
  maxDepth = 6,
  currentDepth = 0
): { t: number; v: number }[] {
  const v0 = fn(t0);
  const v1 = fn(t1);

  if (currentDepth >= maxDepth) {
    return [
      { t: t0, v: v0 },
      { t: t1, v: v1 },
    ];
  }

  const tMid = (t0 + t1) / 2;
  const vMid = fn(tMid);
  const vLinear = (v0 + v1) / 2;

  const error = Math.abs(vMid - vLinear);

  if (error > maxTolerance) {
    const left = adaptiveSample(fn, t0, tMid, maxTolerance, maxDepth, currentDepth + 1);
    const right = adaptiveSample(fn, tMid, t1, maxTolerance, maxDepth, currentDepth + 1);
    return [...left.slice(0, -1), ...right];
  }

  return [
    { t: t0, v: v0 },
    { t: t1, v: v1 },
  ];
}
