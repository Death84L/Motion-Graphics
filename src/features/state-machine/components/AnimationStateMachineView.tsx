import React, { useState } from 'react';
import {
  DEFAULT_BUTTON_STATE_MACHINE,
  InteractiveStateKey,
  exportStateMachineToFramerMotion,
} from '../../../core/states/animationStateMachine';

export function AnimationStateMachineView() {
  const [activeState, setActiveState] = useState<InteractiveStateKey>('idle');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const stateProps = DEFAULT_BUTTON_STATE_MACHINE.states[activeState];
  const framerCode = exportStateMachineToFramerMotion(DEFAULT_BUTTON_STATE_MACHINE);

  const handleCopy = () => {
    navigator.clipboard.writeText(framerCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* State Machine Interactive Canvas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: 'radial-gradient(circle at center, #0e1526 0%, #02050e 100%)',
          padding: 24,
        }}
      >
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#ec4899', fontSize: 16 }}>🎭</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Interactive Animation State Machine
          </span>
        </div>

        {/* Interactive State Demo Target */}
        <div
          onMouseEnter={() => setActiveState('hover')}
          onMouseLeave={() => setActiveState('idle')}
          onMouseDown={() => setActiveState('pressed')}
          onMouseUp={() => setActiveState('active')}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            borderRadius: 12,
            color: '#080d1a',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            transform: `translateY(${stateProps.translateY}px) scale(${stateProps.scale}) rotate(${stateProps.rotateDeg}deg)`,
            opacity: stateProps.opacity,
            boxShadow: `0 ${stateProps.shadowElevationPx}px 30px rgba(56, 189, 248, 0.4)`,
            transition: `all ${stateProps.transitionMs}ms cubic-bezier(0.16, 1, 0.3, 1)`,
            userSelect: 'none',
          }}
        >
          {activeState.toUpperCase()} STATE
        </div>

        <span style={{ fontSize: 10, color: '#64748b', marginTop: 24 }}>
          Hover, Click, and Release the button to test live transitions
        </span>
      </div>

      {/* Right Column: Code Exporter & State Params */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          State Machine Transitions
        </div>

        {/* State Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {(['idle', 'hover', 'pressed', 'active', 'disabled'] as InteractiveStateKey[]).map((st) => (
            <button
              key={st}
              onClick={() => setActiveState(st)}
              style={{
                padding: '4px 6px',
                fontSize: 9,
                fontWeight: activeState === st ? 800 : 500,
                background: activeState === st ? '#38bdf8' : '#11182c',
                color: activeState === st ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Framer Motion Code Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b' }}>EXPORT FRAMER MOTION</span>
            <button
              onClick={handleCopy}
              style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontSize: 9, cursor: 'pointer', fontWeight: 700 }}
            >
              {copiedCode ? '✓ Copied' : 'Copy Code'}
            </button>
          </div>
          <pre
            style={{
              background: '#040711',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: 8,
              fontSize: 9,
              fontFamily: 'monospace',
              color: '#38bdf8',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {framerCode}
          </pre>
        </div>
      </div>
    </div>
  );
}
