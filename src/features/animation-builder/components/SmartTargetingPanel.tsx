import React, { useState } from 'react';
import {
  SmartTargetingConfig,
  DEFAULT_TARGETING_CONFIG,
  TargetFilterMode,
  SpatialSortOrder,
} from '../../../core/targeting/smartTargetingEngine';

interface SmartTargetingPanelProps {
  onUpdateTargeting: (config: SmartTargetingConfig) => void;
}

export function SmartTargetingPanel({ onUpdateTargeting }: SmartTargetingPanelProps) {
  const [config, setConfig] = useState<SmartTargetingConfig>(DEFAULT_TARGETING_CONFIG);

  const handleUpdate = (updates: Partial<SmartTargetingConfig>) => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    onUpdateTargeting(updated);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#ec4899', fontSize: 13 }}>🎯</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Smart Targeting & Stagger
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>FILTER TARGETS</span>
          <select
            value={config.filterMode}
            onChange={(e) => handleUpdate({ filterMode: e.target.value as TargetFilterMode })}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#38bdf8' }}
          >
            <option value="all">All Layers</option>
            <option value="selected">Selected Only</option>
            <option value="text-only">Text Layers</option>
            <option value="shape-only">Vector Shapes</option>
            <option value="ui-cards">UI Cards & Badges</option>
          </select>
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>SPATIAL SORT</span>
          <select
            value={config.sortOrder}
            onChange={(e) => handleUpdate({ sortOrder: e.target.value as SpatialSortOrder })}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#ec4899' }}
          >
            <option value="position-y-asc">Top ➔ Bottom</option>
            <option value="position-y-desc">Bottom ➔ Top</option>
            <option value="position-x-asc">Left ➔ Right</option>
            <option value="center-outward">Center ➔ Outward</option>
            <option value="outside-inward">Outside ➔ Inward</option>
            <option value="original-order">Layer Track Order</option>
          </select>
        </div>
      </div>
    </div>
  );
}
