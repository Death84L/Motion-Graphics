import React from 'react';
import { KeyframePoint } from '../../types';
import { applyCurveSymmetry, SymmetryMode } from '../../../../core/operators/curveSymmetry';
import { applyCurveBoolean, CurveBooleanOp } from '../../../../core/operators/curveBooleans';
import { generateLfoCurve } from '../../../../core/operators/proceduralModulation';
import { generateAdsrEnvelope } from '../../../../core/operators/adsrEnvelope';

interface OperatorsMatrixPanelProps {
  keyframes: KeyframePoint[];
  currentTime: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function OperatorsMatrixPanel({
  keyframes,
  currentTime,
  onUpdateKeyframes,
}: OperatorsMatrixPanelProps) {
  const handleSymmetry = (mode: SymmetryMode) => {
    const sym = applyCurveSymmetry(keyframes, mode, currentTime);
    onUpdateKeyframes(sym);
  };

  const handleLfo = () => {
    const lfo = generateLfoCurve({ waveform: 'sine', frequencyHz: 3.0, amplitude: 35, offset: 50 });
    onUpdateKeyframes(lfo);
  };

  const handleAdsr = () => {
    const adsr = generateAdsrEnvelope();
    onUpdateKeyframes(adsr);
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
        <span style={{ color: '#a855f7', fontSize: 13 }}>⚗️</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Operators & Symmetry Matrix</span>
      </div>

      {/* Symmetry & Mirroring */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>SYMMETRY & MIRRORING</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <button
            onClick={() => handleSymmetry('mirror-horizontal')}
            style={{ padding: '5px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            ⇄ Flip Time
          </button>
          <button
            onClick={() => handleSymmetry('mirror-vertical')}
            style={{ padding: '5px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            ⇅ Invert Value
          </button>
          <button
            onClick={() => handleSymmetry('mirror-around-playhead')}
            style={{ padding: '5px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            ★ Mirror @ Playhead
          </button>
          <button
            onClick={() => handleSymmetry('swap-handles')}
            style={{ padding: '5px 8px', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
          >
            ⤹ Swap Tangents
          </button>
        </div>
      </div>

      {/* Procedural Modulation & Envelopes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={handleLfo}
          style={{ padding: '6px 8px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          〰️ Generate LFO
        </button>

        <button
          onClick={handleAdsr}
          style={{ padding: '6px 8px', background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', color: '#ffffff', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
        >
          📈 ADSR Envelope
        </button>
      </div>
    </div>
  );
}
