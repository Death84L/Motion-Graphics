import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import { CurveSnapshot } from '../../../../core/history/snapshotGallery';
import { morphCurves } from '../../../../core/math/curveMorphing';

interface SnapshotGalleryPanelProps {
  currentKeyframes: KeyframePoint[];
  originalBaselineKeyframes?: KeyframePoint[];
  onApplySnapshot: (keyframes: KeyframePoint[]) => void;
  onToggleDiffView: (enabled: boolean) => void;
  diffViewEnabled: boolean;
}

export function SnapshotGalleryPanel({
  currentKeyframes,
  originalBaselineKeyframes,
  onApplySnapshot,
  onToggleDiffView,
  diffViewEnabled,
}: SnapshotGalleryPanelProps) {
  const [snapshots, setSnapshots] = useState<CurveSnapshot[]>([]);
  const [abSlider, setAbSlider] = useState<number>(1.0); // 0 = Original, 1 = Current

  const handleTakeSnapshot = () => {
    const snap: CurveSnapshot = {
      id: `snap-${Date.now()}`,
      name: `Snapshot ${snapshots.length + 1}`,
      timestamp: Date.now(),
      keyframes: JSON.parse(JSON.stringify(currentKeyframes)),
    };
    setSnapshots([snap, ...snapshots]);
  };

  const handleAbScrub = (val: number) => {
    setAbSlider(val);
    if (!originalBaselineKeyframes || originalBaselineKeyframes.length < 2) return;
    const blended = morphCurves(originalBaselineKeyframes, currentKeyframes, val);
    onApplySnapshot(blended);
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
          <span style={{ color: '#f59e0b', fontSize: 13 }}>📸</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Snapshots & A/B Scrubber</span>
        </div>

        <button
          onClick={handleTakeSnapshot}
          style={{
            background: '#f59e0b',
            color: '#0c1222',
            border: 'none',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          + Snap
        </button>
      </div>

      {/* A/B Scrubber Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
          <span style={{ color: '#ec4899', fontWeight: 700 }}>A: Original Baseline</span>
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>B: Current Edited</span>
        </div>

        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={abSlider}
          onChange={(e) => handleAbScrub(parseFloat(e.target.value))}
          style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
        />
      </div>

      {/* Curve Git-Diff Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: '#f8fafc', fontWeight: 600 }}>Git-Style Curve Diff</span>
        <button
          onClick={() => onToggleDiffView(!diffViewEnabled)}
          style={{
            background: diffViewEnabled ? '#f43f5e' : '#11182c',
            color: '#ffffff',
            border: `1px solid ${diffViewEnabled ? '#f43f5e' : '#1e293b'}`,
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {diffViewEnabled ? 'Diff Active' : 'Show Diff'}
        </button>
      </div>

      {/* Snapshot List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 120, overflowY: 'auto' }}>
        {snapshots.length === 0 ? (
          <div style={{ fontSize: 10, color: '#64748b', textAlign: 'center', padding: '8px 0' }}>
            No snapshots yet. Click '+ Snap' to freeze milestones.
          </div>
        ) : (
          snapshots.map((snap) => (
            <div
              key={snap.id}
              onClick={() => onApplySnapshot(snap.keyframes)}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '5px 8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
              }}
            >
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{snap.name}</span>
              <span style={{ color: '#38bdf8' }}>Restore ↩</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
