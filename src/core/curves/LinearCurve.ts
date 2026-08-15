import { Curve } from './Curve';

export class LinearCurve extends Curve {
  evaluate(t: number): number {
    return t;
  }
}
