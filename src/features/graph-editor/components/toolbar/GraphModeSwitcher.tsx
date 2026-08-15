import React from 'react';
import { GraphMode } from '../../types';

interface GraphModeSwitcherProps {
  graphMode: GraphMode;
  onModeChange: (mode: GraphMode) => void;
}

export function GraphModeSwitcher({ graphMode, onModeChange }: GraphModeSwitcherProps) {
  const modes: { id: GraphMode; label: string; color: string; desc: string }[] = [
    { id: 'value', label: 'VALUE', color: '#38bdf8', desc: 'Position & Value Curve (V)' },
    { id: 'velocity', label: 'VELOCITY', color: '#10b981', desc: 'Directional Speed (dV/dt)' },
    { id: 'speed', label: 'SPEED', color: '#f59e0b', desc: 'Magnitude Speed (|v|)' },
    { id: 'acceleration', label: 'ACCEL', color: '#ec4899', desc: 'Acceleration (d²V/dt²)' },
    { id: 'jerk', label: 'JERK', color: '#f43f5e', desc: 'Jerk & Mechanical Shock (d³V/dt³)' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#080d1a',
        padding: 3,
        borderRadius: 10,
        border: '1px solid #1e293b',
      }}
    >
      {modes.map((m) => {
        const isActive = graphMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            style={{
              padding: '5px 10px',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.5,
              borderRadius: 7,
              background: isActive ? m.color : 'transparent',
              color: isActive ? '#0b1329' : '#94a3b8',
              boxShadow: isActive ? `0 0 12px ${m.color}66` : 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={m.desc}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
