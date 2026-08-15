import React, { useState, useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  PhysicsSimulationConfig,
  DEFAULT_PHYSICS_CONFIG,
  simulatePhysicsTrajectory,
} from '../../../core/physics/physicsSandboxEngine';

interface PhysicsSandboxViewProps {
  onApplyPhysicsKeyframes: (keyframes: KeyframePoint[]) => void;
}

export function PhysicsSandboxView({ onApplyPhysicsKeyframes }: PhysicsSandboxViewProps) {
  const [config, setConfig] = useState<PhysicsSimulationConfig>(DEFAULT_PHYSICS_CONFIG);
  const [activeShape, setActiveShape] = useState<'ball' | 'box' | 'pill'>('ball');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(0);

  const simulation = useMemo(() => simulatePhysicsTrajectory(config), [config]);

  // Simulation tick loop
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((f) => (f >= config.totalFrames ? 0 : f + 1));
    }, 33);
    return () => clearInterval(interval);
  }, [isPlaying, config.totalFrames]);

  const currentPosY = simulation.trajectory[Math.min(currentFrame, simulation.trajectory.length - 1)]?.y ?? 0;

  const handleApply = () => {
    onApplyPhysicsKeyframes(simulation.keyframes);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* 2D Physics Viewport */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'relative',
          background: 'radial-gradient(circle at center, #0e1526 0%, #02050e 100%)',
          padding: 30,
        }}
      >
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🧪</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Interactive Physics Motion Sandbox
          </span>
        </div>

        {/* Dropping Physical Object */}
        <div
          style={{
            position: 'absolute',
            bottom: 40 + currentPosY,
            width: 50,
            height: 50,
            borderRadius: activeShape === 'ball' ? '50%' : activeShape === 'pill' ? 25 : 8,
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.5)',
            transition: 'bottom 0.03s linear',
          }}
        />

        {/* Floor Line */}
        <div style={{ width: '80%', height: 2, background: '#334155', boxShadow: '0 0 10px rgba(56, 189, 248, 0.3)' }} />
        <span style={{ fontSize: 9, color: '#64748b', marginTop: 8 }}>Floor Level (0px)</span>
      </div>

      {/* Right Controls Panel */}
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
          Physics Environment
        </div>

        {/* Gravity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Gravity Acceleration:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{config.gravity.toFixed(1)} m/s²</span>
          </div>
          <input
            type="range"
            min="4"
            max="32"
            step="1"
            value={config.gravity}
            onChange={(e) => setConfig({ ...config, gravity: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Restitution (Bounce) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Restitution (Bounciness):</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{(config.restitution * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.95"
            step="0.05"
            value={config.restitution}
            onChange={(e) => setConfig({ ...config, restitution: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        {/* Initial Height */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Drop Height:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{config.initialHeightPx}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="350"
            step="10"
            value={config.initialHeightPx}
            onChange={(e) => setConfig({ ...config, initialHeightPx: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        <button
          onClick={handleApply}
          style={{
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            color: '#080d1a',
            border: 'none',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          ✨ Export Physics to Curve
        </button>
      </div>
    </div>
  );
}
