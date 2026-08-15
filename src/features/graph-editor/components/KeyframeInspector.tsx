import React from 'react';
import type { KeyframePoint, EasingType } from '../types';

type KeyframeInspectorProps = {
  selectedKeyframes: KeyframePoint[];
  onUpdateKeyframe: (id: number, updates: Partial<KeyframePoint>) => void;
  onDeleteKeyframe: (id: number) => void;
};

export function KeyframeInspector({
  selectedKeyframes,
  onUpdateKeyframe,
  onDeleteKeyframe,
}: KeyframeInspectorProps) {
  if (selectedKeyframes.length === 0) {
    return (
      <div
        style={{
          background: '#0c1222',
          border: '1px solid #1e293b',
          borderRadius: 16,
          padding: 16,
          color: '#64748b',
          fontSize: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 140,
          textAlign: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 24 }}>◆</span>
        <span>No keyframe selected</span>
        <span style={{ fontSize: 11, color: '#475569' }}>
          Click or drag any node on the graph canvas to inspect and edit
        </span>
      </div>
    );
  }

  const kf = selectedKeyframes[0];

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b', fontSize: 14 }}>◆</span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>
            Keyframe Inspector
          </span>
          {selectedKeyframes.length > 1 && (
            <span style={{ fontSize: 11, background: '#1e293b', padding: '2px 6px', borderRadius: 6, color: '#94a3b8' }}>
              +{selectedKeyframes.length - 1} more
            </span>
          )}
        </div>

        <button
          onClick={() => onDeleteKeyframe(kf.id)}
          style={{
            background: 'transparent',
            color: '#f43f5e',
            fontSize: 12,
            padding: '2px 6px',
            borderRadius: 6,
          }}
          title="Delete Keyframe"
        >
          🗑 Delete
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Time input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TIME (0-100f)</label>
          <input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={kf.time}
            onChange={(e) => onUpdateKeyframe(kf.id, { time: Number(e.target.value) })}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#f1f5f9',
            }}
          />
        </div>

        {/* Value input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>VALUE (%)</label>
          <input
            type="number"
            min={-50}
            max={150}
            step={1}
            value={kf.value}
            onChange={(e) => onUpdateKeyframe(kf.id, { value: Number(e.target.value) })}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '6px 10px',
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#38bdf8',
            }}
          />
        </div>
      </div>

      {/* Easing Type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>INTERPOLATION / EASING</label>
        <select
          value={kf.ease || 'easeInOut'}
          onChange={(e) => onUpdateKeyframe(kf.id, { ease: e.target.value as EasingType })}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: 12,
            color: '#f1f5f9',
          }}
        >
          <option value="easeInOut">Ease In-Out (Smooth)</option>
          <option value="easeIn">Ease In (Accelerate)</option>
          <option value="easeOut">Ease Out (Decelerate)</option>
          <option value="linear">Linear (Constant)</option>
          <option value="bounce">Bounce Physics</option>
          <option value="elastic">Elastic Spring</option>
          <option value="anticipate">Anticipate / Back</option>
          <option value="step">Step (Quantized)</option>
        </select>
      </div>

      {/* Quick Value Presets */}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <button
            key={v}
            onClick={() => onUpdateKeyframe(kf.id, { value: v })}
            style={{
              flex: 1,
              background: '#11182c',
              color: '#94a3b8',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '4px 0',
              fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {v}%
          </button>
        ))}
      </div>
    </div>
  );
}
