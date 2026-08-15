import React, { useState } from 'react';
import { DEFAULT_DESIGN_SYSTEM, CompleteDesignSystemTokens } from '../../../core/design-system/designSystemEngine';
import { COMPONENT_CATALOG, ComponentSpecification } from '../../../core/design-system/componentCatalog';

export function DesignSystemStudioView() {
  const [tokens, setTokens] = useState<CompleteDesignSystemTokens>(DEFAULT_DESIGN_SYSTEM);
  const [selectedComponent, setSelectedComponent] = useState<ComponentSpecification>(COMPONENT_CATALOG[0]);
  const [activeTab, setActiveTab] = useState<'tokens' | 'components'>('tokens');

  const handleColorChange = (key: keyof CompleteDesignSystemTokens['colors'], val: string) => {
    setTokens({
      ...tokens,
      colors: {
        ...tokens.colors,
        [key]: val,
      },
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        height: '100%',
        background: '#060913',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Tokens & Component Nav */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎨</span>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
            Design System Studio
          </span>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', background: '#11182c', padding: 2, borderRadius: 6, gap: 2 }}>
          <button
            onClick={() => setActiveTab('tokens')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 10,
              fontWeight: activeTab === 'tokens' ? 700 : 500,
              background: activeTab === 'tokens' ? '#38bdf8' : 'transparent',
              color: activeTab === 'tokens' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Design Tokens
          </button>
          <button
            onClick={() => setActiveTab('components')}
            style={{
              flex: 1,
              padding: '4px 6px',
              fontSize: 10,
              fontWeight: activeTab === 'components' ? 700 : 500,
              background: activeTab === 'components' ? '#38bdf8' : 'transparent',
              color: activeTab === 'components' ? '#080d1a' : '#94a3b8',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Components ({COMPONENT_CATALOG.length})
          </button>
        </div>

        {activeTab === 'tokens' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Color Token Palette
            </div>
            {Object.entries(tokens.colors).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
                <span style={{ color: '#cbd5e1', textTransform: 'capitalize' }}>{key}:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 9 }}>{val}</span>
                  <input
                    type="color"
                    value={val}
                    onChange={(e) => handleColorChange(key as any, e.target.value)}
                    style={{ width: 22, height: 22, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {COMPONENT_CATALOG.map((cmp) => (
              <div
                key={cmp.id}
                onClick={() => setSelectedComponent(cmp)}
                style={{
                  background: selectedComponent.id === cmp.id ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${selectedComponent.id === cmp.id ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{cmp.name}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{cmp.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Live Component & System Preview */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #0e1526 0%, #03060f 100%)',
          padding: 24,
          position: 'relative',
        }}
      >
        <div style={{ width: '100%', maxWidth: 440, background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, borderRadius: tokens.radii.lg, padding: 24, boxShadow: tokens.shadows.lg, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: tokens.typography.scaleHeading3.fontSize, fontWeight: tokens.typography.scaleHeading3.fontWeight, color: tokens.colors.textPrimary }}>
              {selectedComponent.name}
            </div>
            <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: tokens.colors.primary, borderRadius: 4, padding: '2px 6px', fontSize: 9, fontWeight: 800 }}>
              {selectedComponent.category.toUpperCase()}
            </span>
          </div>

          <div style={{ fontSize: tokens.typography.scaleBody.fontSize, color: tokens.colors.textSecondary }}>
            {selectedComponent.description}
          </div>

          {/* Interactive Component Demo */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              style={{
                flex: 1,
                padding: '10px 18px',
                borderRadius: tokens.radii.sm,
                background: tokens.colors.primary,
                color: '#080d1a',
                border: 'none',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: tokens.shadows.glowCyan,
              }}
            >
              Primary Action
            </button>
            <button
              style={{
                padding: '10px 14px',
                borderRadius: tokens.radii.sm,
                background: 'transparent',
                color: tokens.colors.accent,
                border: `1px solid ${tokens.colors.accent}`,
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
