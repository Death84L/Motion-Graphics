import React, { useState } from 'react';
import { CurveLayer, KeyframePoint } from '../../types';
import {
  computeLinkedCurveKeyframes,
  CurveLinkMode,
} from '../../../../core/procedural/linkedCurvesEngine';

interface LinkedCurvesPanelProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  onApplyLinkedKeyframes: (targetLayerId: string, keyframes: KeyframePoint[]) => void;
}

export function LinkedCurvesPanel({
  curveLayers,
  activeLayerId,
  onApplyLinkedKeyframes,
}: LinkedCurvesPanelProps) {
  const [targetLayerId, setTargetLayerId] = useState<string>(
    curveLayers.find((l) => l.id !== activeLayerId)?.id || curveLayers[0]?.id || ''
  );
  const [mode, setMode] = useState<CurveLinkMode>('multiply');
  const [factor, setFactor] = useState<number>(0.8);

  const activeLayer = curveLayers.find((l) => l.id === activeLayerId);

  const handleApplyLink = () => {
    if (!activeLayer) return;
    const generated = computeLinkedCurveKeyframes(activeLayer.keyframes, {
      sourceLayerId: activeLayerId,
      targetLayerId,
      mode,
      factor,
    });
    onApplyLinkedKeyframes(targetLayerId, generated);
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
        <span style={{ color: '#ec4899', fontSize: 13 }}>🔗</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Procedural Linked Curves</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Drive another curve from <strong>{activeLayer?.name}</strong> automatically.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TARGET DRIVEN CURVE</label>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>RELATIONSHIP</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as CurveLinkMode)}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 11,
              color: '#f8fafc',
            }}
          >
            <option value="multiply">Multiply (Scale)</option>
            <option value="offset">Offset (+Value)</option>
            <option value="invert">Invert (100 - V)</option>
            <option value="follow">Follow (Lag Time)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>FACTOR</label>
          <input
            type="number"
            step="0.1"
            value={factor}
            onChange={(e) => setFactor(parseFloat(e.target.value))}
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
        onClick={handleApplyLink}
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 12px',
          fontSize: 11,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        ⚡ Drive Target Curve
      </button>
    </div>
  );
}
