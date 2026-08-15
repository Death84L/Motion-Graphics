import React, { useState } from 'react';
import { CurveLayer, KeyframePoint } from '../../types';
import { morphCurves } from '../../../../core/math/curveMorphing';

interface CurveMorphingPanelProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  onApplyMorphedCurve: (morphed: KeyframePoint[]) => void;
}

export function CurveMorphingPanel({
  curveLayers,
  activeLayerId,
  onApplyMorphedCurve,
}: CurveMorphingPanelProps) {
  const [targetLayerId, setTargetLayerId] = useState<string>(
    curveLayers.find((l) => l.id !== activeLayerId)?.id || curveLayers[0]?.id || ''
  );
  const [blendFactor, setBlendFactor] = useState<number>(0.5);

  const activeLayer = curveLayers.find((l) => l.id === activeLayerId);
  const targetLayer = curveLayers.find((l) => l.id === targetLayerId);

  const handleMorph = (val: number) => {
    setBlendFactor(val);
    if (!activeLayer || !targetLayer) return;
    const morphed = morphCurves(activeLayer.keyframes, targetLayer.keyframes, val);
    onApplyMorphedCurve(morphed);
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
        <span style={{ color: '#06b6d4', fontSize: 13 }}>🧬</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Live Curve Morphing</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Blend dynamically between <strong>{activeLayer?.name || 'Curve A'}</strong> and a second target curve.
      </div>

      {/* Target Curve Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TARGET CURVE (B)</label>
        <select
          value={targetLayerId}
          onChange={(e) => setTargetLayerId(e.target.value)}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 11,
            color: '#38bdf8',
          }}
        >
          {curveLayers
            .filter((l) => l.id !== activeLayerId)
            .map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
        </select>
      </div>

      {/* Morph Blend Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#ec4899', fontWeight: 600 }}>Curve A (0%)</span>
          <strong style={{ color: '#06b6d4' }}>{(blendFactor * 100).toFixed(0)}% Morphed</strong>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>Curve B (100%)</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={blendFactor}
          onChange={(e) => handleMorph(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
}
