export interface PerformanceTelemetrySnapshot {
  fps: number;
  frameTimeMs: number;
  cpuEstimatePercent: number;
  gpuEstimatePercent: number;
  memoryMb: number;
  graphEvalTimeMs: number;
  physicsTimeMs: number;
  renderTimeMs: number;
  timelineSyncTimeMs: number;
  activeKeyframeCount: number;
  activeLayerCount: number;
  detectedBottleneck?: string;
}

export class PerformanceProfiler {
  private static frameCount = 0;
  private static lastTimestamp = performance.now();
  private static currentFps = 60;
  private static currentFrameTime = 16.6;

  private static lastGraphEvalMs = 1.2;
  private static lastPhysicsMs = 0.8;
  private static lastRenderMs = 4.5;
  private static lastTimelineMs = 0.6;

  static recordMetric(
    category: 'graph' | 'physics' | 'render' | 'timeline',
    durationMs: number
  ): void {
    if (category === 'graph') this.lastGraphEvalMs = durationMs;
    if (category === 'physics') this.lastPhysicsMs = durationMs;
    if (category === 'render') this.lastRenderMs = durationMs;
    if (category === 'timeline') this.lastTimelineMs = durationMs;
  }

  static tick(): void {
    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.lastTimestamp;

    if (elapsed >= 500) {
      this.currentFps = Math.round((this.frameCount * 1000) / elapsed);
      this.currentFrameTime = Math.round((elapsed / this.frameCount) * 10) / 10;
      this.frameCount = 0;
      this.lastTimestamp = now;
    }
  }

  static getSnapshot(keyframeCount = 24, layerCount = 6): PerformanceTelemetrySnapshot {
    const memory = (performance as any).memory
      ? Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024))
      : 84;

    let bottleneck: string | undefined = undefined;
    if (this.lastRenderMs > 12) {
      bottleneck = 'Rendering shader complexity high. Consider disabling heavy bloom / motion blur.';
    } else if (this.lastGraphEvalMs > 8) {
      bottleneck = 'Graph evaluation time high (>8ms). Optimize redundant dense keyframe points with Keyframe Reducer.';
    } else if (this.currentFps < 45) {
      bottleneck = 'Frame rate dropped below 45 FPS. Check background node graph evaluation loop.';
    }

    return {
      fps: this.currentFps || 60,
      frameTimeMs: this.currentFrameTime || 16.6,
      cpuEstimatePercent: Math.min(95, Math.round((this.currentFrameTime / 16.6) * 40)),
      gpuEstimatePercent: Math.min(95, Math.round((this.lastRenderMs / 16.6) * 60)),
      memoryMb: memory,
      graphEvalTimeMs: Math.round(this.lastGraphEvalMs * 100) / 100,
      physicsTimeMs: Math.round(this.lastPhysicsMs * 100) / 100,
      renderTimeMs: Math.round(this.lastRenderMs * 100) / 100,
      timelineSyncTimeMs: Math.round(this.lastTimelineMs * 100) / 100,
      activeKeyframeCount: keyframeCount,
      activeLayerCount: layerCount,
      detectedBottleneck: bottleneck,
    };
  }
}
