import { ParametricBlockConfig } from '../engine/universalAnimationModel';

export type NodeExecutionMode = 'parallel' | 'sequential' | 'trigger';

export interface AnimationGraphNode {
  id: string;
  name: string;
  block: ParametricBlockConfig;
  dependsOn: string[]; // parent node IDs
  executionMode: NodeExecutionMode;
  delayOffsetFrames: number;
  calculatedStartFrame: number;
  calculatedEndFrame: number;
}

export interface AnimationGraphTopology {
  id: string;
  name: string;
  nodes: AnimationGraphNode[];
}

/**
 * Topologically resolves execution timing for parallel, sequential, and branching animation nodes.
 */
export function resolveGraphExecutionSchedule(nodes: AnimationGraphNode[]): AnimationGraphNode[] {
  const nodeMap = new Map<string, AnimationGraphNode>();
  nodes.forEach((n) => nodeMap.set(n.id, { ...n }));

  // Multiple passes to resolve dependencies
  for (let pass = 0; pass < 3; pass++) {
    for (const node of nodeMap.values()) {
      if (!node.dependsOn || node.dependsOn.length === 0) {
        node.calculatedStartFrame = node.block.startFrame + (node.delayOffsetFrames || 0);
        node.calculatedEndFrame = node.calculatedStartFrame + node.block.durationFrames;
        continue;
      }

      // Max parent end frame
      const parentEndFrames = node.dependsOn.map((pId) => {
        const parent = nodeMap.get(pId);
        return parent ? (node.executionMode === 'parallel' ? parent.calculatedStartFrame : parent.calculatedEndFrame) : 0;
      });

      const maxParentT = Math.max(0, ...parentEndFrames);
      node.calculatedStartFrame = maxParentT + (node.delayOffsetFrames || 0);
      node.calculatedEndFrame = node.calculatedStartFrame + node.block.durationFrames;
    }
  }

  return Array.from(nodeMap.values());
}
