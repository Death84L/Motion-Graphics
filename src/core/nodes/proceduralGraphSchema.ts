export type ProceduralNodeCategory =
  | 'input'
  | 'math'
  | 'trigonometry'
  | 'vector'
  | 'interpolation'
  | 'spring-physics'
  | 'noise-procedural'
  | 'logic'
  | 'text'
  | 'output';

export type ProceduralNodeKind =
  // Inputs
  | 'in-time'
  | 'in-audio-bass'
  | 'in-audio-beat'
  | 'in-audio-treble'
  | 'in-mouse-dist'
  | 'in-layer-index'
  | 'in-motion-dna'
  | 'in-slider-param'
  // Math & Trig
  | 'math-add'
  | 'math-subtract'
  | 'math-multiply'
  | 'math-divide'
  | 'math-modulo'
  | 'math-min-max'
  | 'trig-sin-cos'
  | 'trig-atan2'
  // Vector
  | 'vec-combine-2d'
  | 'vec-split-2d'
  | 'vec-distance'
  | 'vec-lerp'
  // Interpolation & Easing
  | 'interp-lerp'
  | 'interp-smoothstep'
  | 'interp-remap'
  | 'interp-clamp'
  | 'interp-easing'
  // Spring & Physics Dynamics
  | 'dynamics-spring'
  | 'dynamics-velocity'
  | 'dynamics-gravity'
  | 'dynamics-inertia'
  // Noise & Procedural
  | 'noise-perlin'
  | 'noise-random-range'
  | 'noise-wave-cycle'
  // Logic
  | 'logic-if-else'
  | 'logic-compare'
  // Text
  | 'text-char-stagger'
  // Outputs
  | 'out-scale'
  | 'out-position-y'
  | 'out-position-x'
  | 'out-rotation'
  | 'out-opacity'
  | 'out-glow-aura'
  | 'out-camera-shake'
  | 'out-particle-rate';

export interface NodeSocket {
  id: string;
  name: string;
  type: 'number' | 'vector2' | 'boolean';
  value: number;
}

export interface ProceduralNode {
  id: string;
  name: string;
  category: ProceduralNodeCategory;
  kind: ProceduralNodeKind;
  positionX: number;
  positionY: number;
  inputs: NodeSocket[];
  outputs: NodeSocket[];
  params: Record<string, number>;
}

export interface NodeWire {
  id: string;
  fromNodeId: string;
  fromSocketId: string;
  toNodeId: string;
  toSocketId: string;
}

export interface ProceduralGraphSchema {
  id: string;
  name: string;
  category: string;
  description: string;
  nodes: ProceduralNode[];
  wires: NodeWire[];
}

export interface EvaluationContext {
  timeSeconds: number;
  frameIndex: number;
  fps: number;
  audioBass: number;
  audioBeat: boolean;
  audioTreble: number;
  mouseDistancePx: number;
  charIndex: number;
}

export interface EvaluationResult {
  outputs: Record<string, number>;
  nodeValues: Record<string, number>;
}
