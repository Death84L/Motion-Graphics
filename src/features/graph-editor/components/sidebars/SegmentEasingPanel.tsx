import React from 'react';
import { KeyframePoint, EasingType } from '../../types';
import { getCurveSegments } from '../../utils/curveEvaluation';
import { easingPresetsList } from '../../../easing/easingFunctions';

interface SegmentEasingPanelProps {
  keyframes: KeyframePoint[];
  onApplySegmentEase: (segmentStartIndex: number, ease: EasingType) => void;
  onApplyGlobalEase: (ease: EasingType) => void;
}

export function SegmentEasingPanel({
  keyframes,
  onApplySegmentEase,
  onApplyGlobalEase,
}: SegmentEasingPanelProps) {
  const segments = getCurveSegments(keyframes);

  const handleDragStart = (e: React.DragEvent, presetId: EasingType) => {
    e.dataTransfer.setData('application/motion-studio-preset', presetId);
    e.dataTransfer.effectAllowed = 'copy';
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
          <span style={{ color: '#a855f7', fontSize: 13 }}>⚡</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Segment-Level Easing & Drag-Drop
          </span>
        </div>
      </div>

      {/* Segments List */}
      {segments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: '#090e1a', padding: 6, borderRadius: 8, border: '1px solid #1e293b' }}>
          <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600, paddingLeft: 4 }}>ACTIVE SEGMENTS</span>
          {segments.map((seg, idx) => (
            <div
              key={seg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                background: '#11182c',
                borderRadius: 6,
                fontSize: 11,
              }}
            >
              <span style={{ color: '#f1f5f9' }}>
                Span {idx + 1}: {seg.fromKeyframe.time.toFixed(0)}f → {seg.toKeyframe.time.toFixed(0)}f
              </span>
              <select
                value={seg.ease}
                onChange={(e) => onApplySegmentEase(idx, e.target.value as EasingType)}
                style={{
                  background: '#090e1a',
                  color: '#38bdf8',
                  border: '1px solid #1e293b',
                  borderRadius: 4,
                  padding: '2px 4px',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                <option value="easeInOut">Ease In-Out</option>
                <option value="easeIn">Ease In</option>
                <option value="easeOut">Ease Out</option>
                <option value="linear">Linear</option>
                <option value="bounce">Bounce</option>
                <option value="spring">Spring</option>
                <option value="anticipate">Anticipate</option>
                <option value="step">Step</option>
                <option value="hold">Hold</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Draggable Easing Presets Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>PRESET TRAY (DRAG ONTO GRAPH)</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 6,
            maxHeight: 160,
            overflowY: 'auto',
          }}
        >
          {easingPresetsList.map((preset) => {
            const points: string[] = [];
            for (let i = 0; i <= 15; i++) {
              const t = i / 15;
              const v = preset.fn(t);
              const x = 4 + t * 36;
              const y = 20 - Math.min(1.2, Math.max(-0.2, v)) * 16;
              points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
            }
            const pathD = points.join(' ');

            return (
              <div
                key={preset.id}
                draggable
                onDragStart={(e) => handleDragStart(e, preset.id)}
                onClick={() => onApplyGlobalEase(preset.id)}
                style={{
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 8,
                  padding: '6px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  cursor: 'grab',
                  userSelect: 'none',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#38bdf8')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1e293b')}
                title={`${preset.name} (Click for global, or drag onto segment)`}
              >
                <svg width="44" height="24" viewBox="0 0 44 24" style={{ display: 'block' }}>
                  <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth={1.8} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 10, fontWeight: 600, color: '#f1f5f9', textAlign: 'center' }}>
                  {preset.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
