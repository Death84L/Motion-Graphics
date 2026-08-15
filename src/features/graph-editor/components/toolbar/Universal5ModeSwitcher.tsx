import React from 'react';

export type UniversalCurveMode = 'classic' | 'velocity' | 'procedural' | 'physics' | 'dna';

interface Universal5ModeSwitcherProps {
  activeMode: UniversalCurveMode;
  onModeChange: (mode: UniversalCurveMode) => void;
}

export function Universal5ModeSwitcher({
  activeMode,
  onModeChange,
}: Universal5ModeSwitcherProps) {
  const modes: { id: UniversalCurveMode; label: string; icon: string; color: string; desc: string }[] = [
    { id: 'classic', label: 'Classic Curves', icon: '📈', color: '#38bdf8', desc: 'Blender-style Multi-Channel Bézier Curve Editor' },
    { id: 'velocity', label: 'Velocity Lab', icon: '🚀', color: '#10b981', desc: 'Real-time Synchronized Derivatives (v, a, j)' },
    { id: 'procedural', label: 'Procedural Graph', icon: '🧠', color: '#8b5cf6', desc: 'Visual Motion Programming & Node Synthesis' },
    { id: 'physics', label: 'Physics Sim', icon: '🧪', color: '#f59e0b', desc: 'Multi-Body Collision & Gravity Trajectory Simulation' },
    { id: 'dna', label: 'Motion DNA', icon: '🧬', color: '#ec4899', desc: 'Kinetic Signature Extraction, Morphing & Auto-Optimize' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#040711',
        padding: '3px 4px',
        borderRadius: 10,
        border: '1px solid #1e293b',
        gap: 3,
      }}
    >
      {modes.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              fontSize: 10,
              fontWeight: 800,
              borderRadius: 6,
              background: isActive ? `${m.color}22` : 'transparent',
              color: isActive ? m.color : '#94a3b8',
              border: `1px solid ${isActive ? m.color : 'transparent'}`,
              boxShadow: isActive ? `0 0 10px ${m.color}44` : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={m.desc}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
