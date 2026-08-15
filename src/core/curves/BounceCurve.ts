import { Curve } from './Curve';
import { BounceParams } from '../../features/graph-editor/types';

/**
 * Parametric Gravity Bounce Simulation with decaying parabolic arcs.
 */
export class BounceCurve extends Curve {
  private bounces: number;
  private decay: number;

  constructor(params: Partial<BounceParams> = {}) {
    super();
    this.bounces = params.bounces ?? 3;
    this.decay = params.decay ?? 0.65;
  }

  evaluate(t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // Standard 4-stage realistic gravity bounce
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
  }
}
