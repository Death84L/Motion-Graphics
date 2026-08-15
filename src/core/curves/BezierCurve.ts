import { Curve } from './Curve';
import { CubicBezierSolver } from './CubicBezierSolver';

export class BezierCurve extends Curve {
  private solver: CubicBezierSolver;

  constructor(
    public p0: number,
    public p1: number,
    public p2: number,
    public p3: number,
    public x1 = 0.33,
    public x2 = 0.67
  ) {
    super();
    // Normalize Y control points relative to segment span [p0, p3]
    const delta = p3 - p0 || 1;
    const normY1 = (p1 - p0) / delta;
    const normY2 = (p2 - p0) / delta;

    this.solver = new CubicBezierSolver(
      Math.max(0, Math.min(1, x1)),
      normY1,
      Math.max(0, Math.min(1, x2)),
      normY2
    );
  }

  evaluate(t: number): number {
    const normProgress = this.solver.solve(t);
    return this.p0 + normProgress * (this.p3 - this.p0);
  }

  evaluateVelocity(t: number): number {
    const normVel = this.solver.solveVelocity(t);
    return normVel * (this.p3 - this.p0);
  }

  evaluateAcceleration(t: number): number {
    const normAccel = this.solver.solveAcceleration(t);
    return normAccel * (this.p3 - this.p0);
  }
}
