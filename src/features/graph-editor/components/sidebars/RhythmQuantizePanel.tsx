import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import { quantizeKeyframesToRhythm, MusicalSubdivision } from '../../../../core/states/rhythmQuantizer';
import { DEFAULT_MARKERS_WITH_METADATA, GraphMarkerMetadata } from '../../../../core/states/markerMetadata';

interface RhythmQuantizePanelProps {
  keyframes: KeyframePoint[];
  fps: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function RhythmQuantizePanel({
  keyframes,
  fps,
  onUpdateKeyframes,
}: RhythmQuantizePanelProps) {
  const [bpm, setBpm] = useState(128);
  const [subdiv, setSubdiv] = useState<MusicalSubdivision>('1/4');

  const handleQuantize = () => {
    const quantized = quantizeKeyframesToRhythm(keyframes, bpm, fps, subdiv);
    onUpdateKeyframes(quantized);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#f59e0b', fontSize: 13 }}>🥁</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Rhythm Quantizer & Cues</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>BPM</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, padding: '5px 8px', color: '#f8fafc', fontSize: 11 }}
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>SUBDIVISION</label>
          <select
            value={subdiv}
            onChange={(e) => setSubdiv(e.target.value as MusicalSubdivision)}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, padding: '5px 8px', color: '#f8fafc', fontSize: 11 }}
          >
            <option value="1/1">1/1 (Whole Beat)</option>
            <option value="1/2">1/2 Beat</option>
            <option value="1/4">1/4 Beat</option>
            <option value="1/8">1/8 Beat</option>
            <option value="1/16">1/16 Beat</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleQuantize}
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ⚡ Snap Keyframes to Rhythm Grid
      </button>

      {/* Marker Cues */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>METADATA MARKERS</span>
        {DEFAULT_MARKERS_WITH_METADATA.map((m) => (
          <div
            key={m.id}
            style={{
              background: '#11182c',
              border: `1px solid ${m.color}44`,
              borderRadius: 6,
              padding: '4px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 10,
            }}
          >
            <span style={{ color: m.color, fontWeight: 700 }}>{m.label} ({m.frame}f)</span>
            <span style={{ color: '#94a3b8' }}>{m.category.toUpperCase()} • {m.intensity}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
