import React from 'react';
import { KeyframePoint } from '../../types';
import { matchCurveToReference, CurveMatchMode } from '../../../../core/math/curveMatching';

interface ReferenceMatchingPanelProps {
  currentKeyframes: KeyframePoint[];
  ghostKeyframes?: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function ReferenceMatchingPanel({
  currentKeyframes,
  ghostKeyframes,
  onUpdateKeyframes,
}: ReferenceMatchingPanelProps) {
  const handleMatch = (mode: CurveMatchMode) => {
    if (!ghostKeyframes || ghostKeyframes.length < 2) {
      alert('Please enable Ghost Reference baseline on a curve first.');
      return;
    }
    const matched = matchCurveToReference(currentKeyframes, ghostKeyframes, mode);
    onUpdateKeyframes(matched);
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
        <span style={{ color: '#f59e0b', fontSize: 13 }}>🎯</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Reference Curve Matching</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Conform active curve geometry to match the active Ghost Baseline reference.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={() => handleMatch('timing')}
          disabled={!ghostKeyframes}
          style={{
            padding: '7px 10px',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: 11,
            fontWeight: 600,
            cursor: ghostKeyframes ? 'pointer' : 'not-allowed',
            opacity: ghostKeyframes ? 1 : 0.5,
          }}
        >
          ⏱️ Match Timing
        </button>

        <button
          onClick={() => handleMatch('amplitude')}
          disabled={!ghostKeyframes}
          style={{
            padding: '7px 10px',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: 11,
            fontWeight: 600,
            cursor: ghostKeyframes ? 'pointer' : 'not-allowed',
            opacity: ghostKeyframes ? 1 : 0.5,
          }}
        >
          ↕️ Match Amplitude
        </button>

        <button
          onClick={() => handleMatch('shape')}
          disabled={!ghostKeyframes}
          style={{
            padding: '7px 10px',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 8,
            color: '#f8fafc',
            fontSize: 11,
            fontWeight: 600,
            cursor: ghostKeyframes ? 'pointer' : 'not-allowed',
            opacity: ghostKeyframes ? 1 : 0.5,
          }}
        >
          ∿ Match Tangents
        </button>

        <button
          onClick={() => handleMatch('full')}
          disabled={!ghostKeyframes}
          style={{
            padding: '7px 10px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            border: 'none',
            borderRadius: 8,
            color: '#ffffff',
            fontSize: 11,
            fontWeight: 700,
            cursor: ghostKeyframes ? 'pointer' : 'not-allowed',
            opacity: ghostKeyframes ? 1 : 0.5,
          }}
        >
          ✨ Full Conform
        </button>
      </div>
    </div>
  );
}
