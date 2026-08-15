import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  MOTION_LIBRARY_PRESETS,
  MotionMarketplacePreset,
  PresetCategory,
} from '../../../../core/presets/marketplaceArchitecture';

interface MotionMarketplaceLibraryPanelProps {
  onApplyPreset: (keyframes: KeyframePoint[]) => void;
}

export function MotionMarketplaceLibraryPanel({ onApplyPreset }: MotionMarketplaceLibraryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<PresetCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredPresets = MOTION_LIBRARY_PRESETS.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

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
          <span style={{ color: '#ec4899', fontSize: 13 }}>🏛️</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Motion Library & Marketplace
          </span>
        </div>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search presets (e.g. slide, pop, bounce, ui)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          background: '#11182c',
          border: '1px solid #1e293b',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 11,
          color: '#f8fafc',
        }}
      />

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
        {['All', 'Entrance', 'Scale', 'Attention'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat as any)}
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
              background: selectedCategory === cat ? '#ec4899' : '#11182c',
              color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: 11, color: '#f8fafc' }}>{preset.name}</strong>
              <button
                onClick={() => onApplyPreset(preset.keyframes)}
                style={{
                  background: '#38bdf8',
                  color: '#080d1a',
                  border: 'none',
                  borderRadius: 4,
                  padding: '3px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Apply
              </button>
            </div>

            <div style={{ fontSize: 10, color: '#94a3b8' }}>{preset.description}</div>

            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
              {preset.tags.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 9,
                    color: '#64748b',
                    background: '#080d1a',
                    padding: '1px 4px',
                    borderRadius: 3,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
