import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  AnimationStateMachine,
  UiAnimationState,
  DEFAULT_STATE_TRANSITIONS,
} from '../../../../core/states/animationStateMachine';

interface AnimationStatePanelProps {
  onApplyTransitionCurve: (keyframes: KeyframePoint[]) => void;
}

export function AnimationStatePanel({ onApplyTransitionCurve }: AnimationStatePanelProps) {
  const [fsm] = useState(() => new AnimationStateMachine(DEFAULT_STATE_TRANSITIONS));
  const [activeState, setActiveState] = useState<UiAnimationState>('idle');

  const handleStateClick = (state: UiAnimationState) => {
    const transition = fsm.transitionTo(state);
    setActiveState(state);
    if (transition) {
      onApplyTransitionCurve(transition.curveKeyframes);
    }
  };

  const states: UiAnimationState[] = ['idle', 'hover', 'pressed', 'active', 'exit'];

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#10b981', fontSize: 13 }}>🔘</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>UI Animation State Machine</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Click states to preview dynamic micro-interaction transition splines.
      </div>

      {/* State Flow Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {states.map((st) => (
          <button
            key={st}
            onClick={() => handleStateClick(st)}
            style={{
              padding: '6px 12px',
              background: activeState === st ? '#10b981' : '#11182c',
              color: activeState === st ? '#090e1a' : '#f8fafc',
              border: `1px solid ${activeState === st ? '#10b981' : '#1e293b'}`,
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {st}
          </button>
        ))}
      </div>
    </div>
  );
}
