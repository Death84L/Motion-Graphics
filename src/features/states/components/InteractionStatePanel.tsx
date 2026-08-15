import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  DEFAULT_UI_STATE_PRESETS,
  UIComponentInteractionPreset,
  UIInteractionState,
  buildStateTransitionCurve,
} from '../../../core/states/interactionStateMachine';

interface InteractionStatePanelProps {
  onApplyStateCurve: (curve: KeyframePoint[]) => void;
}

export function InteractionStatePanel({ onApplyStateCurve }: InteractionStatePanelProps) {
  const [presets] = useState<UIComponentInteractionPreset[]>(DEFAULT_UI_STATE_PRESETS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DEFAULT_UI_STATE_PRESETS[0].id);
  const [activeState, setActiveState] = useState<UIInteractionState>('hover');

  const activePreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  const handleTriggerState = (state: UIInteractionState) => {
    setActiveState(state);
    const curve = buildStateTransitionCurve(activePreset.states.idle, activePreset.states[state], 'scale');
    onApplyStateCurve(curve);
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>🎮</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            UI Component State Machine
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Test and simulate tactile UI state transitions (Buttons, Cards, Toggles, Modals).
      </div>

      {/* Preset Selector */}
      <select
        value={selectedPresetId}
        onChange={(e) => setSelectedPresetId(e.target.value)}
        style={{
          width: '100%',
          background: '#11182c',
          border: '1px solid #1e293b',
          borderRadius: 6,
          padding: '6px 8px',
          fontSize: 11,
          color: '#38bdf8',
        }}
      >
        {presets.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.category})
          </option>
        ))}
      </select>

      {/* State Switcher Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
        {(['idle', 'hover', 'pressed', 'active', 'disabled'] as UIInteractionState[]).map((st) => (
          <button
            key={st}
            onClick={() => handleTriggerState(st)}
            style={{
              padding: '6px 4px',
              fontSize: 10,
              fontWeight: activeState === st ? 800 : 600,
              background: activeState === st ? '#10b981' : '#11182c',
              color: activeState === st ? '#080d1a' : '#cbd5e1',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* State Readout Card */}
      <div style={{ background: '#11182c', padding: 8, borderRadius: 6, fontSize: 10, color: '#94a3b8' }}>
        <div>Active State: <strong style={{ color: '#10b981', textTransform: 'uppercase' }}>{activeState}</strong></div>
        <div style={{ marginTop: 2 }}>
          Scale: {(activePreset.states[activeState].scale * 100).toFixed(0)}% | TranslateY: {activePreset.states[activeState].translateY}px | Glow: {activePreset.states[activeState].glow}px
        </div>
      </div>
    </div>
  );
}
