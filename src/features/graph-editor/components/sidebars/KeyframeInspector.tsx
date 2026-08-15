import React from 'react';
import { KeyframePoint, KeyframeType, EasingType } from '../../types';
import { calculateAngleAndLength, calculateDelta } from '../../../../core/math/tangentMath';

interface KeyframeInspectorProps {
  selectedKeyframes: KeyframePoint[];
  onUpdateKeyframe: (id: number, updates: Partial<KeyframePoint>) => void;
  onDeleteKeyframe: (id: number) => void;
}

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
          borderRadius: 14,
          padding: 14,
          color: '#64748b',
          fontSize: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 120,
          textAlign: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 20 }}>◆</span>
        <span>No keyframe selected</span>
        <span style={{ fontSize: 11, color: '#475569' }}>
          Click or marquee drag nodes on canvas to inspect
        </span>
      </div>
    );
  }

  const kf = selectedKeyframes[0];
  const inStats = kf.handleIn ? calculateAngleAndLength(kf.handleIn.x, kf.handleIn.y) : { angle: 180, length: 15 };
  const outStats = kf.handleOut ? calculateAngleAndLength(kf.handleOut.x, kf.handleOut.y) : { angle: 0, length: 15 };

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b', fontSize: 13 }}>◆</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Keyframe Inspector
          </span>
          {selectedKeyframes.length > 1 && (
            <span style={{ fontSize: 10, background: '#1e293b', padding: '2px 5px', borderRadius: 4, color: '#94a3b8' }}>
              +{selectedKeyframes.length - 1}
            </span>
          )}
        </div>

        <button
          onClick={() => onDeleteKeyframe(kf.id)}
          style={{
            background: 'transparent',
            color: '#f43f5e',
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
          }}
          title="Delete Keyframe"
        >
          🗑 Delete
        </button>
      </div>

      {/* Time & Value Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TIME (0-100f)</label>
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
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#f1f5f9',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>VALUE (%)</label>
          <input
            type="number"
            min={-100}
            max={200}
            step={1}
            value={kf.value}
            onChange={(e) => onUpdateKeyframe(kf.id, { value: Number(e.target.value) })}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              color: '#38bdf8',
            }}
          />
        </div>
      </div>

      {/* Keyframe Type */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>KEYFRAME GLYPH & TYPE</label>
        <select
          value={kf.type || 'bezier'}
          onChange={(e) => onUpdateKeyframe(kf.id, { type: e.target.value as KeyframeType })}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 11,
            color: '#f1f5f9',
          }}
        >
          <option value="bezier">● Bezier Spline</option>
          <option value="linear">◆ Linear Direct</option>
          <option value="auto">◇ Auto Smooth</option>
          <option value="hold">■ Hold (Freeze)</option>
        </select>
      </div>

      {/* Handle Angles and Lengths */}
      {(kf.type === 'bezier' || !kf.type) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 600 }}>IN HANDLE</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                value={inStats.angle}
                title="In Handle Angle (Deg)"
                onChange={(e) => {
                  const newAngle = Number(e.target.value);
                  const d = calculateDelta(newAngle, inStats.length);
                  onUpdateKeyframe(kf.id, {
                    handleIn: { ...d, angle: newAngle, length: inStats.length },
                  });
                }}
                style={{
                  width: '50%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  padding: '3px 4px',
                  fontSize: 10,
                  color: '#f1f5f9',
                  fontFamily: 'monospace',
                }}
              />
              <input
                type="number"
                min={1}
                value={inStats.length}
                title="In Handle Length"
                onChange={(e) => {
                  const newLen = Number(e.target.value);
                  const d = calculateDelta(inStats.angle, newLen);
                  onUpdateKeyframe(kf.id, {
                    handleIn: { ...d, angle: inStats.angle, length: newLen },
                  });
                }}
                style={{
                  width: '50%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  padding: '3px 4px',
                  fontSize: 10,
                  color: '#f1f5f9',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 10, color: '#fbbf24', fontWeight: 600 }}>OUT HANDLE</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="number"
                value={outStats.angle}
                title="Out Handle Angle (Deg)"
                onChange={(e) => {
                  const newAngle = Number(e.target.value);
                  const d = calculateDelta(newAngle, outStats.length);
                  onUpdateKeyframe(kf.id, {
                    handleOut: { ...d, angle: newAngle, length: outStats.length },
                  });
                }}
                style={{
                  width: '50%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  padding: '3px 4px',
                  fontSize: 10,
                  color: '#f1f5f9',
                  fontFamily: 'monospace',
                }}
              />
              <input
                type="number"
                min={1}
                value={outStats.length}
                title="Out Handle Length"
                onChange={(e) => {
                  const newLen = Number(e.target.value);
                  const d = calculateDelta(outStats.angle, newLen);
                  onUpdateKeyframe(kf.id, {
                    handleOut: { ...d, angle: outStats.angle, length: newLen },
                  });
                }}
                style={{
                  width: '50%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  padding: '3px 4px',
                  fontSize: 10,
                  color: '#f1f5f9',
                  fontFamily: 'monospace',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Value Presets */}
      <div style={{ display: 'flex', gap: 4 }}>
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
              padding: '3px 0',
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
            }}
          >
            {v}%
          </button>
        ))}
      </div>
    </div>
  );
}
