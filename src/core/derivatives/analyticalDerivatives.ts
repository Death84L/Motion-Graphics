/**
 * Evaluates the exact analytical 1st derivative (velocity dB/dt) of a 1D cubic Bezier curve.
 */
export function evaluateBezierVelocity(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const oneMinusT = 1 - t;
  return (
    3 * oneMinusT * oneMinusT * (p1 - p0) +
    6 * oneMinusT * t * (p2 - p1) +
    3 * t * t * (p3 - p2)
  );
}

/**
 * Evaluates the exact analytical 2nd derivative (acceleration d²B/dt²) of a 1D cubic Bezier curve.
 */
export function evaluateBezierAcceleration(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const oneMinusT = 1 - t;
  return 6 * oneMinusT * (p2 - 2 * p1 + p0) + 6 * t * (p3 - 2 * p2 + p1);
}

/**
 * Evaluates the exact analytical 3rd derivative (jerk d³B/dt³) of a 1D cubic Bezier curve.
 */
export function evaluateBezierJerk(
  p0: number,
  p1: number,
  p2: number,
  p3: number
): number {
  return 6 * (p3 - 3 * p2 + 3 * p1 - p0);
}
