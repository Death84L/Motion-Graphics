import React, { useState } from 'react';
import { KeyframePoint, CurveLayer } from '../../graph-editor/types';
import { morphBetweenCurves } from '../../../core/presets/presetMorphEngine';
import {
  applyStaggerToLayers,
  StaggerConfig,
  DEFAULT_STAGGER_CONFIG,
  StaggerDirection,
} from '../../../core/stagger/staggerEngine';

interface PresetMorphPanelProps {
  currentKeyframes: KeyframePoint[];
  curveLayers: CurveLayer[];
  onApplyMorphedCurve: (morphedKeys: KeyframePoint[]) => void;
  onApplyStaggeredLayers: (updatedLayers: CurveLayer[]) => void;
}

export function PresetMorphPanel({
  currentKeyframes,
  curveLayers,
  onApplyMorphedCurve,
  onApplyStaggeredLayers,
}: PresetMorphPanelProps) {
  const [morphFactor, setMorphFactor] = useState<number>(0.5);
  const [staggerConfig, setStaggerConfig] = useState<StaggerConfig>(DEFAULT_STAGGER_CONFIG);

  // Default preset profiles to blend
  const presetBounce: KeyframePoint[] = [
    { id: 1, time: 0, value: 0, type: 'bezier' },
    { id: 2, time: 60, value: 100, type: 'bezier' },
    { id: 3, time: 75, value: 112, type: 'bezier' },
    { id: 4, time: 90, value: 100, type: 'bezier' },
    { id: 5, time: 100, value: 100, type: 'bezier' },
  ];

  const presetElastic: KeyframePoint[] = [
    { id: 1, time: 0, value: 0, type: 'bezier' },
    { id: 2, time: 40, value: 125, type: 'bezier' },
    { id: 3, time: 70, value: 92, type: 'bezier' },
    { id: 4, time: 88, value: 104, type: 'bezier' },
    { id: 5, time: 100, value: 100, type: 'bezier' },
  ];

  const handleMorph = (factor: number) => {
    setMorphFactor(factor);
    const result = morphBetweenCurves(presetBounce, presetElastic, factor);
    onApplyMorphedCurve(result.keyframes);
  };

  const handleApplyStagger = () => {
    const updated = applyStaggerToLayers(curveLayers, staggerConfig);
    onApplyStaggeredLayers(updated);
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
          <span style={{ color: '#ec4899', fontSize: 13 }}>🔥</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Preset Morphing & Smart Stagger
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Continuously morph between two disparate motion profiles (Bounce ↔ Elastic) or distribute multi-layer staggers.
      </div>

      {/* Preset Morph Slider */}
      <div style={{ background: '#11182c', padding: 10, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700 }}>
          <span style={{ color: '#38bdf8' }}>PRESET A (BOUNCE)</span>
          <span style={{ color: '#ec4899' }}>PRESET B (ELASTIC)</span>
        </div>

        <input
          type="range"
          min="0"
          max="1.0"
          step="0.02"
          value={morphFactor}
          onChange={(e) => handleMorph(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#ec4899', margin: '8px 0' }}
        />

        <div style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8' }}>
          Morph Ratio: <strong style={{ color: '#f8fafc' }}>{(morphFactor * 100).toFixed(0)}% Hybrid</strong>
        </div>
      </div>

      {/* Multi-Layer Smart Stagger */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Smart Layer Stagger ({curveLayers.length} Layers)
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div>
            <span style={{ fontSize: 9, color: '#64748b' }}>DIRECTION</span>
            <select
              value={staggerConfig.direction}
              onChange={(e) => setStaggerConfig({ ...staggerConfig, direction: e.target.value as StaggerDirection })}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 4,
                color: '#38bdf8',
                padding: '4px',
                fontSize: 10,
              }}
            >
              <option value="left-to-right">Left to Right</option>
              <option value="right-to-left">Right to Left</option>
              <option value="center-out">Center Out</option>
              <option value="outside-in">Outside In</option>
              <option value="random">Random Order</option>
            </select>
          </div>

          <div>
            <span style={{ fontSize: 9, color: '#64748b' }}>INTERVAL (FRAMES)</span>
            <input
              type="number"
              value={staggerConfig.intervalFrames}
              onChange={(e) => setStaggerConfig({ ...staggerConfig, intervalFrames: parseInt(e.target.value) || 1 })}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 4,
                color: '#f8fafc',
                padding: '4px',
                fontSize: 10,
              }}
            />
          </div>
        </div>

        <button
          onClick={handleApplyStagger}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '7px 10px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: 4,
          }}
        >
          ⚡ Apply Smart Stagger across {curveLayers.length} Layers
        </button>
      </div>
    </div>
  );
}
