import React from 'react';
import { SnappingConfig } from '../../../../core/math/smartSnapping';

interface SnappingControlsProps {
  config: SnappingConfig;
  onChange: (updated: SnappingConfig) => void;
}

export function SnappingControls({ config, onChange }: SnappingControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#090e1a',
        padding: '3px 8px',
        borderRadius: 8,
        border: '1px solid #1e293b',
      }}
    >
      <button
        onClick={() => onChange({ ...config, enabled: !config.enabled })}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: config.enabled ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
          border: `1px solid ${config.enabled ? 'rgba(56, 189, 248, 0.4)' : '#334155'}`,
          borderRadius: 6,
          color: config.enabled ? '#38bdf8' : '#64748b',
          fontSize: 11,
          fontWeight: 700,
          padding: '3px 8px',
          cursor: 'pointer',
        }}
        title="Toggle Snapping (Cmd+Shift+;)"
      >
        <span>🧲</span>
        <span>Snap: {config.enabled ? 'ON' : 'OFF'}</span>
      </button>

      {config.enabled && (
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => onChange({ ...config, snapToGrid: !config.snapToGrid })}
            style={{
              background: config.snapToGrid ? '#1e293b' : 'transparent',
              color: config.snapToGrid ? '#38bdf8' : '#64748b',
              border: 'none',
              borderRadius: 4,
              fontSize: 10,
              padding: '2px 5px',
              cursor: 'pointer',
            }}
            title="Snap to Grid"
          >
            Grid
          </button>
          <button
            onClick={() => onChange({ ...config, snapToKeyframes: !config.snapToKeyframes })}
            style={{
              background: config.snapToKeyframes ? '#1e293b' : 'transparent',
              color: config.snapToKeyframes ? '#38bdf8' : '#64748b',
              border: 'none',
              borderRadius: 4,
              fontSize: 10,
              padding: '2px 5px',
              cursor: 'pointer',
            }}
            title="Snap to Keyframes"
          >
            Nodes
          </button>
          <button
            onClick={() => onChange({ ...config, snapToPlayhead: !config.snapToPlayhead })}
            style={{
              background: config.snapToPlayhead ? '#1e293b' : 'transparent',
              color: config.snapToPlayhead ? '#38bdf8' : '#64748b',
              border: 'none',
              borderRadius: 4,
              fontSize: 10,
              padding: '2px 5px',
              cursor: 'pointer',
            }}
            title="Snap to Playhead"
          >
            Playhead
          </button>
        </div>
      )}
    </div>
  );
}
