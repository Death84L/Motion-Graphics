import { KeyframePoint } from '../../features/graph-editor/types';

export interface ProceduralGeneratorParams {
  energy: number; // 0 to 100
  elasticity: number; // 0 to 100
  smoothness: number; // 0 to 100
  overshoot: number; // 0 to 100
  aggression: number; // 0 to 100
  durationMs: number; // 150 to 2000 ms
  direction: 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';
}

export const DEFAULT_GENERATOR_PARAMS: ProceduralGeneratorParams = {
  energy: 72,
  elasticity: 64,
  smoothness: 85,
  overshoot: 28,
  aggression: 35,
  durationMs: 480,
  direction: 'up',
};

/**
 * Procedurally generates a bespoke Bézier keyframe curve based on 6 physical parameters.
 */
export function generateProceduralMotion(
  params: ProceduralGeneratorParams = DEFAULT_GENERATOR_PARAMS
): KeyframePoint[] {
  const durSec = params.durationMs / 1000;
  const keyframes: KeyframePoint[] = [];

  // Start Keyframe
  const startHandleOutX = Math.max(0.05, Math.min(0.8, 0.4 - (params.aggression / 300)));
  const startHandleOutY = Math.max(0.1, Math.min(1.5, 0.5 + (params.energy / 120)));

  keyframes.push({
    id: 1,
    time: 0,
    value: 0,
    type: 'bezier',
    handleOut: {
      x: Math.round(startHandleOutX * 100) / 100,
      y: Math.round(startHandleOutY * 100) / 100,
    },
  });

  // Intermediate Overshoot Keyframe (if elasticity/overshoot > 10%)
  if (params.overshoot > 10 || params.elasticity > 30) {
    const overshootMagnitude = (params.overshoot * 0.3) + (params.elasticity * 0.15);
    const peakTimeSec = durSec * (0.45 + (params.smoothness / 400));

    keyframes.push({
      id: 2,
      time: Math.round(peakTimeSec * 100) / 100,
      value: Math.round((100 + overshootMagnitude) * 10) / 10,
      type: 'bezier',
      handleIn: { x: 0.25, y: 1.0 },
      handleOut: { x: 0.35, y: 1.0 },
    });
  }

  // Final Settle Keyframe
  const endHandleInX = Math.max(0.1, Math.min(0.9, 0.3 + (params.smoothness / 250)));

  keyframes.push({
    id: keyframes.length + 1,
    time: Math.round(durSec * 100) / 100,
    value: 100,
    type: 'bezier',
    handleIn: {
      x: Math.round(endHandleInX * 100) / 100,
      y: 1.0,
    },
  });

  return keyframes;
}
