import { KeyframePoint, CurveLayer } from '../../features/graph-editor/types';
import { calculateDelta } from '../math/tangentMath';

export type CopyChannelMode = 'all' | 'timingOnly' | 'valuesOnly' | 'tangentsOnly';
export type PasteMode = 'absolute' | 'relativePlayhead' | 'relativeOffset' | 'scaleToDuration';

export interface KeyframeClipboardPayload {
  version: '2.0';
  timestamp: number;
  sourceLayerName?: string;
  sourceProperty?: string;
  durationSpan: number;
  valueSpan: number;
  keyframes: KeyframePoint[];
}

let inMemoryClipboard: KeyframeClipboardPayload | null = null;

/**
 * Copies keyframes with specific channel filtering (timing, values, tangents, or all).
 */
export function copyKeyframesToClipboard(
  keyframes: KeyframePoint[],
  channelMode: CopyChannelMode = 'all',
  sourceLayer?: CurveLayer
): KeyframeClipboardPayload {
  const sorted = [...keyframes].sort((a, b) => a.time - b.time);
  const minTime = sorted[0]?.time ?? 0;
  const maxTime = sorted[sorted.length - 1]?.time ?? 0;
  const minVal = Math.min(...sorted.map((k) => k.value));
  const maxVal = Math.max(...sorted.map((k) => k.value));

  const filtered = sorted.map((k, idx) => {
    const cloned: KeyframePoint = {
      id: Date.now() + idx,
      time: k.time,
      value: k.value,
      type: k.type,
      ease: k.ease,
      tangentType: k.tangentType,
      symmetrical: k.symmetrical,
    };

    if (channelMode === 'all' || channelMode === 'tangentsOnly') {
      if (k.handleIn) cloned.handleIn = { ...k.handleIn };
      if (k.handleOut) cloned.handleOut = { ...k.handleOut };
    }

    return cloned;
  });

  const payload: KeyframeClipboardPayload = {
    version: '2.0',
    timestamp: Date.now(),
    sourceLayerName: sourceLayer?.name,
    sourceProperty: sourceLayer?.property,
    durationSpan: maxTime - minTime,
    valueSpan: maxVal - minVal,
    keyframes: filtered,
  };

  inMemoryClipboard = payload;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    }
  } catch (err) {
    // Fallback in memory
  }

  return payload;
}

/**
 * Retrieves the current clipboard payload from memory or system clipboard.
 */
export async function getClipboardPayload(): Promise<KeyframeClipboardPayload | null> {
  if (inMemoryClipboard) return inMemoryClipboard;

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (parsed && parsed.version === '2.0' && Array.isArray(parsed.keyframes)) {
        inMemoryClipboard = parsed;
        return parsed;
      }
    }
  } catch (err) {
    // Ignore clipboard read errors
  }

  return inMemoryClipboard;
}

export interface PasteOptions {
  mode: PasteMode;
  targetPlayhead?: number;
  targetDuration?: number;
  channelMode?: CopyChannelMode;
  valueOffset?: number;
}

/**
 * Pastes clipboard keyframes into a target layer with advanced transformation options.
 */
export function pasteKeyframesFromClipboard(
  existingKeyframes: KeyframePoint[],
  payload: KeyframeClipboardPayload,
  options: PasteOptions
): KeyframePoint[] {
  if (!payload || !payload.keyframes || payload.keyframes.length === 0) {
    return existingKeyframes;
  }

  const { mode = 'relativePlayhead', targetPlayhead = 0, targetDuration = 50, channelMode = 'all', valueOffset = 0 } = options;
  const sourceKeys = payload.keyframes;
  const sourceMinT = sourceKeys[0].time;
  const sourceSpanT = payload.durationSpan || 1;

  let transformedKeys: KeyframePoint[] = [];

  if (channelMode === 'timingOnly') {
    // Keep target values, apply timing distribution
    transformedKeys = existingKeyframes.map((k, idx) => {
      const src = sourceKeys[Math.min(idx, sourceKeys.length - 1)];
      const normT = (src.time - sourceMinT) / sourceSpanT;
      const newT = mode === 'relativePlayhead' ? targetPlayhead + normT * sourceSpanT : src.time;
      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round(newT * 10) / 10)),
      };
    });
    return transformedKeys.sort((a, b) => a.time - b.time);
  }

  if (channelMode === 'valuesOnly') {
    // Keep target timings, apply clipboard values
    transformedKeys = existingKeyframes.map((k, idx) => {
      const src = sourceKeys[Math.min(idx, sourceKeys.length - 1)];
      return {
        ...k,
        value: Math.round((src.value + valueOffset) * 10) / 10,
      };
    });
    return transformedKeys;
  }

  if (channelMode === 'tangentsOnly') {
    // Keep target timings & values, transfer tangent shapes
    transformedKeys = existingKeyframes.map((k, idx) => {
      const src = sourceKeys[Math.min(idx, sourceKeys.length - 1)];
      return {
        ...k,
        type: src.type,
        ease: src.ease,
        handleIn: src.handleIn ? { ...src.handleIn } : undefined,
        handleOut: src.handleOut ? { ...src.handleOut } : undefined,
      };
    });
    return transformedKeys;
  }

  // Full keyframe transfer with mode transforms
  transformedKeys = sourceKeys.map((k, idx) => {
    let newTime = k.time;
    let newVal = k.value;

    if (mode === 'absolute') {
      newTime = k.time;
      newVal = k.value + valueOffset;
    } else if (mode === 'relativePlayhead') {
      const dt = k.time - sourceMinT;
      newTime = targetPlayhead + dt;
      newVal = k.value + valueOffset;
    } else if (mode === 'scaleToDuration') {
      const norm = (k.time - sourceMinT) / sourceSpanT;
      newTime = targetPlayhead + norm * targetDuration;
      newVal = k.value + valueOffset;
    } else if (mode === 'relativeOffset') {
      newTime = targetPlayhead + (k.time - sourceMinT);
      newVal = k.value + valueOffset;
    }

    return {
      ...k,
      id: Date.now() + idx,
      time: Math.max(0, Math.min(100, Math.round(newTime * 10) / 10)),
      value: Math.round(newVal * 10) / 10,
    };
  });

  // Merge with existing keyframes outside the paste range
  const minPasted = Math.min(...transformedKeys.map((k) => k.time));
  const maxPasted = Math.max(...transformedKeys.map((k) => k.time));

  const preserved = existingKeyframes.filter((k) => k.time < minPasted || k.time > maxPasted);
  const merged = [...preserved, ...transformedKeys].sort((a, b) => a.time - b.time);

  return merged;
}
