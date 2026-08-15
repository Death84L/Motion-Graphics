import React, { useState } from 'react';
import { CurveLayer } from '../../types';

interface CurveHierarchyPanelProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  onSelectLayer: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<CurveLayer>) => void;
}

export function CurveHierarchyPanel({
  curveLayers,
  activeLayerId,
  onSelectLayer,
  onUpdateLayer,
}: CurveHierarchyPanelProps) {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const groups = [
    {
      id: 'transform',
      name: 'Transform Parameters',
      layers: curveLayers.filter((l) => ['translate-x', 'translate-y', 'scale', 'rotate'].includes(l.property)),
    },
    {
      id: 'effects',
      name: 'Effects & Opacity',
      layers: curveLayers.filter((l) => ['opacity', 'custom'].includes(l.property) || !['translate-x', 'translate-y', 'scale', 'rotate'].includes(l.property)),
    },
  ];

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
        <span style={{ color: '#a855f7', fontSize: 13 }}>🌳</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Timeline Curve Hierarchy</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {groups.map((grp) => (
          <div key={grp.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Group Header */}
            <div
              onClick={() => toggleGroup(grp.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 6px',
                background: '#090e1a',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 10,
                fontWeight: 700,
                color: '#94a3b8',
              }}
            >
              <span>{collapsedGroups[grp.id] ? '▶' : '▼'} {grp.name}</span>
              <span>{grp.layers.length}</span>
            </div>

            {/* Layer Rows */}
            {!collapsedGroups[grp.id] &&
              grp.layers.map((layer) => {
                const isActive = layer.id === activeLayerId;
                return (
                  <div
                    key={layer.id}
                    onClick={() => onSelectLayer(layer.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '5px 8px',
                      marginLeft: 8,
                      background: isActive ? '#1e293b' : '#11182c',
                      border: `1px solid ${isActive ? layer.color : '#1e293b'}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: layer.color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#f8fafc' }}>{layer.name}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLayer(layer.id, { solo: !layer.solo });
                        }}
                        style={{
                          background: layer.solo ? '#f59e0b' : 'transparent',
                          color: layer.solo ? '#0c1222' : '#64748b',
                          border: 'none',
                          fontSize: 9,
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: '1px 4px',
                          borderRadius: 3,
                        }}
                      >
                        S
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateLayer(layer.id, { visible: !layer.visible });
                        }}
                        style={{
                          background: layer.visible ? '#38bdf8' : 'transparent',
                          color: layer.visible ? '#0c1222' : '#64748b',
                          border: 'none',
                          fontSize: 9,
                          fontWeight: 800,
                          cursor: 'pointer',
                          padding: '1px 4px',
                          borderRadius: 3,
                        }}
                      >
                        V
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
