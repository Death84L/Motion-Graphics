import { describe, it, expect } from 'vitest';
import { UnifiedHostBridge } from '../core/host/unifiedHostBridge';
import { KeyframePoint } from '../features/graph-editor/types';

describe('Unified Exporters Golden Test Suite', () => {
  const sampleKeyframes: KeyframePoint[] = [
    { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.16, y: 1 } },
    { id: 2, time: 30, value: 100, type: 'bezier', handleIn: { x: 0.3, y: 1 } },
  ];

  it('dispatches to Premiere Pro format with correct keyframe count', async () => {
    const prResult = await UnifiedHostBridge.dispatchToHost(
      { hostApp: 'premiere-pro', layerOrClipName: 'Clip 01', propertyName: 'Position', insertionMode: 'merge-preserve', timeOffsetFrames: 0 },
      sampleKeyframes
    );
    expect(prResult.success).toBe(true);
    expect(prResult.appliedKeyframeCount).toBe(2);
  });

  it('generates undo-safe After Effects JSX scripts', async () => {
    const aeResult = await UnifiedHostBridge.dispatchToHost(
      { hostApp: 'after-effects', layerOrClipName: 'Layer 1', propertyName: 'Position', insertionMode: 'merge-preserve', timeOffsetFrames: 0 },
      sampleKeyframes
    );
    expect(aeResult.success).toBe(true);
    expect(aeResult.rawPayload).toContain('app.beginUndoGroup');
  });

  it('formats DaVinci Resolve Fusion Spline tables', async () => {
    const resolveResult = await UnifiedHostBridge.dispatchToHost(
      { hostApp: 'davinci-resolve', layerOrClipName: 'Transform1', propertyName: 'Size', insertionMode: 'merge-preserve', timeOffsetFrames: 0 },
      sampleKeyframes
    );
    expect(resolveResult.success).toBe(true);
    expect(resolveResult.rawPayload).toContain('Linear = false');
  });
});
