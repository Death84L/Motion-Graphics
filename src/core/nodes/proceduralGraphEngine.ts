import {
  ProceduralGraphSchema,
  ProceduralNode,
  EvaluationContext,
  EvaluationResult,
} from './proceduralGraphSchema';
import { KeyframePoint } from '../../features/graph-editor/types';

export class ProceduralGraphEngine {
  /**
   * Deterministic 1D Pseudo-Perlin / Gradient Noise Function.
   */
  private static perlinNoise1D(x: number): number {
    const xi = Math.floor(x);
    const xf = x - xi;
    // Smoothstep interpolation
    const u = xf * xf * (3.0 - 2.0 * xf);
    const g1 = Math.sin(xi * 127.1 + 311.7) * 43758.5453;
    const g2 = Math.sin((xi + 1) * 127.1 + 311.7) * 43758.5453;
    const n1 = (g1 - Math.floor(g1)) * 2.0 - 1.0;
    const n2 = (g2 - Math.floor(g2)) * 2.0 - 1.0;
    return n1 * (1.0 - u) + n2 * u;
  }

  /**
   * Evaluates a complete procedural motion graph at a given time point.
   */
  static evaluateGraph(
    graph: ProceduralGraphSchema,
    ctx: EvaluationContext
  ): EvaluationResult {
    const socketValues: Record<string, number> = {};
    const nodeValues: Record<string, number> = {};
    const finalOutputs: Record<string, number> = {
      'out-scale': 100,
      'out-position-x': 0,
      'out-position-y': 0,
      'out-rotation': 0,
      'out-opacity': 1.0,
      'out-glow-aura': 0,
      'out-camera-shake': 0,
      'out-particle-rate': 0,
    };

    // Topological Sort / DAG Evaluation
    graph.nodes.forEach((node) => {
      // 1. Resolve Input Sockets from connected wires
      const resolvedInputs: Record<string, number> = {};
      node.inputs.forEach((inputSocket) => {
        const wire = graph.wires.find(
          (w) => w.toNodeId === node.id && w.toSocketId === inputSocket.id
        );
        resolvedInputs[inputSocket.id] = wire
          ? (socketValues[`${wire.fromNodeId}_${wire.fromSocketId}`] ?? inputSocket.value)
          : inputSocket.value;
      });

      let nodeOut = 0;

      // 2. Evaluate Node Operation
      switch (node.kind) {
        // --- INPUTS ---
        case 'in-time':
          nodeOut = ctx.timeSeconds;
          break;
        case 'in-audio-bass':
          nodeOut = ctx.audioBass;
          break;
        case 'in-audio-beat':
          nodeOut = ctx.audioBeat ? 1.0 : 0;
          break;
        case 'in-audio-treble':
          nodeOut = ctx.audioTreble;
          break;
        case 'in-mouse-dist':
          nodeOut = ctx.mouseDistancePx;
          break;
        case 'in-layer-index':
          nodeOut = ctx.charIndex;
          break;
        case 'in-slider-param':
          nodeOut = node.params['value'] ?? 1.0;
          break;

        // --- MATH & TRIGONOMETRY ---
        case 'math-add': {
          const a = resolvedInputs['in-a'] ?? 0;
          const b = resolvedInputs['in-b'] ?? 0;
          nodeOut = a + b;
          break;
        }
        case 'math-multiply': {
          const a = resolvedInputs['in-a'] ?? 0;
          const b = resolvedInputs['in-b'] ?? 1;
          nodeOut = a * b;
          break;
        }
        case 'math-subtract': {
          const a = resolvedInputs['in-a'] ?? 0;
          const b = resolvedInputs['in-b'] ?? 0;
          nodeOut = a - b;
          break;
        }
        case 'math-divide': {
          const a = resolvedInputs['in-a'] ?? 0;
          const b = resolvedInputs['in-b'] || 1;
          nodeOut = a / b;
          break;
        }
        case 'trig-sin-cos': {
          const t = resolvedInputs['in-t'] ?? ctx.timeSeconds;
          const freq = node.params['frequency'] ?? 1.0;
          const amp = node.params['amplitude'] ?? 1.0;
          nodeOut = Math.sin(t * freq * Math.PI * 2) * amp;
          break;
        }

        // --- INTERPOLATION & REMAPPING ---
        case 'interp-remap': {
          const val = resolvedInputs['in-val'] ?? 0;
          const inMin = node.params['inMin'] ?? 0;
          const inMax = node.params['inMax'] ?? 1;
          const outMin = node.params['outMin'] ?? 0;
          const outMax = node.params['outMax'] ?? 100;
          const norm = inMax !== inMin ? (val - inMin) / (inMax - inMin) : 0;
          nodeOut = outMin + Math.max(0, Math.min(1, norm)) * (outMax - outMin);
          break;
        }
        case 'interp-smoothstep': {
          const x = Math.max(0, Math.min(1, resolvedInputs['in-val'] ?? 0));
          nodeOut = x * x * (3.0 - 2.0 * x);
          break;
        }

        // --- SPRING & PHYSICS DYNAMICS ---
        case 'dynamics-spring': {
          const target = resolvedInputs['in-target'] ?? 0;
          const freq = node.params['frequency'] ?? 2.5;
          const damping = node.params['damping'] ?? 0.65;
          // Harmonic response approximation
          const t = ctx.timeSeconds;
          const decay = Math.exp(-damping * 10 * t);
          const oscillation = Math.cos(freq * 12 * t);
          nodeOut = target * (1.0 - decay * oscillation);
          break;
        }

        // --- NOISE & PROCEDURAL ---
        case 'noise-perlin': {
          const t = (resolvedInputs['in-time'] ?? ctx.timeSeconds) * (node.params['speed'] ?? 2.0);
          const noise = this.perlinNoise1D(t);
          nodeOut = noise * (node.params['intensity'] ?? 20.0);
          break;
        }

        // --- OUTPUTS ---
        case 'out-scale':
        case 'out-position-y':
        case 'out-position-x':
        case 'out-rotation':
        case 'out-opacity':
        case 'out-glow-aura':
        case 'out-camera-shake':
        case 'out-particle-rate': {
          const val = resolvedInputs['in-val'] ?? 0;
          finalOutputs[node.kind] = Math.round(val * 10) / 10;
          nodeOut = val;
          break;
        }

        default:
          nodeOut = 0;
      }

      nodeValues[node.id] = Math.round(nodeOut * 100) / 100;

      // Assign outputs to socket map
      node.outputs.forEach((outSocket) => {
        socketValues[`${node.id}_${outSocket.id}`] = nodeOut;
      });
    });

    return {
      outputs: finalOutputs,
      nodeValues,
    };
  }

