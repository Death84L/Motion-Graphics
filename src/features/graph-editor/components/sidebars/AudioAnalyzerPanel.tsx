import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  BandMappingConfig,
  DEFAULT_BAND_MAPPINGS,
  generateKeyframesFromAudioBand,
  FrequencyBand,
  TargetMotionProperty,
} from '../../../../core/audio/multiBandAudioAnalyzer';

interface AudioAnalyzerPanelProps {
  onApplyAudioCurve: (keyframes: KeyframePoint[]) => void;
}

export function AudioAnalyzerPanel({ onApplyAudioCurve }: AudioAnalyzerPanelProps) {
  const [mappings, setMappings] = useState<BandMappingConfig[]>(DEFAULT_BAND_MAPPINGS);
  const [selectedBand, setSelectedBand] = useState<FrequencyBand>('bass');
  const [targetProp, setTargetProp] = useState<TargetMotionProperty>('scale');
  const [gain, setGain] = useState<number>(1.5);

  const handleGenerate = () => {
    const keyframes = generateKeyframesFromAudioBand({
      band: selectedBand,
      targetProperty: targetProp,
      gain,
      threshold: 0.2,
      smoothness: 0.4,
    });
    onApplyAudioCurve(keyframes);
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎙️</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Multi-Band Audio Analyzer
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Decompose audio into frequency bands (Sub-Bass, Mid, Treble, Transients) and map directly into animation channels.
      </div>

      {/* Band Selector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>FREQUENCY BAND</label>
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value as FrequencyBand)}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: 11,
              color: '#38bdf8',
            }}
          >
            <option value="bass">Bass / Kick Drum</option>
            <option value="transients">Beat Transients / Hits</option>
            <option value="mid">Mid / Vocal Energy</option>
            <option value="treble">Treble / Hi-Hats</option>
            <option value="rms-volume">Overall RMS Power</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 10, color: '#64748b', display: 'block', marginBottom: 2 }}>TARGET PROPERTY</label>
          <select
            value={targetProp}
            onChange={(e) => setTargetProp(e.target.value as TargetMotionProperty)}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: 11,
              color: '#f8fafc',
            }}
          >
            <option value="scale">Scale (%)</option>
            <option value="translate-y">Position Y (px)</option>
            <option value="rotate">Rotation (°)</option>
            <option value="opacity">Opacity (%)</option>
          </select>
        </div>
      </div>

      {/* Gain Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
          <span>Band Gain:</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>{gain.toFixed(1)}x</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={gain}
          onChange={(e) => setGain(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#38bdf8' }}
        />
      </div>

      <button
        onClick={handleGenerate}
        style={{
          background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
          color: '#080d1a',
          border: 'none',
          borderRadius: 8,
          padding: '9px 12px',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        🎵 Extract Band to Curve
      </button>
    </div>
  );
}
