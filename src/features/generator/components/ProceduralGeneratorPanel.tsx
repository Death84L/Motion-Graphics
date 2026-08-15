import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  ProceduralGeneratorParams,
  DEFAULT_GENERATOR_PARAMS,
  generateProceduralMotion,
} from '../../../core/generator/proceduralMotionGenerator';

interface ProceduralGeneratorPanelProps {
  onApplyGeneratedKeyframes: (keyframes: KeyframePoint[]) => void;
}

export function ProceduralGeneratorPanel({ onApplyGeneratedKeyframes }: ProceduralGeneratorPanelProps) {
  const [params, setParams] = useState<ProceduralGeneratorParams>(DEFAULT_GENERATOR_PARAMS);

  const handleGenerate = () => {
    const keyframes = generateProceduralMotion(params);
    onApplyGeneratedKeyframes(keyframes);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>🪄</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Zero-Cost Procedural Generator
          </span>
        </div>
      </div>

      {/* 6 Parametric Sliders */}
      {(['energy', 'elasticity', 'smoothness', 'overshoot', 'aggression'] as const).map((field) => (
        <div key={field}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1', textTransform: 'capitalize' }}>
            <span>{field}:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{params[field]}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={params[field]}
            onChange={(e) => setParams({ ...params, [field]: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      ))}

      {/* Duration Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Duration:</span>
          <span style={{ color: '#ec4899', fontWeight: 700 }}>{params.durationMs}ms</span>
        </div>
        <input
          type="range"
          min="150"
          max="1500"
          step="50"
          value={params.durationMs}
          onChange={(e) => setParams({ ...params, durationMs: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#ec4899' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
          marginTop: 4,
        }}
      >
        ✨ Generate Motion
      </button>
    </div>
  );
}
