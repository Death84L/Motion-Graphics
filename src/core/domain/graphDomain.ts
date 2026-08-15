import { GraphViewport } from '../../features/graph-editor/types';

export interface TimeDomain {
  minTime: number; // e.g. 0
  maxTime: number; // e.g. 100, 300, 1000
  fps: number; // e.g. 24, 30, 60
}

export interface ValueDomain {
  minValue: number; // e.g. 0, -180, -48
  maxValue: number; // e.g. 100, 1920, 3840, 180
  unit: '%' | 'px' | 'deg' | 'dB';
}

export const DEFAULT_TIME_DOMAIN: TimeDomain = {
  minTime: 0,
  maxTime: 100,
  fps: 30,
};

export const DEFAULT_VALUE_DOMAIN: ValueDomain = {
  minValue: 0,
  maxValue: 100,
  unit: '%',
};

/**
 * Pure coordinate projector mapping arbitrary (Time, Value) domain to Screen Pixel Space.
 */
export class GraphCoordinateProjector {
  constructor(
    public timeDomain: TimeDomain = DEFAULT_TIME_DOMAIN,
    public valueDomain: ValueDomain = DEFAULT_VALUE_DOMAIN,
    public viewport: GraphViewport = { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    public bounds: { width: number; height: number; paddingLeft: number; paddingTop: number } = {
      width: 800,
      height: 400,
      paddingLeft: 46,
      paddingTop: 38,
    }
  ) {}

  public timeToScreenX(time: number): number {
    const timeSpan = this.timeDomain.maxTime - this.timeDomain.minTime || 1;
    const normT = (time - this.timeDomain.minTime) / timeSpan;
    return this.bounds.paddingLeft + normT * this.bounds.width * this.viewport.scaleX + this.viewport.x;
  }

  public screenXToTime(screenX: number): number {
    const timeSpan = this.timeDomain.maxTime - this.timeDomain.minTime || 1;
    const normT = (screenX - this.bounds.paddingLeft - this.viewport.x) / (this.bounds.width * this.viewport.scaleX);
    return Math.max(
      this.timeDomain.minTime,
      Math.min(this.timeDomain.maxTime, this.timeDomain.minTime + normT * timeSpan)
    );
  }

  public valueToScreenY(value: number): number {
    const valSpan = this.valueDomain.maxValue - this.valueDomain.minValue || 1;
    const normV = (value - this.valueDomain.minValue) / valSpan;
    return (
      this.bounds.paddingTop +
      this.bounds.height -
      normV * this.bounds.height * this.viewport.scaleY +
      this.viewport.y
    );
  }

  public screenYToValue(screenY: number): number {
    const valSpan = this.valueDomain.maxValue - this.valueDomain.minValue || 1;
    const normV = 1 - (screenY - this.bounds.paddingTop - this.viewport.y) / (this.bounds.height * this.viewport.scaleY);
    return this.valueDomain.minValue + normV * valSpan;
  }
}
