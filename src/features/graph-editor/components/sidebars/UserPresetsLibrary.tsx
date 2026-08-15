import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import { UserCurvePreset } from '../../types/presets.types';
import { UserPresetsManager } from '../../state/userPresetsManager';

interface UserPresetsLibraryProps {
  currentKeyframes: KeyframePoint[];
  onApplyPreset: (keyframes: KeyframePoint[]) => void;
}

export function UserPresetsLibrary({ currentKeyframes, onApplyPreset }: UserPresetsLibraryProps) {
  const [presets, setPresets] = useState<UserCurvePreset[]>(() => UserPresetsManager.loadPresets());
  const [newPresetName, setNewPresetName] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleSaveCurrentCurve = () => {
    if (!newPresetName.trim()) return;
    const created = UserPresetsManager.createPreset(newPresetName, currentKeyframes);
    setPresets(UserPresetsManager.loadPresets());
    setNewPresetName('');
  };

  const handleDelete = (id: string) => {
    const updated = UserPresetsManager.deletePreset(id);
    setPresets(updated);
  };

  const handleToggleFavorite = (id: string) => {
    const updated = UserPresetsManager.toggleFavorite(id);
    setPresets(updated);
  };

  const handleExport = () => {
    const json = UserPresetsManager.exportToJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motion-studio-user-presets.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const updated = UserPresetsManager.importFromJson(text);
        setPresets(updated);
      } catch (err) {
        alert('Invalid preset JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDragStart = (e: React.DragEvent, preset: UserCurvePreset) => {
    e.dataTransfer.setData('application/motion-studio-custom-preset', JSON.stringify(preset.keyframes));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const filteredPresets = activeCategory === 'All'
    ? presets
    : activeCategory === 'Favorites'
    ? presets.filter((p) => p.isFavorite)
    : presets.filter((p) => p.category === activeCategory);

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
          <span style={{ color: '#ec4899', fontSize: 13 }}>⭐</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>User Curve Preset Library</span>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={handleExport}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 10,
              cursor: 'pointer',
            }}
            title="Export presets as JSON"
          >
            Export
          </button>
          <label
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#94a3b8',
              borderRadius: 4,
              padding: '2px 6px',
              fontSize: 10,
              cursor: 'pointer',
            }}
            title="Import presets from JSON"
          >
            Import
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Save Current Curve Input */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          placeholder="Name current curve..."
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
          style={{
            flex: 1,
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 11,
            color: '#f8fafc',
          }}
        />
        <button
          onClick={handleSaveCurrentCurve}
          disabled={!newPresetName.trim()}
          style={{
            background: '#ec4899',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 10px',
            fontSize: 11,
            fontWeight: 700,
            cursor: newPresetName.trim() ? 'pointer' : 'not-allowed',
            opacity: newPresetName.trim() ? 1 : 0.5,
          }}
        >
          Save
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
        {['All', 'Favorites', 'UI Motion', 'Film', 'Custom'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '3px 8px',
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
              background: activeCategory === cat ? '#1e293b' : '#11182c',
              color: activeCategory === cat ? '#38bdf8' : '#64748b',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
        {filteredPresets.length === 0 ? (
          <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', padding: '12px 0' }}>
            No presets found. Save your current curve above!
          </div>
        ) : (
          filteredPresets.map((p) => (
            <div
              key={p.id}
              draggable
              onDragStart={(e) => handleDragStart(e, p)}
              onClick={() => onApplyPreset(p.keyframes)}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'grab',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(p.id);
                  }}
                  style={{ color: p.isFavorite ? '#f59e0b' : '#475569', cursor: 'pointer', fontSize: 12 }}
                >
                  ★
                </span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: '#64748b' }}>{p.keyframes.length} keyframes • {p.category}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(p.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                  title="Delete preset"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
