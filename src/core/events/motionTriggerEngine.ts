import { UIInteractionState } from '../states/interactionStateMachine';

export type MotionEventType =
  | 'onLoad'
  | 'onClick'
  | 'onHover'
  | 'onPress'
  | 'onRelease'
  | 'onEnter'
  | 'onExit'
  | 'onBeat'
  | 'onMarker'
  | 'onComplete';

export interface MotionEventBinding {
  id: string;
  eventType: MotionEventType;
  actionType: 'transition-state' | 'play-stage' | 'trigger-modifier' | 'reset-timeline';
  targetState?: UIInteractionState;
  targetStageId?: string;
  targetModifierId?: string;
  enabled: boolean;
}

export const DEFAULT_EVENT_BINDINGS: MotionEventBinding[] = [
  {
    id: 'evt-hover-enter',
    eventType: 'onHover',
    actionType: 'transition-state',
    targetState: 'hover',
    enabled: true,
  },
  {
    id: 'evt-click-press',
    eventType: 'onPress',
    actionType: 'transition-state',
    targetState: 'pressed',
    enabled: true,
  },
  {
    id: 'evt-release',
    eventType: 'onRelease',
    actionType: 'transition-state',
    targetState: 'active',
    enabled: true,
  },
  {
    id: 'evt-exit-idle',
    eventType: 'onExit',
    actionType: 'transition-state',
    targetState: 'idle',
    enabled: true,
  },
];
