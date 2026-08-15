import React from 'react';
import { easingPresetsList, EasingPreset } from '../../easing/easingFunctions';
import type { EasingType, KeyframePoint } from '../types';

type EasingPresetsProps = {
  selectedKeyframeIds: number[];
  onApplyPreset: (presetId: EasingType) => void;
  onApplyPresetToAll: (presetId: EasingType) => void;
};

export function EasingPresets({
  selectedKeyframeIds,
  onApplyPreset,
  onApplyPresetToAll,
}: EasingPresetsProps) {
  const hasSelection = selectedKeyframeIds.length > 0;

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#a855f7', fontSize: 14 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>
            Easing Curves & Presets
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {hasSelection ? 'Applies to selected' : 'Applies to entire curve'}
        </span>
      </div>

      {/* Preset Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 8,
          maxHeight: 220,
          overflowY: 'auto',
          paddingRight: 4,
        }}
      >
        {easingPresetsList.map((preset) => {
          // Generate SVG mini thumbnail
          const points: string[] = [];
          for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const v = preset.fn(t);
            const x = 6 + t * 48;
            const y = 30 - Math.min(1.2, Math.max(-0.2, v)) * 24;
            points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
          }
          const pathD = points.join(' ');

          return (
            <button
              key={preset.id}
              onClick={() => {
                if (hasSelection) {
                  onApplyPreset(preset.id);
                } else {
                  onApplyPresetToAll(preset.id);
                }
              }}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 10,
                padding: '8px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
                textAlign: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#38bdf8';
                e.currentTarget.style.background = '#16233f';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e293b';
                e.currentTarget.style.background = '#11182c';
              }}
              title={preset.description}
            >
              {/* Mini SVG Curve Preview */}
              <svg width="60" height="34" viewBox="0 0 60 34" style={{ display: 'block' }}>
                <line x1="6" y1="30" x2="54" y2="30" stroke="#1e293b" strokeWidth="1" />
                <line x1="6" y1="6" x2="54" y2="6" stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2" />
                <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <span style={{ fontSize: 11, fontWeight: 600, color: '#f1f5f9' }}>
                {preset.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
