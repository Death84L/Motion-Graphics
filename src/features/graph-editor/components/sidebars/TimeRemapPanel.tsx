import React from 'react';
import { KeyframePoint } from '../../types';
import { DEFAULT_TIME_REMAP_PRESETS, TimeRemapPreset } from '../../../../core/math/timeRemapping';

interface TimeRemapPanelProps {
  onApplyRemapPreset: (preset: TimeRemapPreset) => void;
}

export function TimeRemapPanel({ onApplyRemapPreset }: TimeRemapPanelProps) {
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
        <span style={{ color: '#ec4899', fontSize: 13 }}>⏱️</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Time Remapping & Speed Ramps</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Non-linear time warping. Slope &gt; 1 = Fast, Slope &lt; 1 = Slow-mo, Flat = Freeze, Negative = Rewind.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {DEFAULT_TIME_REMAP_PRESETS.map((preset: TimeRemapPreset) => (
          <div
            key={preset.id}
            onClick={() => onApplyRemapPreset(preset)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>{preset.name}</span>
              <span style={{ fontSize: 9, color: '#64748b' }}>Apply ⚡</span>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{preset.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
