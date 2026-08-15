import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  generateAudioEnvelopeKeyframes,
  DEFAULT_AUDIO_PRESETS,
  AudioEnvelopePreset,
} from '../../../../core/procedural/audioEnvelope';

interface AudioToCurvePanelProps {
  onApplyAudioCurve: (keyframes: KeyframePoint[]) => void;
}

export function AudioToCurvePanel({ onApplyAudioCurve }: AudioToCurvePanelProps) {
  const [bpm, setBpm] = useState<number>(128);
  const [intensity, setIntensity] = useState<number>(1.0);

  const handleGenerate = (customBpm?: number, customInt?: number) => {
    const activeBpm = customBpm ?? bpm;
    const activeInt = customInt ?? intensity;
    const generated = generateAudioEnvelopeKeyframes(activeBpm, 30, activeInt);
    onApplyAudioCurve(generated);
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
        <span style={{ color: '#10b981', fontSize: 13 }}>🎵</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Audio Amplitude & Beat Sync</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Extract rhythmic audio amplitude envelope and sync motion to beats.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TEMPO (BPM)</label>
          <input
            type="number"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 11,
              color: '#f8fafc',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>INTENSITY</label>
          <input
            type="number"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 11,
              color: '#f8fafc',
            }}
          />
        </div>
      </div>

      <button
        onClick={() => handleGenerate()}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ⚡ Generate Audio Envelope
      </button>

      {/* Preset Tracks */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>RHYTHMIC PRESETS</span>
        {DEFAULT_AUDIO_PRESETS.map((preset: AudioEnvelopePreset) => (
          <div
            key={preset.id}
            onClick={() => {
              setBpm(preset.bpm);
              setIntensity(preset.intensity);
              handleGenerate(preset.bpm, preset.intensity);
            }}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{preset.name}</span>
            <span style={{ fontSize: 9, color: '#10b981' }}>{preset.bpm} BPM</span>
          </div>
        ))}
      </div>
    </div>
  );
}
