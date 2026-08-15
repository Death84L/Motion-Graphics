import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  PropertyAnimationStack,
  DEFAULT_STACK_MODIFIERS,
  StackModifier,
  bakeStackToKeyframes,
} from '../../../core/stack/animationStackEngine';

interface AnimationStackPanelProps {
  baseKeyframes: KeyframePoint[];
  onApplyBakedStack: (bakedKeyframes: KeyframePoint[]) => void;
}

export function AnimationStackPanel({
  baseKeyframes,
  onApplyBakedStack,
}: AnimationStackPanelProps) {
  const [modifiers, setModifiers] = useState<StackModifier[]>(DEFAULT_STACK_MODIFIERS);
  const [selectedProp, setSelectedProp] = useState<PropertyAnimationStack['property']>('position-y');

  const activeStack: PropertyAnimationStack = {
    property: selectedProp,
    baseKeyframes,
    modifiers,
  };

  const handleToggleModifier = (id: string) => {
    setModifiers(modifiers.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleIntensityChange = (id: string, intensity: number) => {
    setModifiers(modifiers.map((m) => (m.id === id ? { ...m, intensity } : m)));
  };

  const handleBake = () => {
    const baked = bakeStackToKeyframes(activeStack);
    onApplyBakedStack(baked);
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🧩</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Non-Destructive Animation Stack
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Layer procedural modifiers (Springs, Overshoots, Bounces, Wiggles) over your raw curves non-destructively.
      </div>

      {/* Property Selector */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
        {['position-y', 'scale', 'rotation', 'opacity', 'blur'].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedProp(p as any)}
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              background: selectedProp === p ? '#38bdf8' : '#11182c',
              color: selectedProp === p ? '#080d1a' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            {p.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Modifier Stack List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {modifiers.map((mod) => (
          <div
            key={mod.id}
            style={{
              background: '#11182c',
              border: `1px solid ${mod.enabled ? '#38bdf888' : '#1e293b'}`,
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: mod.enabled ? '#f8fafc' : '#64748b' }}>
                {mod.name}
              </span>
              <button
                onClick={() => handleToggleModifier(mod.id)}
                style={{
                  background: mod.enabled ? '#38bdf8' : '#1e293b',
                  color: mod.enabled ? '#080d1a' : '#64748b',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {mod.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {mod.enabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Intensity:</span>
                <input
                  type="range"
                  min="0"
                  max="2.0"
                  step="0.1"
                  value={mod.intensity}
                  onChange={(e) => handleIntensityChange(mod.id, parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8' }}
                />
                <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>
                  {mod.intensity.toFixed(1)}x
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bake Stack Button */}
      <button
        onClick={handleBake}
        style={{
          background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
          color: '#080d1a',
          border: 'none',
          borderRadius: 8,
          padding: '9px 12px',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        ⚡ Bake Stack to Bézier Curve
      </button>
    </div>
  );
}
