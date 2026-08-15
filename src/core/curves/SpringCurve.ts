import { Curve } from './Curve';
import { SpringParams } from '../../features/graph-editor/types';

/**
 * Analytical Damped Harmonic Oscillator (Spring Physics).
 * Solution to: m*x'' + c*x' + k*x = 0
 */
export class SpringCurve extends Curve {
  private stiffness: number;
  private damping: number;
  private mass: number;
  private amplitude: number;
  private frequency: number;

  constructor(params: Partial<SpringParams> = {}) {
    super();
    this.stiffness = params.stiffness ?? 120;
    this.damping = params.damping ?? 14;
    this.mass = params.mass ?? 1;
    this.amplitude = params.amplitude ?? 100;
    this.frequency = params.frequency ?? 3.5;
  }

  evaluate(t: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    // Angular natural frequency and damping ratio
    const w0 = Math.sqrt(this.stiffness / this.mass);
    const zeta = this.damping / (2 * Math.sqrt(this.stiffness * this.mass));

    if (zeta < 1) {
      // Underdamped oscillation
      const wd = w0 * Math.sqrt(1 - zeta * zeta);
      const decay = Math.exp(-zeta * w0 * t * 2.5);
      const oscillation = Math.cos(wd * t * 2.5) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t * 2.5);
      return 1 - decay * oscillation;
    } else {
      // Critically damped / overdamped
      const decay = Math.exp(-w0 * t * 3);
      return 1 - (1 + w0 * t * 3) * decay;
    }
  }
}
