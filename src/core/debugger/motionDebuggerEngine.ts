export interface MotionPerformanceMetrics {
  currentFps: number;
  frameTimeMs: number;
  activeLayerCount: number;
  activePhysicsNodes: number;
  activeShaders: number;
  estimatedComplexity: 'light' | 'optimal' | 'heavy' | 'critical';
  suggestions: string[];
}

/**
 * Evaluates real-time performance metrics and flags GPU/CPU bottlenecks.
 */
export function profileMotionPerformance(
  activeLayerCount: number,
  activePhysicsNodes: number,
  activeShaders: number,
  frameDurationMs = 16.6
): MotionPerformanceMetrics {
  const fps = Math.round(1000 / Math.max(1, frameDurationMs));
  const suggestions: string[] = [];

  let complexity: MotionPerformanceMetrics['estimatedComplexity'] = 'optimal';

  if (activeShaders > 8) {
    suggestions.push('High shader density detected (Glow/Blur > 8). Consider caching static filters.');
    complexity = 'heavy';
  }

  if (activePhysicsNodes > 10) {
    suggestions.push('Multiple concurrent spring oscillators running. Bake inactive tracks to keyframes.');
    complexity = 'heavy';
  }

  if (activeLayerCount > 50) {
    complexity = 'critical';
    suggestions.push('Large layer count (>50). Group tracks into precompositions.');
  }

  return {
    currentFps: Math.min(60, fps),
    frameTimeMs: Math.round(frameDurationMs * 10) / 10,
    activeLayerCount,
    activePhysicsNodes,
    activeShaders,
    estimatedComplexity: complexity,
    suggestions,
  };
}
