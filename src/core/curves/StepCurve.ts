import { Curve } from './Curve';

export type StepMode = 'hold' | 'step-before' | 'step-after' | 'quantized';

/**
 * Step & Hold curve evaluation.
 */
export class StepCurve extends Curve {
  constructor(
    private steps = 5,
    private mode: StepMode = 'quantized'
  ) {
    super();
  }

  evaluate(t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    switch (this.mode) {
      case 'hold':
        // Constant value until end
        return 0;
      case 'step-before':
        // Instant step at start
        return 1;
      case 'step-after':
        return 0;
      case 'quantized':
      default: {
        const s = Math.max(1, this.steps);
        return Math.floor(t * s) / s;
      }
    }
  }
}
