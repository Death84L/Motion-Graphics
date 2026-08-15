import { KeyframePoint } from '../../features/graph-editor/types';

export interface SelectiveCopyMask {
  values: boolean;
  timing: boolean;
  easing: boolean;
  tangents: boolean;
  velocity: boolean;
  modifiers: boolean;
  springParams: boolean;
}

export const DEFAULT_COPY_MASK: SelectiveCopyMask = {
  values: true,
  timing: true,
  easing: true,
  tangents: true,
  velocity: true,
  modifiers: true,
  springParams: true,
};

export interface SmartPasteConfig {
  targetPropertyType: 'position' | 'scale' | 'rotation' | 'opacity';
  sourcePropertyType: 'position' | 'scale' | 'rotation' | 'opacity';
  normalizeRange: boolean;
  adaptDurationSec?: number;
  timeOffsetFrames: number;
  staggerStepFrames: number;
  reverseTiming: boolean;
  pasteAsLink: boolean;
  masterLayerId?: string;
}

export interface MotionClipboardEntry {
  id: string;
  timestamp: number;
  label: string;
  sourceProperty: string;
  sourceDurationFrames: number;
  keyframes: KeyframePoint[];
  copyMask: SelectiveCopyMask;
}

export class SmartMotionClipboard {
  private static slots: MotionClipboardEntry[] = [];
  private static activeSlotIndex = 0;
  private static linkedBindings: Map<string, string[]> = new Map(); // masterId -> childIds

  static copyMotion(
    keyframes: KeyframePoint[],
    label = 'Motion Snapshot',
    sourceProperty = 'scale',
    mask: SelectiveCopyMask = DEFAULT_COPY_MASK
  ): MotionClipboardEntry {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    const duration = sorted.length > 1 ? sorted[sorted.length - 1].time - sorted[0].time : 30;

    const entry: MotionClipboardEntry = {
      id: `clip-${Date.now()}`,
      timestamp: Date.now(),
      label,
      sourceProperty,
      sourceDurationFrames: Math.round(duration),
      keyframes: JSON.parse(JSON.stringify(keyframes)),
      copyMask: { ...mask },
    };

    this.slots.unshift(entry);
    if (this.slots.length > 12) this.slots.pop(); // Keep 12 history slots
    this.activeSlotIndex = 0;
    return entry;
  }

  static getActiveEntry(): MotionClipboardEntry | null {
    return this.slots[this.activeSlotIndex] || this.slots[0] || null;
  }

  static getHistorySlots(): MotionClipboardEntry[] {
    return [...this.slots];
  }

  /**
   * Smart Paste with automatic cross-property range normalization and selective masking.
   */
  static pasteMotion(
    targetKeyframes: KeyframePoint[],
    config: Partial<SmartPasteConfig> = {},
    targetLayerIndex = 0
  ): KeyframePoint[] {
    const entry = this.getActiveEntry();
    if (!entry || entry.keyframes.length === 0) return targetKeyframes;

    const mask = entry.copyMask;
    const sourceKeys = [...entry.keyframes].sort((a, b) => a.time - b.time);
    const staggerOffset = (config.staggerStepFrames || 0) * targetLayerIndex;
    const totalOffset = (config.timeOffsetFrames || 0) + staggerOffset;

    // Calculate source min/max for cross-property range normalization
    const sourceVals = sourceKeys.map((k) => k.value);
    const minS = Math.min(...sourceVals);
    const maxS = Math.max(...sourceVals);
    const rangeS = maxS - minS || 1;

    // Target range mapping (e.g. 0 to 100 for scale/opacity, 0 to 360 for rotation)
    const targetMax = config.targetPropertyType === 'rotation' ? 360 : config.targetPropertyType === 'opacity' ? 1 : 100;
    const targetMin = 0;

    return sourceKeys.map((k, idx) => {
      let mappedTime = k.time + totalOffset;
      if (config.reverseTiming) {
        mappedTime = (entry.sourceDurationFrames - k.time) + totalOffset;
      }

      // Value calculation
      let mappedVal = k.value;
      if (config.normalizeRange) {
        const normalizedUnit = (k.value - minS) / rangeS;
        mappedVal = targetMin + normalizedUnit * (targetMax - targetMin);
      }

      // If mask dictates keeping existing target value
      if (!mask.values && targetKeyframes[idx]) {
        mappedVal = targetKeyframes[idx].value;
      }

      return {
        id: idx + 1,
        time: Math.max(0, Math.round(mappedTime * 10) / 10),
        value: Math.round(mappedVal * 10) / 10,
        type: mask.easing ? k.type : 'bezier',
        ease: mask.easing ? k.ease : undefined,
        handleIn: mask.tangents ? k.handleIn : { x: 0.25, y: 1.0 },
        handleOut: mask.tangents ? k.handleOut : { x: 0.25, y: 1.0 },
      };
    });
  }

  static createLinkedBinding(masterLayerId: string, childLayerId: string): void {
    const existing = this.linkedBindings.get(masterLayerId) || [];
    if (!existing.includes(childLayerId)) {
      this.linkedBindings.set(masterLayerId, [...existing, childLayerId]);
    }
  }

  static getLinkedChildren(masterLayerId: string): string[] {
    return this.linkedBindings.get(masterLayerId) || [];
  }
}
