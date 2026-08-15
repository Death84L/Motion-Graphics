import { KeyframePoint } from '../../features/graph-editor/types';

export type UIInteractionState = 'idle' | 'hover' | 'pressed' | 'active' | 'disabled';

export interface UIStateTransform {
  scale: number;
  translateY: number;
  opacity: number;
  glow: number;
}

export interface UIComponentInteractionPreset {
  id: string;
  name: string;
  category: 'button' | 'card' | 'toggle' | 'modal';
  states: Record<UIInteractionState, UIStateTransform>;
  transitionDurationMs: number;
}

export const DEFAULT_UI_STATE_PRESETS: UIComponentInteractionPreset[] = [
  {
    id: 'btn-tactile-pop',
    name: 'Tactile Pill Button',
    category: 'button',
    transitionDurationMs: 180,
    states: {
      idle: { scale: 1.0, translateY: 0, opacity: 1.0, glow: 0 },
      hover: { scale: 1.05, translateY: -3, opacity: 1.0, glow: 14 },
      pressed: { scale: 0.95, translateY: 2, opacity: 0.9, glow: 4 },
      active: { scale: 1.02, translateY: -1, opacity: 1.0, glow: 20 },
      disabled: { scale: 1.0, translateY: 0, opacity: 0.4, glow: 0 },
    },
  },
  {
    id: 'card-lift-glow',
    name: 'Elevated Glass Card',
    category: 'card',
    transitionDurationMs: 240,
    states: {
      idle: { scale: 1.0, translateY: 0, opacity: 1.0, glow: 0 },
      hover: { scale: 1.03, translateY: -8, opacity: 1.0, glow: 25 },
      pressed: { scale: 0.98, translateY: -2, opacity: 0.95, glow: 10 },
      active: { scale: 1.02, translateY: -6, opacity: 1.0, glow: 30 },
      disabled: { scale: 0.98, translateY: 0, opacity: 0.5, glow: 0 },
    },
  },
  {
    id: 'toggle-switch-snap',
    name: 'Haptic Toggle Switch',
    category: 'toggle',
    transitionDurationMs: 140,
    states: {
      idle: { scale: 1.0, translateY: 0, opacity: 1.0, glow: 0 },
      hover: { scale: 1.08, translateY: 0, opacity: 1.0, glow: 8 },
      pressed: { scale: 0.92, translateY: 0, opacity: 0.85, glow: 2 },
      active: { scale: 1.0, translateY: 0, opacity: 1.0, glow: 15 },
      disabled: { scale: 0.9, translateY: 0, opacity: 0.3, glow: 0 },
    },
  },
];

/**
 * Builds transition keyframes between UI interaction states.
 */
export function buildStateTransitionCurve(
  fromState: UIStateTransform,
  toState: UIStateTransform,
  property: 'scale' | 'translateY' | 'opacity'
): KeyframePoint[] {
  const fromVal = property === 'scale' ? fromState.scale * 100 : property === 'translateY' ? fromState.translateY : fromState.opacity * 100;
  const toVal = property === 'scale' ? toState.scale * 100 : property === 'translateY' ? toState.translateY : toState.opacity * 100;

  return [
    { id: 1, time: 0, value: Math.round(fromVal * 10) / 10, type: 'bezier', ease: 'easeInOut' },
    { id: 2, time: 100, value: Math.round(toVal * 10) / 10, type: 'bezier', ease: 'easeInOut' },
  ];
}
