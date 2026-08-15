import React from 'react';
import { CurveLayer } from '../../types';
import { ExtrapolationType } from '../../../../core/math/extrapolationEngine';

interface ExtrapolationPanelProps {
  activeLayer: CurveLayer;
  onUpdateLayer: (updatedLayer: Partial<CurveLayer>) => void;
}

const EXTRAPOLATION_OPTIONS: { id: ExtrapolationType; label: string; desc: string; icon: string }[] = [
  { id: 'constant', label: 'Constant (Hold)', desc: 'Holds the edge keyframe value indefinitely', icon: '—' },
  { id: 'linear', label: 'Linear Slope', desc: 'Extrapolates tangent velocity into infinity', icon: '↗' },
  { id: 'cycle', label: 'Cycle (Loop)', desc: 'Repeats the exact curve cyclically', icon: '⟳' },
  { id: 'cycleOffset', label: 'Cycle with Offset', desc: 'Relative stair-step accumulation loop', icon: '⤻' },
  { id: 'pingPong', label: 'Ping-Pong', desc: 'Oscillates back and forth between edges', icon: '⇄' },
];

export function ExtrapolationPanel({ activeLayer, onUpdateLayer }: ExtrapolationPanelProps) {
  const preExtrap = activeLayer.preExtrapolation || 'constant';
  const postExtrap = activeLayer.postExtrapolation || 'constant';

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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>♾</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Infinite Extrapolation & Looping
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Controls how curves behave infinitely before the first keyframe and after the last keyframe.
      </div>

      {/* Pre-Extrapolation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          ◀ Pre-Extrapolation (Before Keyframe 1)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {EXTRAPOLATION_OPTIONS.map((opt) => {
            const isSelected = preExtrap === opt.id;
            return (
              <button
                key={`pre-${opt.id}`}
                onClick={() => onUpdateLayer({ preExtrapolation: opt.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 7,
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span style={{ fontSize: 10, color: '#38bdf8' }}>Active</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-Extrapolation Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid #1e293b', paddingTop: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          ▶ Post-Extrapolation (After Last Keyframe)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 4 }}>
          {EXTRAPOLATION_OPTIONS.map((opt) => {
            const isSelected = postExtrap === opt.id;
            return (
              <button
                key={`post-${opt.id}`}
                onClick={() => onUpdateLayer({ postExtrapolation: opt.id })}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: 7,
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  color: isSelected ? '#38bdf8' : '#cbd5e1',
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <span style={{ fontSize: 10, color: '#38bdf8' }}>Active</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
