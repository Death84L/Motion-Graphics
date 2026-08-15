import { KeyframePoint } from '../../features/graph-editor/types';

export type UiAnimationState = 'idle' | 'hover' | 'pressed' | 'active' | 'disabled' | 'exit';
export type InteractiveStateKey = UiAnimationState;

export interface StateTransformProps {
  scale: number;
  translateY: number;
  rotateDeg: number;
  opacity: number;
  shadowElevationPx: number;
  transitionMs: number;
  springDamping?: number;
}

export interface StateTransition {
  from: UiAnimationState;
  to: UiAnimationState;
  durationFrames: number;
  curveKeyframes: KeyframePoint[];
}

export const DEFAULT_STATE_TRANSITIONS: StateTransition[] = [
  {
    from: 'idle',
    to: 'hover',
    durationFrames: 8,
    curveKeyframes: [
      { id: 1, time: 0, value: 100, type: 'bezier', handleOut: { x: 0.16, y: 1 } },
      { id: 2, time: 8, value: 106, type: 'bezier', handleIn: { x: 0.3, y: 1 } },
    ],
  },
  {
    from: 'hover',
    to: 'pressed',
    durationFrames: 5,
    curveKeyframes: [
      { id: 3, time: 0, value: 106, type: 'bezier', handleOut: { x: 0.2, y: 0.8 } },
      { id: 4, time: 5, value: 95, type: 'bezier', handleIn: { x: 0.4, y: 1 } },
    ],
  },
  {
    from: 'pressed',
    to: 'active',
    durationFrames: 12,
    curveKeyframes: [
      { id: 5, time: 0, value: 95, type: 'bezier', handleOut: { x: 0.1, y: 1.2 } },
      { id: 6, time: 7, value: 103, type: 'bezier', handleIn: { x: 0.25, y: 1 } },
      { id: 7, time: 12, value: 100, type: 'bezier', handleIn: { x: 0.5, y: 1 } },
    ],
  },
];

export class AnimationStateMachine {
  private currentState: UiAnimationState = 'idle';
  private transitions: StateTransition[];

  constructor(transitions: StateTransition[] = DEFAULT_STATE_TRANSITIONS) {
    this.transitions = transitions;
  }

  getCurrentState(): UiAnimationState {
    return this.currentState;
  }

  transitionTo(nextState: UiAnimationState): StateTransition | undefined {
    const transition = this.transitions.find(
      (t) => (t.from === this.currentState && t.to === nextState) || t.to === nextState
    );
    this.currentState = nextState;
    return transition;
  }
}

export interface AnimationStateMachineSchema {
  id: string;
  name: string;
  initialState: InteractiveStateKey;
  states: Record<InteractiveStateKey, StateTransformProps>;
}

export const DEFAULT_BUTTON_STATE_MACHINE: AnimationStateMachineSchema = {
  id: 'sm-tactile-button',
  name: 'Tactile Pill Button State Machine',
  initialState: 'idle',
  states: {
    idle: { scale: 1.0, translateY: 0, rotateDeg: 0, opacity: 1.0, shadowElevationPx: 8, transitionMs: 200 },
    hover: { scale: 1.05, translateY: -2, rotateDeg: 0, opacity: 1.0, shadowElevationPx: 16, transitionMs: 140, springDamping: 0.12 },
    pressed: { scale: 0.95, translateY: 1, rotateDeg: 0, opacity: 0.95, shadowElevationPx: 4, transitionMs: 80, springDamping: 0.05 },
    active: { scale: 1.02, translateY: 0, rotateDeg: 0, opacity: 1.0, shadowElevationPx: 12, transitionMs: 160 },
    disabled: { scale: 1.0, translateY: 0, rotateDeg: 0, opacity: 0.4, shadowElevationPx: 0, transitionMs: 200 },
    exit: { scale: 0.9, translateY: 10, rotateDeg: 0, opacity: 0, shadowElevationPx: 0, transitionMs: 150 },
  },
};

/**
 * Generates production-ready React Framer Motion variant code from an Animation State Machine.
 */
export function exportStateMachineToFramerMotion(schema: AnimationStateMachineSchema): string {
  return `export const ${schema.id.replace(/-/g, '_')}Variants = {
  idle: { scale: ${schema.states.idle.scale}, y: ${schema.states.idle.translateY}, opacity: ${schema.states.idle.opacity}, transition: { duration: ${schema.states.idle.transitionMs / 1000} } },
  hover: { scale: ${schema.states.hover.scale}, y: ${schema.states.hover.translateY}, opacity: ${schema.states.hover.opacity}, transition: { type: 'spring', damping: ${schema.states.hover.springDamping || 12} } },
  pressed: { scale: ${schema.states.pressed.scale}, y: ${schema.states.pressed.translateY}, opacity: ${schema.states.pressed.opacity}, transition: { type: 'spring', damping: ${schema.states.pressed.springDamping || 8} } },
};`;
}
