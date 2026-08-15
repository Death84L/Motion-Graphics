import React from 'react';
import { CurveLayer } from '../../types';

interface MultiCurveManagerProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<CurveLayer>) => void;
  onAddLayer: () => void;
  onToggleGhost: (layerId: string) => void;
}

export function MultiCurveManager({
  curveLayers,
  activeLayerId,
  onSelectLayer,
  onUpdateLayer,
  onAddLayer,
  onToggleGhost,
}: MultiCurveManagerProps) {
  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#a855f7', fontSize: 13 }}>📚</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Multi-Curve Comparison
          </span>
        </div>

        <button
          onClick={onAddLayer}
          style={{
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#a855f7',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          + Add Curve
        </button>
      </div>

      {/* Curve List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {curveLayers.map((layer) => {
          const isActive = layer.id === activeLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: isActive ? '#16233f' : '#11182c',
                border: `1px solid ${isActive ? layer.color : '#1e293b'}`,
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Color swatch */}
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: layer.color,
                    boxShadow: isActive ? `0 0 8px ${layer.color}` : 'none',
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#f1f5f9' : '#94a3b8',
                  }}
                >
                  {layer.name}
                </span>
              </div>

              {/* Toggles: Visibility, Solo, Ghost */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                {/* Ghost Reference Toggle */}
                {isActive && (
                  <button
                    onClick={() => onToggleGhost(layer.id)}
                    style={{
                      background: layer.showGhost ? '#334155' : 'transparent',
                      color: layer.showGhost ? '#f1f5f9' : '#64748b',
                      border: 'none',
                      borderRadius: 4,
                      padding: '2px 5px',
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                    title="Toggle Ghost reference baseline"
                  >
                    Ghost
                  </button>
                )}

                {/* Solo */}
                <button
                  onClick={() => onUpdateLayer(layer.id, { solo: !layer.solo })}
                  style={{
                    background: layer.solo ? '#f59e0b' : '#1e293b',
                    color: layer.solo ? '#0b1329' : '#94a3b8',
                    border: 'none',
                    borderRadius: 4,
                    padding: '2px 5px',
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Solo this curve"
                >
                  S
                </button>

                {/* Visibility */}
                <button
                  onClick={() => onUpdateLayer(layer.id, { visible: !layer.visible })}
                  style={{
                    background: 'transparent',
                    color: layer.visible ? '#38bdf8' : '#475569',
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                  title={layer.visible ? 'Hide Curve' : 'Show Curve'}
                >
                  {layer.visible ? '👁' : '🚫'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
