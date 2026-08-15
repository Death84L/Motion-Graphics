/**
 * Industry-Standard Parametric 2D Cubic Bezier Solver (as used in After Effects, CSS, Chromium & Figma).
 * Parameterized by u in [0, 1]:
 *   X(u) = (1-u)³ x0 + 3(1-u)² u x1 + 3(1-u) u² x2 + u³ x3
 *   Y(u) = (1-u)³ y0 + 3(1-u)² u y1 + 3(1-u) u² y2 + u³ y3
 */
export class CubicBezierSolver {
  private cx: number;
  private bx: number;
  private ax: number;

  private cy: number;
  private by: number;
  private ay: number;

  constructor(
    public x1: number,
    public y1: number,
    public x2: number,
    public y2: number
  ) {
    // Polynomial coefficients for X(u) where x0=0, x3=1
    this.cx = 3 * this.x1;
    this.bx = 3 * (this.x2 - this.x1) - this.cx;
    this.ax = 1 - this.cx - this.bx;

    // Polynomial coefficients for Y(u) where y0=0, y3=1
    this.cy = 3 * this.y1;
    this.by = 3 * (this.y2 - this.y1) - this.cy;
    this.ay = 1 - this.cy - this.by;
  }

  /** Evaluates X(u) */
  public sampleCurveX(u: number): number {
    return ((this.ax * u + this.bx) * u + this.cx) * u;
  }

  /** Evaluates Y(u) */
  public sampleCurveY(u: number): number {
    return ((this.ay * u + this.by) * u + this.cy) * u;
  }

  /** Evaluates dX/du */
  public sampleDerivativeX(u: number): number {
    return (3 * this.ax * u + 2 * this.bx) * u + this.cx;
  }

  /** Evaluates dY/du */
  public sampleDerivativeY(u: number): number {
    return (3 * this.ay * u + 2 * this.by) * u + this.cy;
  }

  /** Evaluates d²X/du² */
  public sampleSecondDerivativeX(u: number): number {
    return 6 * this.ax * u + 2 * this.bx;
  }

  /** Evaluates d²Y/du² */
  public sampleSecondDerivativeY(u: number): number {
    return 6 * this.ay * u + 2 * this.by;
  }

  /**
   * Solves for parameter u given normalized time t in [0, 1] using Newton-Raphson with bisection fallback.
   */
  public solveCurveX(t: number, epsilon = 1e-6): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // First try 8 iterations of Newton-Raphson for rapid convergence
    let u = t;
    for (let i = 0; i < 8; i++) {
      const xEst = this.sampleCurveX(u) - t;
      if (Math.abs(xEst) < epsilon) return u;
      const dx = this.sampleDerivativeX(u);
      if (Math.abs(dx) < 1e-6) break;
      u -= xEst / dx;
      if (u < 0 || u > 1) break;
    }

    // Fallback to binary bisection search
    let u0 = 0.0;
    let u1 = 1.0;
    u = t;

    while (u0 < u1) {
      const xEst = this.sampleCurveX(u);
      if (Math.abs(xEst - t) < epsilon) return u;
      if (t > xEst) u0 = u;
      else u1 = u;
      u = (u1 + u0) * 0.5;
    }

    return u;
  }

  /**
   * Evaluates normalized curve output Y at normalized time t in [0, 1].
   */
  public solve(t: number): number {
    const u = this.solveCurveX(t);
    return this.sampleCurveY(u);
  }

  /**
   * Evaluates exact instantaneous velocity dY/dt = (dY/du) / (dX/du).
   */
  public solveVelocity(t: number): number {
    const u = this.solveCurveX(t);
    const dx = this.sampleDerivativeX(u);
    const dy = this.sampleDerivativeY(u);
    return Math.abs(dx) > 1e-5 ? dy / dx : 0;
  }

  /**
   * Evaluates exact instantaneous acceleration d²Y/dt² = (Y'' X' - Y' X'') / (X')³.
   */
  public solveAcceleration(t: number): number {
    const u = this.solveCurveX(t);
    const dx = this.sampleDerivativeX(u);
    const dy = this.sampleDerivativeY(u);
    const d2x = this.sampleSecondDerivativeX(u);
    const d2y = this.sampleSecondDerivativeY(u);

    const denom = dx * dx * dx;
    return Math.abs(denom) > 1e-6 ? (d2y * dx - dy * d2x) / denom : 0;
  }

  /**
   * Evaluates exact instantaneous geometric curvature kappa(t).
   */
  public solveCurvature(t: number): number {
    const u = this.solveCurveX(t);
    const dx = this.sampleDerivativeX(u);
    const dy = this.sampleDerivativeY(u);
    const d2x = this.sampleSecondDerivativeX(u);
    const d2y = this.sampleSecondDerivativeY(u);

    const numerator = Math.abs(dx * d2y - dy * d2x);
    const denominator = Math.pow(dx * dx + dy * dy, 1.5);
    return denominator > 1e-6 ? numerator / denominator : 0;
  }
}
