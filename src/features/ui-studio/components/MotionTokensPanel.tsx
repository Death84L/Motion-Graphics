import React, { useState } from 'react';
import {
  DesignSystemMotionTokens,
  DEFAULT_MOTION_TOKENS,
  AccessibilityMotionMode,
  getAccessibilityAdaptedTokens,
} from '../../../core/ui/motionTokensEngine';

interface MotionTokensPanelProps {
  onUpdateTokens: (tokens: DesignSystemMotionTokens) => void;
}

export function MotionTokensPanel({ onUpdateTokens }: MotionTokensPanelProps) {
  const [tokens, setTokens] = useState<DesignSystemMotionTokens>(DEFAULT_MOTION_TOKENS);

  const handleAccessibilityChange = (mode: AccessibilityMotionMode) => {
    const adapted = getAccessibilityAdaptedTokens(tokens, mode);
    setTokens(adapted);
    onUpdateTokens(adapted);
  };

  const handleTokenChange = (key: keyof DesignSystemMotionTokens, val: any) => {
    const updated = { ...tokens, [key]: val };
    setTokens(updated);
    onUpdateTokens(updated);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎨</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Design System Motion Tokens
          </span>
        </div>
        <span style={{ fontSize: 9, color: '#64748b' }}>v{tokens.version}</span>
      </div>

      {/* Accessibility Switch */}
      <div style={{ background: '#11182c', padding: 8, borderRadius: 6, border: '1px solid #1e293b' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
          ACCESSIBILITY / REDUCED MOTION
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {(['standard', 'minimal', 'reduced-motion'] as AccessibilityMotionMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleAccessibilityChange(mode)}
              style={{
                padding: '4px 6px',
                fontSize: 9,
                fontWeight: tokens.accessibilityMode === mode ? 800 : 500,
                background: tokens.accessibilityMode === mode ? '#10b981' : '#090e1a',
                color: tokens.accessibilityMode === mode ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Durations Grid */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
          STANDARD DURATIONS (MS)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <div>
            <span style={{ fontSize: 9, color: '#64748b' }}>FAST</span>
            <input
              type="number"
              value={tokens.durationFastMs}
              onChange={(e) => handleTokenChange('durationFastMs', parseInt(e.target.value) || 0)}
              style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#38bdf8' }}
            />
          </div>

          <div>
            <span style={{ fontSize: 9, color: '#64748b' }}>NORMAL</span>
            <input
              type="number"
              value={tokens.durationNormalMs}
              onChange={(e) => handleTokenChange('durationNormalMs', parseInt(e.target.value) || 0)}
              style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#38bdf8' }}
            />
          </div>

          <div>
            <span style={{ fontSize: 9, color: '#64748b' }}>SLOW</span>
            <input
              type="number"
              value={tokens.durationSlowMs}
              onChange={(e) => handleTokenChange('durationSlowMs', parseInt(e.target.value) || 0)}
              style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 4px', fontSize: 10, color: '#38bdf8' }}
            />
          </div>
        </div>
      </div>

      {/* Spring Physics Presets */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
          SPRING PHYSICS TOKEN PROFILES
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#11182c', padding: 6, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#10b981', fontWeight: 700 }}>Snappy Tactile:</span>
            <span style={{ color: '#94a3b8' }}>Stiffness {tokens.springSnappy.stiffness} | Damping {tokens.springSnappy.damping}</span>
          </div>
          <div style={{ background: '#11182c', padding: 6, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>Gentle Smooth:</span>
            <span style={{ color: '#94a3b8' }}>Stiffness {tokens.springGentle.stiffness} | Damping {tokens.springGentle.damping}</span>
          </div>
          <div style={{ background: '#11182c', padding: 6, borderRadius: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>Bouncy Overshoot:</span>
            <span style={{ color: '#94a3b8' }}>Stiffness {tokens.springBouncy.stiffness} | Damping {tokens.springBouncy.damping}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
