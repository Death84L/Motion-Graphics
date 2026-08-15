import { KeyframePoint, CurveLayer } from '../../features/graph-editor/types';
import { calculateCurveDerivatives } from '../math/derivativesGraphEngine';

export type LayerTypeFilter = 'all' | 'text' | 'shape' | 'image' | 'caption' | 'video';
export type PropertyFilter = 'all' | 'translate-x' | 'translate-y' | 'scale' | 'rotate' | 'opacity';

export interface BatchProcessingParams {
  durationScale: number; // 0.2x to 3.0x
  delayOffsetFrames: number; // e.g. +10 frames
  staggerStepFrames: number; // e.g. 15 frames between layers
  intensityMultiplier: number; // 0.1 to 2.0x
  directionAngleDeg?: number; // 0 to 360 deg
  reverseTiming: boolean;
  normalizeVelocityPeak?: number; // e.g. 2.0
  addSpringOvershootPercent?: number; // e.g. +15%
  smoothTangents: boolean;
}

export interface LayerBeforeAfterPreview {
  layerId: string;
  layerName: string;
  layerType: string;
  originalKeyframeCount: number;
  newKeyframeCount: number;
  originalDurationFrames: number;
  newDurationFrames: number;
  beforeDerivatives: Array<{ time: number; velocity: number }>;
  afterDerivatives: Array<{ time: number; velocity: number }>;
}

export const DEFAULT_BATCH_PARAMS: BatchProcessingParams = {
  durationScale: 1.0,
  delayOffsetFrames: 0,
  staggerStepFrames: 10,
  intensityMultiplier: 1.0,
  reverseTiming: false,
  smoothTangents: false,
};

/**
 * Filter layers based on type and property criteria.
 */
export function filterLayersForBatch(
  layers: CurveLayer[],
  typeFilter: LayerTypeFilter = 'all',
  propertyFilter: PropertyFilter = 'all'
): CurveLayer[] {
  return layers.filter((l) => {
    const matchesProp = propertyFilter === 'all' || l.property === propertyFilter;
    return matchesProp;
  });
}

/**
 * Executes a non-destructive batch transformation across multiple curve layers.
 */
export function processLayerBatch(
  layers: CurveLayer[],
  selectedLayerIds: string[],
  params: BatchProcessingParams = DEFAULT_BATCH_PARAMS
): { updatedLayers: CurveLayer[]; previews: LayerBeforeAfterPreview[] } {
  const previews: LayerBeforeAfterPreview[] = [];
  const targetIdSet = new Set(selectedLayerIds.length > 0 ? selectedLayerIds : layers.map((l) => l.id));

  let selectedIndex = 0;

  const updatedLayers = layers.map((layer) => {
    if (!targetIdSet.has(layer.id) || layer.keyframes.length === 0) {
      return layer;
    }

    const currentKeyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);
    const origDuration = currentKeyframes[currentKeyframes.length - 1].time - currentKeyframes[0].time || 30;
    const staggerOffset = selectedIndex * params.staggerStepFrames;
    selectedIndex++;

    const newKeyframes: KeyframePoint[] = currentKeyframes.map((k, idx) => {
      // 1. Duration Scaling & Stagger Offset
      let newTime = k.time * params.durationScale + params.delayOffsetFrames + staggerOffset;

      // 2. Reverse timing if requested
      if (params.reverseTiming) {
        newTime = (origDuration * params.durationScale) - (k.time * params.durationScale) + params.delayOffsetFrames + staggerOffset;
      }

      // 3. Intensity scaling
      let newVal = k.value * params.intensityMultiplier;

      // 4. Spring Overshoot injection on settle keyframes
      if (params.addSpringOvershootPercent && idx === currentKeyframes.length - 2) {
        newVal += (params.addSpringOvershootPercent * 0.5);
      }

      return {
        ...k,
        time: Math.max(0, Math.round(newTime * 10) / 10),
        value: Math.round(newVal * 10) / 10,
        handleIn: params.smoothTangents ? { x: 0.33, y: 1.0 } : k.handleIn,
        handleOut: params.smoothTangents ? { x: 0.33, y: 1.0 } : k.handleOut,
      };
    }).sort((a, b) => a.time - b.time);

    // Generate Before / After Derivative Previews
    const beforeDeriv = calculateCurveDerivatives(currentKeyframes, 20).map((d) => ({ time: d.time, velocity: d.velocity }));
    const afterDeriv = calculateCurveDerivatives(newKeyframes, 20).map((d) => ({ time: d.time, velocity: d.velocity }));
    const newDuration = newKeyframes[newKeyframes.length - 1].time - newKeyframes[0].time;

    previews.push({
      layerId: layer.id,
      layerName: layer.name,
      layerType: layer.property,
      originalKeyframeCount: currentKeyframes.length,
      newKeyframeCount: newKeyframes.length,
      originalDurationFrames: Math.round(origDuration),
      newDurationFrames: Math.round(newDuration),
      beforeDerivatives: beforeDeriv,
      afterDerivatives: afterDeriv,
    });

    return {
      ...layer,
      keyframes: newKeyframes,
    };
  });

  return { updatedLayers, previews };
}
