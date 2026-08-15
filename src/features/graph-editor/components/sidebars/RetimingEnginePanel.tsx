import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  retimeKeyframeSpan,
  retimeRegionWithRipple,
  reverseKeyframeSection,
  insertFreezeHold,
} from '../../../../core/timing/advancedRetimingEngine';

interface RetimingEnginePanelProps {
  keyframes: KeyframePoint[];
  selectedKeyframes: KeyframePoint[];
  currentTime: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function RetimingEnginePanel({
  keyframes,
  selectedKeyframes,
  currentTime,
  onUpdateKeyframes,
}: RetimingEnginePanelProps) {
  const [targetDuration, setTargetDuration] = useState<number>(60);
  const [speedMult, setSpeedMult] = useState<number>(2.0);
  const [holdFrames, setHoldFrames] = useState<number>(15);
  const [status, setStatus] = useState<string | null>(null);

  const handleRetimeSpan = (multiplier: number) => {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    const currDur = sorted[sorted.length - 1].time - sorted[0].time || 1;
    const newDur = Math.max(10, Math.min(100, currDur * multiplier));
    const result = retimeKeyframeSpan(keyframes, newDur);
    onUpdateKeyframes(result);
    setStatus(`✓ Retimed duration to ${newDur.toFixed(0)}f (${multiplier}x)`);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleSpeedRegion = () => {
    const start = Math.max(0, currentTime - 15);
    const end = Math.min(100, currentTime + 15);
    const result = retimeRegionWithRipple(keyframes, start, end, speedMult);
    onUpdateKeyframes(result);
    setStatus(`✓ Region [${start.toFixed(0)}f–${end.toFixed(0)}f] retimed ${speedMult}x with ripple`);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleReverseSection = () => {
    const ids = selectedKeyframes.length >= 2 ? selectedKeyframes.map((k) => k.id) : keyframes.map((k) => k.id);
    const result = reverseKeyframeSection(keyframes, ids);
    onUpdateKeyframes(result);
    setStatus(`✓ Reversed section timing`);
    setTimeout(() => setStatus(null), 3000);
  };

  const handleInsertHold = () => {
    const result = insertFreezeHold(keyframes, currentTime, holdFrames);
    onUpdateKeyframes(result);
    setStatus(`✓ Inserted ${holdFrames}f freeze hold at ${currentTime.toFixed(0)}f`);
    setTimeout(() => setStatus(null), 3000);
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
          <span style={{ color: '#f59e0b', fontSize: 13 }}>⏱️</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Animation Retiming Engine
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Edit animation timing without destroying curvature and tangent ease proportions.
      </div>

      {/* Stretch / Compress Preserving Ease */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Duration Scaling (Preserve Tangents)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
          {[
            { label: '0.5x Fast', mult: 0.5 },
            { label: '0.75x', mult: 0.75 },
            { label: '1.5x Slow', mult: 1.5 },
            { label: '2.0x Double', mult: 2.0 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleRetimeSpan(btn.mult)}
              style={{
                padding: '6px 4px',
                fontSize: 10,
                fontWeight: 600,
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                color: '#f8fafc',
                cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ripple Region Speedup / Slowdown */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Ripple Speed Region Around Playhead
          </label>
          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>{speedMult}x</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="range"
            min="0.25"
            max="4.0"
            step="0.25"
            value={speedMult}
            onChange={(e) => setSpeedMult(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#f59e0b' }}
          />
        </div>

        <button
          onClick={handleSpeedRegion}
          style={{
            padding: '6px 10px',
            fontSize: 11,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            borderRadius: 6,
            color: '#080d1a',
            cursor: 'pointer',
          }}
        >
          ⚡ Retime Region Around {currentTime.toFixed(0)}f
        </button>
      </div>

      {/* Freeze Frame & In-Place Reverse */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button
          onClick={handleInsertHold}
          style={{
            padding: '7px 8px',
            fontSize: 10,
            fontWeight: 600,
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#38bdf8',
            cursor: 'pointer',
          }}
        >
          ❄ Freeze Hold (+{holdFrames}f)
        </button>

        <button
          onClick={handleReverseSection}
          style={{
            padding: '7px 8px',
            fontSize: 10,
            fontWeight: 600,
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#a855f7',
            cursor: 'pointer',
          }}
        >
          ⇄ Reverse Section
        </button>
      </div>

      {status && (
        <div style={{ fontSize: 10, color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
          {status}
        </div>
      )}
    </div>
  );
}
