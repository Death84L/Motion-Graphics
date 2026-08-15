import React from 'react';
import { KeyframePoint } from '../../types';
import {
  alignKeyframesTime,
  alignKeyframesValue,
  distributeKeyframesTime,
  distributeKeyframesValue,
  matchKeyframeVelocities,
} from '../../../../core/selection/alignmentEngine';

interface AlignmentDistributionPanelProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  currentTime: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function AlignmentDistributionPanel({
  selectedKeyframes,
  allKeyframes,
  currentTime,
  onUpdateKeyframes,
}: AlignmentDistributionPanelProps) {
  const selectedIds = selectedKeyframes.map((k) => k.id);
  const hasSelection = selectedIds.length > 0;
  const hasMultiSelection = selectedIds.length >= 2;

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
          <span style={{ color: '#10b981', fontSize: 13 }}>⇋</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Keyframe Alignment & Distribution
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Align, distribute, and equalize timing & value spacing across selected keyframes.
      </div>

      {/* Time Alignment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Time Alignment (Horizontal)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
          {[
            { label: '⇤ Left', target: 'min' },
            { label: '⇥ Right', target: 'max' },
            { label: '⇹ Center', target: 'average' },
            { label: '▼ Playhead', target: 'playhead' },
          ].map((btn) => (
            <button
              key={btn.label}
              disabled={!hasSelection}
              onClick={() => onUpdateKeyframes(alignKeyframesTime(allKeyframes, selectedIds, btn.target as any, currentTime))}
              style={{
                padding: '6px 4px',
                fontSize: 10,
                fontWeight: 600,
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                color: hasSelection ? '#f8fafc' : '#475569',
                cursor: hasSelection ? 'pointer' : 'default',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Value Alignment */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Value Alignment (Vertical)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
          {[
            { label: '⤓ Floor (0%)', target: 'zero' },
            { label: '⤒ Top (100%)', target: 'top' },
            { label: '⇣ Min Val', target: 'min' },
            { label: '⇡ Max Val', target: 'max' },
          ].map((btn) => (
            <button
              key={btn.label}
              disabled={!hasSelection}
              onClick={() => onUpdateKeyframes(alignKeyframesValue(allKeyframes, selectedIds, btn.target as any))}
              style={{
                padding: '6px 4px',
                fontSize: 10,
                fontWeight: 600,
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                color: hasSelection ? '#f8fafc' : '#475569',
                cursor: hasSelection ? 'pointer' : 'default',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distribution Actions */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Distribution & Velocity Matching
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button
            disabled={!hasMultiSelection}
            onClick={() => onUpdateKeyframes(distributeKeyframesTime(allKeyframes, selectedIds))}
            style={{
              padding: '6px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: hasMultiSelection ? '#10b981' : '#475569',
              cursor: hasMultiSelection ? 'pointer' : 'default',
            }}
          >
            ↔ Distribute Evenly (Time)
          </button>

          <button
            disabled={!hasMultiSelection}
            onClick={() => onUpdateKeyframes(distributeKeyframesValue(allKeyframes, selectedIds))}
            style={{
              padding: '6px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: hasMultiSelection ? '#38bdf8' : '#475569',
              cursor: hasMultiSelection ? 'pointer' : 'default',
            }}
          >
            ↕ Distribute Linear (Value)
          </button>

          <button
            disabled={!hasSelection}
            onClick={() => onUpdateKeyframes(matchKeyframeVelocities(allKeyframes, selectedIds))}
            style={{
              padding: '6px 8px',
              fontSize: 10,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: hasSelection ? '#a855f7' : '#475569',
              cursor: hasSelection ? 'pointer' : 'default',
              gridColumn: 'span 2',
            }}
          >
            ⚡ Match Incoming & Outgoing Velocities
          </button>
        </div>
      </div>
    </div>
  );
}
