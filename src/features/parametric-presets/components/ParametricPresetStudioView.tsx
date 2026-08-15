import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  LIVING_PARAMETRIC_PRESETS,
  ParametricPresetDefinition,
  compileParametricPreset,
  morphParametricPresets,
  extractPresetFromAnimation,
  PresetVariantIntensity,
} from '../../../core/presets/parametricPresetSystem';

interface ParametricPresetStudioViewProps {
  currentKeyframes: KeyframePoint[];
  onApplyKeyframes: (updated: KeyframePoint[]) => void;
}

export function ParametricPresetStudioView({
  currentKeyframes,
  onApplyKeyframes,
}: ParametricPresetStudioViewProps) {
  const [presets, setPresets] = useState<ParametricPresetDefinition[]>(LIVING_PARAMETRIC_PRESETS);
  const [selectedPreset, setSelectedPreset] = useState<ParametricPresetDefinition>(LIVING_PARAMETRIC_PRESETS[0]);
  const [variant, setVariant] = useState<PresetVariantIntensity>('medium');
  const [morphFactor, setMorphFactor] = useState<number>(0.5);

  const handleApplyPreset = (p: ParametricPresetDefinition) => {
    setSelectedPreset(p);
    const compiled = compileParametricPreset(p, variant);
    onApplyKeyframes(compiled);
  };

  const handleApplyMorph = () => {
    const morphed = morphParametricPresets(presets[0], presets[1], morphFactor);
    onApplyKeyframes(morphed);
  };

  const handleExtractFromCurrent = () => {
    const extracted = extractPresetFromAnimation(currentKeyframes, `Extracted Preset ${presets.length + 1}`);
    setPresets([extracted, ...presets]);
    setSelectedPreset(extracted);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Column 1: Preset Library */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#f59e0b', fontSize: 16 }}>🏛️</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Parametric Presets
            </span>
          </div>
        </div>

        <button
          onClick={handleExtractFromCurrent}
          style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 88, 12, 0.2))',
            border: '1px solid #f59e0b',
            color: '#f59e0b',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          + Extract Preset from Active Curve
        </button>

        {/* Preset Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {presets.map((p) => {
            const isSelected = selectedPreset.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                style={{
                  background: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#f59e0b' : '#1e293b'}`,
                  borderRadius: 8,
                  padding: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: isSelected ? '#f59e0b' : '#f8fafc' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 9, color: '#64748b' }}>{p.durationMs}ms</span>
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8' }}>
                  Overshoot: +{p.overshootPercent}% • Elasticity: {p.elasticity}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 2: Preset Morphing Stage */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 16,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, color: '#f8fafc' }}>
          Continuous Preset Morphing
        </div>

        {/* Morph Slider Bar */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700 }}>
            <span style={{ color: '#38bdf8' }}>A: {presets[0]?.name}</span>
            <span style={{ color: '#f59e0b' }}>{(morphFactor * 100).toFixed(0)}% Morph</span>
            <span style={{ color: '#ec4899' }}>B: {presets[1]?.name}</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={morphFactor}
            onChange={(e) => setMorphFactor(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#f59e0b' }}
          />

          <button
            onClick={handleApplyMorph}
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#080d1a',
              border: 'none',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            ✨ Apply Morphed Blend
          </button>
        </div>
      </div>

      {/* Column 3: Parametric Sliders & Variant Chips */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Preset Variant Multiplier
        </div>

        {/* Variant Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {(['soft', 'medium', 'strong', 'extreme'] as PresetVariantIntensity[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setVariant(v);
                const compiled = compileParametricPreset(selectedPreset, v);
                onApplyKeyframes(compiled);
              }}
              style={{
                padding: '4px 6px',
                fontSize: 9,
                fontWeight: variant === v ? 800 : 500,
                background: variant === v ? '#f59e0b' : '#11182c',
                color: variant === v ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Live Parameter Sliders */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Duration:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{selectedPreset.durationMs}ms</span>
          </div>
          <input
            type="range"
            min="150"
            max="1200"
            step="50"
            value={selectedPreset.durationMs}
            onChange={(e) => setSelectedPreset({ ...selectedPreset, durationMs: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Overshoot Magnitude:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>+{selectedPreset.overshootPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={selectedPreset.overshootPercent}
            onChange={(e) => setSelectedPreset({ ...selectedPreset, overshootPercent: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Elasticity:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedPreset.elasticity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={selectedPreset.elasticity}
            onChange={(e) => setSelectedPreset({ ...selectedPreset, elasticity: parseInt(e.target.value) })}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        <button
          onClick={() => handleApplyPreset(selectedPreset)}
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#080d1a',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 11,
            fontWeight: 900,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          ✨ Apply Parametric Preset
        </button>
      </div>
    </div>
  );
}
