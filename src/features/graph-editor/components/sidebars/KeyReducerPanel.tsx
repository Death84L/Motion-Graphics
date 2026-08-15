import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import { reduceKeyframeDensity, KeyframeReductionResult } from '../../../../core/optimizer/keyframeReducer';

interface KeyReducerPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function KeyReducerPanel({ keyframes, onUpdateKeyframes }: KeyReducerPanelProps) {
  const [tolerance, setTolerance] = useState<number>(1.5);
  const [preservePeaks, setPreservePeaks] = useState<boolean>(true);
  const [lastResult, setLastResult] = useState<KeyframeReductionResult | null>(null);

  const handleRunReduction = () => {
    const result = reduceKeyframeDensity(keyframes, tolerance, preservePeaks);
    onUpdateKeyframes(result.reducedKeyframes);
    setLastResult(result);
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
          <span style={{ color: '#10b981', fontSize: 13 }}>📉</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Smart Key Reducer & Resampler
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Reduces dense keyframes (from MoCap, physics, or baking) down to optimal Bézier curves while preserving inflection points.
      </div>

      {/* Stats summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          background: '#11182c',
          padding: 10,
          borderRadius: 8,
          border: '1px solid #1e293b',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>CURRENT KEYS</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc' }}>{keyframes.length}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>COMPRESSION</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>
            {lastResult ? `${lastResult.compressionRatio}%` : '0%'}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#cbd5e1' }}>
          <span>Error Tolerance:</span>
          <span style={{ color: '#10b981', fontWeight: 700 }}>{tolerance.toFixed(1)}px / %</span>
        </div>
        <input
          type="range"
          min="0.2"
          max="5.0"
          step="0.1"
          value={tolerance}
          onChange={(e) => setTolerance(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#10b981' }}
        />

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#cbd5e1', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={preservePeaks}
            onChange={(e) => setPreservePeaks(e.target.checked)}
            style={{ accentColor: '#10b981' }}
          />
          Preserve Local Peaks & Extremas
        </label>
      </div>

      <button
        onClick={handleRunReduction}
        style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 7,
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
        }}
      >
        Reduce & Optimize Keyframes
      </button>

      {lastResult && (
        <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', background: '#080d1a', padding: 6, borderRadius: 6 }}>
          Reduced from <strong style={{ color: '#f8fafc' }}>{lastResult.originalCount}</strong> to <strong style={{ color: '#10b981' }}>{lastResult.reducedCount}</strong> keys ({lastResult.compressionRatio}% savings)
        </div>
      )}
    </div>
  );
}
