import React from 'react';
import {
  WorkspaceProfile,
  WORKSPACE_PRESETS,
  WorkspaceConfig,
} from '../../../../core/workspace/workspaceManager';
import { saveVersionSnapshot, AutoSaveSnapshot } from '../../../../core/storage/autoSaveRecovery';
import { CurveLayer } from '../../types';

interface WorkspaceProfilesPanelProps {
  currentProfile: WorkspaceProfile;
  curveLayers: CurveLayer[];
  onSelectProfile: (config: WorkspaceConfig) => void;
  onRestoreSnapshot?: (snapshot: AutoSaveSnapshot) => void;
}

export function WorkspaceProfilesPanel({
  currentProfile,
  curveLayers,
  onSelectProfile,
}: WorkspaceProfilesPanelProps) {
  const handleSaveSnapshot = () => {
    saveVersionSnapshot(curveLayers, `Manual Snapshot ${new Date().toLocaleTimeString()}`);
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>📐</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Workspace Profiles & Autosave
          </span>
        </div>
      </div>

      {/* Profiles Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {Object.values(WORKSPACE_PRESETS).map((ws) => {
          const isSelected = currentProfile === ws.id;
          return (
            <button
              key={ws.id}
              onClick={() => onSelectProfile(ws)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '8px 10px',
                borderRadius: 8,
                background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                border: `1px solid ${isSelected ? ws.accentColor : '#1e293b'}`,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? ws.accentColor : '#f8fafc' }}>
                  {ws.name}
                </span>
                {isSelected && <span style={{ fontSize: 9, color: ws.accentColor, fontWeight: 800 }}>ACTIVE</span>}
              </div>
              <span style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{ws.desc}</span>
            </button>
          );
        })}
      </div>

      {/* Snapshot / Autosave Action */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>●</span> Autosave Active (10s interval)
        </span>
        <button
          onClick={handleSaveSnapshot}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            color: '#38bdf8',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          📸 Snapshot
        </button>
      </div>
    </div>
  );
}
