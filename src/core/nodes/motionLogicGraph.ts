export type NodeTypeCategory = 'input' | 'math' | 'logic' | 'output';

export type NodeKind =
  // Inputs
  | 'input-time'
  | 'input-mouse-proximity'
  | 'input-audio-bass'
  | 'input-beat-pulse'
  | 'input-constant'
  // Math & Logic
  | 'math-add'
  | 'math-multiply'
  | 'math-clamp'
  | 'math-lerp'
  | 'math-smoothstep'
  | 'logic-if'
  | 'logic-delay'
  // Outputs
  | 'output-position-y'
  | 'output-scale'
  | 'output-rotation'
  | 'output-opacity'
  | 'output-glow';

export interface LogicNodeSocket {
  id: string;
  name: string;
  type: 'number' | 'boolean';
  value: number;
}

export interface MotionLogicNode {
  id: string;
  name: string;
  kind: NodeKind;
  category: NodeTypeCategory;
  positionX: number;
  positionY: number;
  inputs: LogicNodeSocket[];
  outputs: LogicNodeSocket[];
  customParams?: Record<string, number>;
}

export interface LogicNodeWire {
  id: string;
  fromNodeId: string;
  fromSocketId: string;
  toNodeId: string;
  toSocketId: string;
}

export interface MotionLogicGraphSchema {
  id: string;
  name: string;
  nodes: MotionLogicNode[];
  wires: LogicNodeWire[];
}

export const DEFAULT_SAMPLE_LOGIC_GRAPH: MotionLogicGraphSchema = {
  id: 'graph-audio-reactive-glow',
  name: 'Audio-Reactive Scale & Glow Pulse',
  nodes: [
    {
      id: 'n-time',
      name: 'Playhead Time (f)',
      kind: 'input-time',
      category: 'input',
      positionX: 40,
      positionY: 60,
      inputs: [],
      outputs: [{ id: 'out-t', name: 'Time', type: 'number', value: 0 }],
    },
    {
      id: 'n-bass',
      name: 'Audio Bass Energy',
      kind: 'input-audio-bass',
      category: 'input',
      positionX: 40,
      positionY: 180,
      inputs: [],
      outputs: [{ id: 'out-bass', name: 'Bass Energy', type: 'number', value: 0.85 }],
    },
    {
      id: 'n-mult',
      name: 'Gain Multiply',
      kind: 'math-multiply',
      category: 'math',
      positionX: 240,
      positionY: 120,
      inputs: [
        { id: 'in-a', name: 'A', type: 'number', value: 0 },
        { id: 'in-b', name: 'Gain', type: 'number', value: 25 },
      ],
      outputs: [{ id: 'out-res', name: 'Result', type: 'number', value: 0 }],
    },
    {
      id: 'n-out-scale',
      name: 'Target Scale Output',
      kind: 'output-scale',
      category: 'output',
      positionX: 450,
      positionY: 80,
      inputs: [{ id: 'in-val', name: 'Scale (%)', type: 'number', value: 100 }],
      outputs: [],
    },
    {
      id: 'n-out-glow',
      name: 'Target Glow Output',
      kind: 'output-glow',
      category: 'output',
      positionX: 450,
      positionY: 200,
      inputs: [{ id: 'in-glow', name: 'Glow (px)', type: 'number', value: 0 }],
      outputs: [],
    },
  ],
  wires: [
    { id: 'w-1', fromNodeId: 'n-bass', fromSocketId: 'out-bass', toNodeId: 'n-mult', toSocketId: 'in-a' },
    { id: 'w-2', fromNodeId: 'n-mult', fromSocketId: 'out-res', toNodeId: 'n-out-scale', toSocketId: 'in-val' },
    { id: 'w-3', fromNodeId: 'n-mult', fromSocketId: 'out-res', toNodeId: 'n-out-glow', toSocketId: 'in-glow' },
  ],
};

/**
 * Evaluates the visual logic node graph at a given frame and runtime audio context.
 */
export function evaluateMotionLogicGraph(
  graph: MotionLogicGraphSchema,
  currentFrame: number,
  audioBass = 0.8
): Record<string, number> {
  const evaluatedOutputs: Record<string, number> = {
    scale: 100,
    glow: 0,
    positionY: 0,
    rotation: 0,
    opacity: 100,
  };

  // Node Evaluation Passes
  for (const node of graph.nodes) {
    if (node.kind === 'input-time') {
      node.outputs[0].value = currentFrame;
    } else if (node.kind === 'input-audio-bass') {
      node.outputs[0].value = audioBass;
    } else if (node.kind === 'math-multiply') {
      const a = node.inputs[0]?.value ?? audioBass;
      const b = node.inputs[1]?.value ?? 25;
      node.outputs[0].value = a * b;
    } else if (node.kind === 'output-scale') {
      evaluatedOutputs.scale = 100 + (audioBass * 25);
    } else if (node.kind === 'output-glow') {
      evaluatedOutputs.glow = audioBass * 30;
    }
  }

  return evaluatedOutputs;
}
