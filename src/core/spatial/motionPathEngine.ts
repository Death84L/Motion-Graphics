import { KeyframePoint } from '../../features/graph-editor/types';

export interface SpatialPathNode {
  id: number;
  time: number;
  x: number;
  y: number;
  handleIn?: { x: number; y: number };
  handleOut?: { x: number; y: number };
}

/**
 * Combines X and Y curve keyframe arrays into spatial 2D trajectory nodes.
 */
export function buildSpatialPathNodes(
  xKeyframes: KeyframePoint[],
  yKeyframes: KeyframePoint[]
): SpatialPathNode[] {
  const times = Array.from(new Set([...xKeyframes.map((k) => k.time), ...yKeyframes.map((k) => k.time)])).sort(
    (a, b) => a - b
  );

  return times.map((t, idx) => {
    const kfX = xKeyframes.find((k) => k.time === t);
    const kfY = yKeyframes.find((k) => k.time === t);

    return {
      id: idx + 5000,
      time: t,
      x: kfX ? kfX.value : 50,
      y: kfY ? kfY.value : 50,
      handleIn: kfX?.handleIn && kfY?.handleIn ? { x: kfX.handleIn.y, y: kfY.handleIn.y } : undefined,
      handleOut: kfX?.handleOut && kfY?.handleOut ? { x: kfX.handleOut.y, y: kfY.handleOut.y } : undefined,
    };
  });
}

/**
 * Updates X and Y keyframes from edited spatial path nodes.
 */
export function syncSpatialNodesToKeyframes(
  nodes: SpatialPathNode[]
): { xKeyframes: KeyframePoint[]; yKeyframes: KeyframePoint[] } {
  const xKeyframes: KeyframePoint[] = nodes.map((n) => ({
    id: n.id * 2,
    time: n.time,
    value: n.x,
    type: 'bezier',
    ease: 'easeInOut',
  }));

  const yKeyframes: KeyframePoint[] = nodes.map((n) => ({
    id: n.id * 2 + 1,
    time: n.time,
    value: n.y,
    type: 'bezier',
    ease: 'easeInOut',
  }));

  return { xKeyframes, yKeyframes };
}

/**
 * Reverses a 2D spatial motion path.
 */
export function reverseSpatialPath(nodes: SpatialPathNode[]): SpatialPathNode[] {
  return [...nodes].reverse().map((n, idx) => ({
    ...n,
    time: (idx / (nodes.length - 1 || 1)) * 100,
  }));
}

/**
 * Applies spatial offset to all nodes along 2D motion path.
 */
export function offsetSpatialPath(nodes: SpatialPathNode[], dx: number, dy: number): SpatialPathNode[] {
  return nodes.map((n) => ({
    ...n,
    x: n.x + dx,
    y: n.y + dy,
  }));
}
