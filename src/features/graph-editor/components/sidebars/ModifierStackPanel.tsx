import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  CurveModifier,
  DEFAULT_MODIFIERS,
  evaluateModifierStackAtTime,
} from '../../../../core/procedural/modifierStack';
import { bakeModifiersToKeyframes } from '../../../../core/optimizer/keyframeReducer';

interface ModifierStackPanelProps {
  baseKeyframes: KeyframePoint[];
  onApplyModifiedCurve: (modified: KeyframePoint[]) => void;
}

export function ModifierStackPanel({
  baseKeyframes,
  onApplyModifiedCurve,
}: ModifierStackPanelProps) {
  const [modifiers, setModifiers] = useState<CurveModifier[]>(DEFAULT_MODIFIERS);
  const [bakeTolerance, setBakeTolerance] = useState<number>(1.2);
  const [bakeStatus, setBakeStatus] = useState<string | null>(null);

  const handleToggleModifier = (id: string) => {
    const updated = modifiers.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m));
    setModifiers(updated);
    previewFinalCurve(updated);
  };

  const handleUpdateParam = (id: string, paramKey: string, val: number) => {
    const updated = modifiers.map((m) =>
      m.id === id ? { ...m, params: { ...m.params, [paramKey]: val } } : m
    );
    setModifiers(updated);
    previewFinalCurve(updated);
  };

  const previewFinalCurve = (mods: CurveModifier[]) => {
    const baked: KeyframePoint[] = [];
    for (let t = 0; t <= 100; t += 4) {
      const v = evaluateModifierStackAtTime(baseKeyframes, t, mods);
      baked.push({
        id: 4000 + t,
        time: t,
        value: v,
        type: 'bezier',
        ease: 'easeInOut',
      });
    }
    onApplyModifiedCurve(baked);
  };

  // One-click Bake Modifiers down to raw, optimal Bézier keyframes
  const handleBakeToKeyframes = () => {
    const result = bakeModifiersToKeyframes(baseKeyframes, modifiers, 1, bakeTolerance);
    onApplyModifiedCurve(result.reducedKeyframes);
    setBakeStatus(
      `✓ Baked to ${result.reducedCount} Bézier keyframes (${result.compressionRatio}% compressed)`
    );
    setTimeout(() => setBakeStatus(null), 4000);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#ec4899', fontSize: 13 }}>⚙️</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Procedural Modifier Stack</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Non-destructive modifiers computed on top of your base spline.
      </div>

      {/* Modifier list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modifiers.map((mod) => (
          <div
            key={mod.id}
            style={{
              background: '#11182c',
              border: `1px solid ${mod.enabled ? '#ec4899' : '#1e293b'}`,
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 11, color: mod.enabled ? '#f8fafc' : '#64748b' }}>
                {mod.name}
              </strong>
              <button
                onClick={() => handleToggleModifier(mod.id)}
                style={{
                  background: mod.enabled ? '#ec4899' : '#1e293b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {mod.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {mod.enabled && mod.type === 'noise' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                  <span>Amplitude:</span>
                  <span>{mod.params.noiseAmplitude}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={mod.params.noiseAmplitude || 4}
                  onChange={(e) => handleUpdateParam(mod.id, 'noiseAmplitude', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#ec4899' }}
                />
              </div>
            )}

            {mod.enabled && mod.type === 'amplitude-offset' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                  <span>Scale Factor:</span>
                  <span>{(mod.params.amplitudeScale || 1.0).toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={mod.params.amplitudeScale || 1.0}
                  onChange={(e) => handleUpdateParam(mod.id, 'amplitudeScale', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#ec4899' }}
                />
              </div>
            )}

            {mod.enabled && mod.type === 'overshoot' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                  <span>Extra Bounce:</span>
                  <span>{mod.params.overshootPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={mod.params.overshootPct || 10}
                  onChange={(e) => handleUpdateParam(mod.id, 'overshootPct', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#ec4899' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Non-Destructive Baking Section (Feature 4) */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>
            🔥 Bake Stack to Raw Bézier Keys
          </span>
          <span style={{ fontSize: 10, color: '#ec4899', fontWeight: 600 }}>
            ε = {bakeTolerance.toFixed(1)}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#94a3b8' }}>Tolerance:</span>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={bakeTolerance}
            onChange={(e) => setBakeTolerance(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#ec4899' }}
          />
        </div>

        <button
          onClick={handleBakeToKeyframes}
          style={{
            background: 'linear-gradient(135deg, #ec4899, #d946ef)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 7,
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(236, 72, 153, 0.3)',
          }}
        >
          Bake Stack to Standalone Keyframes
        </button>

        {bakeStatus && (
          <div style={{ fontSize: 10, color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
            {bakeStatus}
          </div>
        )}
      </div>
    </div>
  );
}
