import { KeyframePoint } from '../../features/graph-editor/types';
import { executeSmartAutoFix } from './smartAutoFix';
import { evaluateGraphHealth, GraphHealthStatus } from './graphHealthMonitor';

export interface OptimizationSummary {
  beforeHealth: GraphHealthStatus;
  afterHealth: GraphHealthStatus;
  beforeNodeCount: number;
  afterNodeCount: number;
  optimizedKeyframes: KeyframePoint[];
}

/**
 * Runs complete holistic optimization across keyframes, velocity, acceleration, jerk, continuity, and density.
 */
export function runOneClickMotionOptimization(
  keyframes: KeyframePoint[]
): OptimizationSummary {
  const beforeHealth = evaluateGraphHealth(keyframes);
  const beforeNodeCount = keyframes.length;

  const optimizedKeyframes = executeSmartAutoFix(keyframes);

  const afterHealth = evaluateGraphHealth(optimizedKeyframes);
  const afterNodeCount = optimizedKeyframes.length;

  return {
    beforeHealth,
    afterHealth,
    beforeNodeCount,
    afterNodeCount,
    optimizedKeyframes,
  };
}
