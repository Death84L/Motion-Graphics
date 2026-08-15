import { KeyframePoint } from '../../features/graph-editor/types';

export interface ReferenceMotionCurve {
  id: string;
  name: string;
  color: string;
  opacity: number;
  keyframes: KeyframePoint[];
}

export const SAMPLE_REFERENCE_CURVES: ReferenceMotionCurve[] = [
  {
    id: 'ref-apple-spring',
    name: 'Apple iOS Fluid Spring (Sampled)',
    color: '#38bdf8',
    opacity: 0.6,
    keyframes: [
      { id: 1, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.16, y: 1.0 } },
      { id: 2, time: 0.35, value: 104, type: 'bezier', handleIn: { x: 0.3, y: 1.0 }, handleOut: { x: 0.4, y: 1.0 } },
      { id: 3, time: 0.65, value: 100, type: 'bezier', handleIn: { x: 0.5, y: 1.0 } },
    ],
  },
  {
    id: 'ref-disney-anticipation',
    name: 'Disney 12-Principles Windup',
    color: '#f59e0b',
    opacity: 0.6,
    keyframes: [
      { id: 4, time: 0, value: 0, type: 'bezier', handleOut: { x: 0.2, y: -0.15 } },
      { id: 5, time: 0.2, value: -12, type: 'bezier', handleIn: { x: 0.15, y: -0.15 }, handleOut: { x: 0.25, y: 0 } },
      { id: 6, time: 0.8, value: 100, type: 'bezier', handleIn: { x: 0.4, y: 1.0 } },
    ],
  },
];

/**
 * Parses raw JSON or CSV keyframe points into a structured ReferenceMotionCurve.
 */
export function parseReferenceMotionData(rawString: string, name = 'Custom Reference'): ReferenceMotionCurve | null {
  try {
    const parsed = JSON.parse(rawString);
    if (Array.isArray(parsed)) {
      const keyframes: KeyframePoint[] = parsed.map((pt, idx) => ({
        id: idx + 1,
        time: parseFloat(pt.t ?? pt.time ?? idx * 0.1),
        value: parseFloat(pt.v ?? pt.value ?? 0),
        type: 'bezier',
        handleIn: pt.handleIn || { x: 0.25, y: 0.25 },
        handleOut: pt.handleOut || { x: 0.25, y: 0.25 },
      }));

      return {
        id: `ref-${Date.now()}`,
        name,
        color: '#10b981',
        opacity: 0.6,
        keyframes,
      };
    }
  } catch (e) {
    // Non-JSON format
  }
  return null;
}