  /**
   * Bakes continuous procedural graph evaluations into discrete Bézier animation keyframes.
   */
  static bakeGraphToKeyframes(
    graph: ProceduralGraphSchema,
    targetOutputKind: string,
    durationSeconds = 2.0,
    fps = 60
  ): KeyframePoint[] {
    const totalFrames = Math.round(durationSeconds * fps);
    const keyframes: KeyframePoint[] = [];

    for (let f = 0; f <= totalFrames; f += 4) {
      const timeSec = f / fps;
      const ctx: EvaluationContext = {
        timeSeconds: timeSec,
        frameIndex: f,
        fps,
        audioBass: Math.sin(timeSec * 6) > 0.5 ? 0.9 : 0.2,
        audioBeat: f % 30 === 0,
        audioTreble: 0.4,
        mouseDistancePx: 100,
        charIndex: 0,
      };

      const result = this.evaluateGraph(graph, ctx);
      const val = result.outputs[targetOutputKind] ?? 100;

      keyframes.push({
        id: 9800 + f,
        time: Math.round((f / totalFrames) * 100 * 10) / 10,
        value: val,
        type: 'bezier',
        handleIn: { x: 0.25, y: val },
        handleOut: { x: 0.25, y: val },
      });
    }

    return keyframes;
  }
}

