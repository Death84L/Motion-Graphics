import React from 'react';
import { KeyframePoint } from '../../types';
import {
  getPeakKeyframes,
  getValleyKeyframes,
  getExtremaKeyframes,
  getFlatKeyframes,
  getNthKeyframes,
  getKeyframesBeforeTime,
  getKeyframesAfterTime,
} from '../../../../core/selection/selectionFilters';

interface SelectionToolsPanelProps {
  keyframes: KeyframePoint[];
  selectedKeyframeIds: number[];
  currentTime: number;
  onSelectKeyframes: (ids: number[]) => void;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function SelectionToolsPanel({
  keyframes,
  selectedKeyframeIds,
  currentTime,
  onSelectKeyframes,
  onUpdateKeyframes,
}: SelectionToolsPanelProps) {
  const hasSelection = selectedKeyframeIds.length > 1;

  // Alignment Handlers
  const handleAlignTime = () => {
    if (!hasSelection) return;
    const selected = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));
    const avgTime = selected.reduce((acc, k) => acc + k.time, 0) / selected.length;
    const updated = keyframes.map((k) =>
      selectedKeyframeIds.includes(k.id) ? { ...k, time: Math.round(avgTime * 10) / 10 } : k
    );
    onUpdateKeyframes(updated);
  };

  const handleAlignValue = () => {
    if (!hasSelection) return;
    const selected = keyframes.filter((k) => selectedKeyframeIds.includes(k.id));
    const avgVal = selected.reduce((acc, k) => acc + k.value, 0) / selected.length;
    const updated = keyframes.map((k) =>
      selectedKeyframeIds.includes(k.id) ? { ...k, value: Math.round(avgVal * 10) / 10 } : k
    );
    onUpdateKeyframes(updated);
  };

  const handleAlignToPlayhead = () => {
    if (selectedKeyframeIds.length === 0) return;
    const updated = keyframes.map((k) =>
      selectedKeyframeIds.includes(k.id) ? { ...k, time: Math.round(currentTime * 10) / 10 } : k
    );
    onUpdateKeyframes(updated);
  };

  const handleDistributeTime = () => {
    if (!hasSelection) return;
    const selected = keyframes.filter((k) => selectedKeyframeIds.includes(k.id)).sort((a, b) => a.time - b.time);
    const minT = selected[0].time;
    const maxT = selected[selected.length - 1].time;
    const step = (maxT - minT) / (selected.length - 1 || 1);

    const updated = keyframes.map((k) => {
      const idx = selected.findIndex((s) => s.id === k.id);
      if (idx !== -1) {
        return { ...k, time: Math.round((minT + idx * step) * 10) / 10 };
      }
      return k;
    });
    onUpdateKeyframes(updated);
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
        gap: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b', fontSize: 13 }}>⚯</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Smart Selection & Alignment
          </span>
        </div>
      </div>

      {/* Smart Query Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={() => onSelectKeyframes(getPeakKeyframes(keyframes))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          ▲ Select Peaks
        </button>

        <button
          onClick={() => onSelectKeyframes(getValleyKeyframes(keyframes))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          ▼ Select Valleys
        </button>

        <button
          onClick={() => onSelectKeyframes(getExtremaKeyframes(keyframes))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          ◆ All Extrema
        </button>

        <button
          onClick={() => onSelectKeyframes(getFlatKeyframes(keyframes))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          — Flat Nodes
        </button>

        <button
          onClick={() => onSelectKeyframes(getNthKeyframes(keyframes, 2))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          ½ Every 2nd
        </button>

        <button
          onClick={() => onSelectKeyframes(getKeyframesBeforeTime(keyframes, currentTime))}
          style={{ padding: '5px 8px', fontSize: 11, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, cursor: 'pointer', textAlign: 'left' }}
        >
          ← Before Playhead
        </button>
      </div>

      {/* Alignment Actions */}
      <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
        <button
          disabled={!hasSelection}
          onClick={handleAlignValue}
          style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, background: '#11182c', color: hasSelection ? '#38bdf8' : '#475569', border: '1px solid #1e293b', borderRadius: 6, cursor: hasSelection ? 'pointer' : 'default' }}
        >
          Align Values
        </button>

        <button
          disabled={!hasSelection}
          onClick={handleDistributeTime}
          style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, background: '#11182c', color: hasSelection ? '#38bdf8' : '#475569', border: '1px solid #1e293b', borderRadius: 6, cursor: hasSelection ? 'pointer' : 'default' }}
        >
          Distribute Time
        </button>

        <button
          onClick={handleAlignToPlayhead}
          style={{ flex: 1, padding: '5px 0', fontSize: 10, fontWeight: 600, background: '#11182c', color: selectedKeyframeIds.length > 0 ? '#ec4899' : '#475569', border: '1px solid #1e293b', borderRadius: 6, cursor: selectedKeyframeIds.length > 0 ? 'pointer' : 'default' }}
        >
          To Playhead
        </button>
      </div>
    </div>
  );
}
