import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  smoothKeyframes,
  sharpenKeyframes,
  normalizeKeyframes,
  reverseKeyframes,
  invertKeyframes,
  flattenKeyframes,
  quantizeKeyframes,
} from '../../../../core/math/smoothingAlgorithms';
import { simplifyKeyframes } from '../../../../core/math/rdpSimplifier';

interface CurveOperationsMenuProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function CurveOperationsMenu({
  keyframes,
  onUpdateKeyframes,
}: CurveOperationsMenuProps) {
  const [simplifyEpsilon, setSimplifyEpsilon] = useState<number>(2.0);

  const handleSimplify = () => {
    const simplified = simplifyKeyframes(keyframes, simplifyEpsilon);
    onUpdateKeyframes(simplified);
  };

  const handleSmooth = () => {
    onUpdateKeyframes(smoothKeyframes(keyframes, 1));
  };

  const handleSharpen = () => {
    onUpdateKeyframes(sharpenKeyframes(keyframes, 1.3));
  };

  const handleNormalize = () => {
    onUpdateKeyframes(normalizeKeyframes(keyframes, 0, 100));
  };

  const handleReverse = () => {
    onUpdateKeyframes(reverseKeyframes(keyframes));
  };

  const handleInvert = () => {
    onUpdateKeyframes(invertKeyframes(keyframes, 50));
  };

  const handleFlatten = () => {
    onUpdateKeyframes(flattenKeyframes(keyframes));
  };

  const handleQuantize = () => {
    onUpdateKeyframes(quantizeKeyframes(keyframes, 5, 10));
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
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>⚙</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Curve Operations
          </span>
        </div>
      </div>

      {/* Operation Buttons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={handleSmooth}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Apply moving average smoothing"
        >
          〰 Smooth
        </button>

        <button
          onClick={handleSharpen}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Accentuate local peaks and valleys"
        >
          ▲ Sharpen
        </button>

        <button
          onClick={handleNormalize}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Fit values between 0% and 100%"
        >
          ⇅ Normalize (0–100%)
        </button>

        <button
          onClick={handleReverse}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Flip timing horizontally"
        >
          ⇄ Reverse Time
        </button>

        <button
          onClick={handleInvert}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Flip values upside down around 50%"
        >
          ⇅ Invert Values
        </button>

        <button
          onClick={handleFlatten}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Flatten all tangent handles"
        >
          — Flatten
        </button>

        <button
          onClick={handleQuantize}
          style={{
            padding: '6px 8px',
            fontSize: 11,
            fontWeight: 600,
            background: '#11182c',
            color: '#f1f5f9',
            border: '1px solid #1e293b',
            borderRadius: 6,
            cursor: 'pointer',
            textAlign: 'left',
          }}
          title="Snap keyframe time and value to grid"
        >
          ▦ Quantize
        </button>

        {/* Simplify with Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button
            onClick={handleSimplify}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: '#1e3a8a',
              color: '#38bdf8',
              border: '1px solid #3b82f6',
              borderRadius: 6,
              cursor: 'pointer',
              textAlign: 'left',
            }}
            title="Reduce dense keyframes with RDP algorithm"
          >
            📉 Simplify ({keyframes.length} pts)
          </button>
        </div>
      </div>

      {/* Simplify Tolerance Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#64748b' }}>
        <span>Tolerance:</span>
        <input
          type="range"
          min={0.5}
          max={6.0}
          step={0.5}
          value={simplifyEpsilon}
          onChange={(e) => setSimplifyEpsilon(Number(e.target.value))}
          style={{ flex: 1, accentColor: '#38bdf8' }}
        />
        <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{simplifyEpsilon.toFixed(1)}</span>
      </div>
    </div>
  );
}