export const SAMPLE_PROCEDURAL_PRESETS: ProceduralGraphSchema[] = [
  {
    id: 'graph-spring-bounce',
    name: 'Harmonic Sine Spring Bounce',
    category: 'motion',
    description: 'Generates a continuous harmonic oscillation with 2nd-order spring damping mapped to Scale.',
    nodes: [
      {
        id: 'n-time',
        name: 'Time (s)',
        category: 'input',
        kind: 'in-time',
        positionX: 30,
        positionY: 80,
        inputs: [],
        outputs: [{ id: 'out-t', name: 'Time', type: 'number', value: 0 }],
        params: {},
      },
      {
        id: 'n-sin',
        name: 'Sine Wave',
        category: 'trigonometry',
        kind: 'trig-sin-cos',
        positionX: 180,
        positionY: 80,
        inputs: [{ id: 'in-t', name: 'Time', type: 'number', value: 0 }],
        outputs: [{ id: 'out-sin', name: 'Sine', type: 'number', value: 0 }],
        params: { frequency: 1.5, amplitude: 1.0 },
      },
      {
        id: 'n-remap',
        name: 'Remap [-1, 1] ➔ [100, 140]',
        category: 'interpolation',
        kind: 'interp-remap',
        positionX: 340,
        positionY: 80,
        inputs: [{ id: 'in-val', name: 'Value', type: 'number', value: 0 }],
        outputs: [{ id: 'out-remap', name: 'Remapped', type: 'number', value: 100 }],
        params: { inMin: -1, inMax: 1, outMin: 100, outMax: 140 },
      },
      {
        id: 'n-out-scale',
        name: 'Scale Output',
        category: 'output',
        kind: 'out-scale',
        positionX: 520,
        positionY: 80,
        inputs: [{ id: 'in-val', name: 'Scale (%)', type: 'number', value: 100 }],
        outputs: [],
        params: {},
      },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'n-time', fromSocketId: 'out-t', toNodeId: 'n-sin', toSocketId: 'in-t' },
      { id: 'w2', fromNodeId: 'n-sin', fromSocketId: 'out-sin', toNodeId: 'n-remap', toSocketId: 'in-val' },
      { id: 'w3', fromNodeId: 'n-remap', fromSocketId: 'out-remap', toNodeId: 'n-out-scale', toSocketId: 'in-val' },
    ],
  },
  {
    id: 'graph-noise-camera-shake',
    name: 'Perlin Noise Camera Shake',
    category: 'camera',
    description: 'Continuous organic camera handheld jitter driven by deterministic Perlin noise math.',
    nodes: [
      {
        id: 'n-time',
        name: 'Time (s)',
        category: 'input',
        kind: 'in-time',
        positionX: 30,
        positionY: 80,
        inputs: [],
        outputs: [{ id: 'out-t', name: 'Time', type: 'number', value: 0 }],
        params: {},
      },
      {
        id: 'n-noise',
        name: 'Perlin Noise 1D',
        category: 'noise-procedural',
        kind: 'noise-perlin',
        positionX: 180,
        positionY: 80,
        inputs: [{ id: 'in-time', name: 'Time', type: 'number', value: 0 }],
        outputs: [{ id: 'out-noise', name: 'Noise', type: 'number', value: 0 }],
        params: { speed: 4.0, intensity: 22.0 },
      },
      {
        id: 'n-out-shake',
        name: 'Camera Shake Output',
        category: 'output',
        kind: 'out-camera-shake',
        positionX: 360,
        positionY: 80,
        inputs: [{ id: 'in-val', name: 'Shake (px)', type: 'number', value: 0 }],
        outputs: [],
        params: {},
      },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'n-time', fromSocketId: 'out-t', toNodeId: 'n-noise', toSocketId: 'in-time' },
      { id: 'w2', fromNodeId: 'n-noise', fromSocketId: 'out-noise', toNodeId: 'n-out-shake', toSocketId: 'in-val' },
    ],
  },
  {
    id: 'graph-audio-bass-pop',
    name: 'Audio-Reactive Bass Spring',
    category: 'audio',
    description: 'Detects audio bass spikes and passes through 2nd-order spring physics into Glow Aura & Scale.',
    nodes: [
      {
        id: 'n-bass',
        name: 'Audio Bass Input',
        category: 'input',
        kind: 'in-audio-bass',
        positionX: 30,
        positionY: 60,
        inputs: [],
        outputs: [{ id: 'out-bass', name: 'Bass', type: 'number', value: 0.85 }],
        params: {},
      },
      {
        id: 'n-spring',
        name: 'Spring Dynamics',
        category: 'spring-physics',
        kind: 'dynamics-spring',
        positionX: 180,
        positionY: 60,
        inputs: [{ id: 'in-target', name: 'Target', type: 'number', value: 0 }],
        outputs: [{ id: 'out-spring', name: 'Spring', type: 'number', value: 0 }],
        params: { frequency: 3.2, damping: 0.6 },
      },
      {
        id: 'n-mult',
        name: 'Glow Multiplier',
        category: 'math',
        kind: 'math-multiply',
        positionX: 340,
        positionY: 60,
        inputs: [
          { id: 'in-a', name: 'Input', type: 'number', value: 0 },
          { id: 'in-b', name: 'Gain', type: 'number', value: 35 },
        ],
        outputs: [{ id: 'out-res', name: 'Glow', type: 'number', value: 0 }],
        params: {},
      },
      {
        id: 'n-out-glow',
        name: 'Glow Aura Output',
        category: 'output',
        kind: 'out-glow-aura',
        positionX: 500,
        positionY: 60,
        inputs: [{ id: 'in-val', name: 'Glow (px)', type: 'number', value: 0 }],
        outputs: [],
        params: {},
      },
    ],
    wires: [
      { id: 'w1', fromNodeId: 'n-bass', fromSocketId: 'out-bass', toNodeId: 'n-spring', toSocketId: 'in-target' },
      { id: 'w2', fromNodeId: 'n-spring', fromSocketId: 'out-spring', toNodeId: 'n-mult', toSocketId: 'in-a' },
      { id: 'w3', fromNodeId: 'n-mult', fromSocketId: 'out-res', toNodeId: 'n-out-glow', toSocketId: 'in-val' },
    ],
  },
];
