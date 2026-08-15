import { CurveLayer, KeyframePoint, GraphViewport, GraphMode } from '../../features/graph-editor/types';
import { evaluateGraphAtTime } from '../../features/graph-editor/utils/curveEvaluation';
import { evaluateDerivativeAtTime, DerivativeEvaluation } from '../derivatives/derivativeEvaluation';
import { TimeDomain, ValueDomain, DEFAULT_TIME_DOMAIN, DEFAULT_VALUE_DOMAIN } from '../domain/graphDomain';

export type GraphEngineEvent =
  | { type: 'KEYFRAMES_UPDATED'; layerId: string; keyframes: KeyframePoint[] }
  | { type: 'TIME_CHANGED'; currentTime: number }
  | { type: 'LAYER_SELECTED'; layerId: string }
  | { type: 'MODE_CHANGED'; mode: GraphMode };

export type GraphEngineListener = (event: GraphEngineEvent) => void;

/**
 * Distributed, headless Graph Engine for scalable, multi-threaded, or multi-host curve evaluation.
 */
export class DistributedGraphEngine {
  private layers: Map<string, CurveLayer> = new Map();
  private activeLayerId: string = '';
  private currentTime: number = 0;
  private timeDomain: TimeDomain = DEFAULT_TIME_DOMAIN;
  private valueDomain: ValueDomain = DEFAULT_VALUE_DOMAIN;
  private listeners: Set<GraphEngineListener> = new Set();

  constructor(initialLayers: CurveLayer[] = [], activeId?: string) {
    for (const layer of initialLayers) {
      this.layers.set(layer.id, JSON.parse(JSON.stringify(layer)));
    }
    this.activeLayerId = activeId || initialLayers[0]?.id || '';
  }

  public subscribe(listener: GraphEngineListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: GraphEngineEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public setLayers(layers: CurveLayer[]): void {
    this.layers.clear();
    for (const l of layers) {
      this.layers.set(l.id, JSON.parse(JSON.stringify(l)));
    }
  }

  public getLayer(layerId: string): CurveLayer | undefined {
    return this.layers.get(layerId);
  }

  public getAllLayers(): CurveLayer[] {
    return Array.from(this.layers.values());
  }

  public setKeyframes(layerId: string, keyframes: KeyframePoint[]): void {
    const layer = this.layers.get(layerId);
    if (!layer) return;
    layer.keyframes = [...keyframes].sort((a, b) => a.time - b.time);
    this.notify({ type: 'KEYFRAMES_UPDATED', layerId, keyframes: layer.keyframes });
  }

  public setCurrentTime(time: number): void {
    this.currentTime = time;
    this.notify({ type: 'TIME_CHANGED', currentTime: time });
  }

  /**
   * High-speed evaluation of current value for a given layer.
   */
  public evaluate(layerId: string, time?: number): number {
    const layer = this.layers.get(layerId);
    if (!layer) return 0;
    const t = time !== undefined ? time : this.currentTime;
    return evaluateGraphAtTime(layer.keyframes, t);
  }

  /**
   * High-speed evaluation of derivatives (velocity, acceleration, jerk, speed).
   */
  public evaluateDerivatives(layerId: string, time?: number): DerivativeEvaluation {
    const layer = this.layers.get(layerId);
    if (!layer) {
      return { value: 0, velocity: 0, speed: 0, acceleration: 0, jerk: 0 };
    }
    const t = time !== undefined ? time : this.currentTime;
    return evaluateDerivativeAtTime(layer.keyframes, t);
  }

  /**
   * Batch evaluate N sample points for streaming to Premiere Pro or render farm.
   */
  public batchSample(layerId: string, startFrame: number, endFrame: number, step = 1): { frame: number; value: number; velocity: number }[] {
    const layer = this.layers.get(layerId);
    if (!layer) return [];

    const results: { frame: number; value: number; velocity: number }[] = [];
    for (let f = startFrame; f <= endFrame; f += step) {
      const v = evaluateGraphAtTime(layer.keyframes, f);
      const d = evaluateDerivativeAtTime(layer.keyframes, f);
      results.push({ frame: f, value: v, velocity: d.velocity });
    }
    return results;
  }

  /**
   * Serializes state to JSON for network / multi-agent distribution.
   */
  public serialize(): string {
    return JSON.stringify({
      layers: this.getAllLayers(),
      activeLayerId: this.activeLayerId,
      currentTime: this.currentTime,
      timeDomain: this.timeDomain,
      valueDomain: this.valueDomain,
    });
  }

  /**
   * Deserializes state from remote session or file.
   */
  public deserialize(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.layers) this.setLayers(data.layers);
      if (data.activeLayerId) this.activeLayerId = data.activeLayerId;
      if (data.currentTime !== undefined) this.currentTime = data.currentTime;
      if (data.timeDomain) this.timeDomain = data.timeDomain;
      if (data.valueDomain) this.valueDomain = data.valueDomain;
    } catch (e) {}
  }
}
