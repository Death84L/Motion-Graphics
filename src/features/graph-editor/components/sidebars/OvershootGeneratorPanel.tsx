import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  generateAnticipationOvershootCurve,
  OvershootMotionConfig,
  DEFAULT_OVERSHOOT_CONFIG,
} from '../../../../core/motion/overshootAnticipationGenerator';

interface OvershootGeneratorPanelProps {
  onApplyCurve: (keyframes: KeyframePoint[]) => void;
}

export function OvershootGeneratorPanel({ onApplyCurve }: OvershootGeneratorPanelProps) {
  const [config, setConfig] = useState<OvershootMotionConfig>(DEFAULT_OVERSHOOT_CONFIG);

  const handleGenerate = () => {
    const generated = generateAnticipationOvershootCurve(config);
    onApplyCurve(generated);
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎯</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Overshoot & Anticipation Studio
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Generate full organic animation trajectories: Wind-up (Anticipation) → Push → Overshoot → Rebound → Settle.
      </div>

      {/* Sliders */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
            <span>Anticipation Windup:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{config.anticipationPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={config.anticipationPercent}
            onChange={(e) => setConfig({ ...config, anticipationPercent: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
            <span>Overshoot Peak:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>+{config.overshootPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            value={config.overshootPercent}
            onChange={(e) => setConfig({ ...config, overshootPercent: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
            <span>Secondary Rebound Dip:</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>{config.reboundPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            value={config.reboundPercent}
            onChange={(e) => setConfig({ ...config, reboundPercent: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        style={{
          background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 2px 14px rgba(56, 189, 248, 0.4)',
        }}
      >
        ✨ Generate Organic Motion Curve
      </button>
    </div>
  );
}
