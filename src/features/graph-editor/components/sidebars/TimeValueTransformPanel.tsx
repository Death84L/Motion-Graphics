import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  scaleTiming,
  fitToDuration,
  offsetTime,
  offsetValues,
  scaleValues,
  clampValues,
} from '../../../../core/math/timeValueTransforms';

interface TimeValueTransformPanelProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function TimeValueTransformPanel({
  selectedKeyframes,
  allKeyframes,
  onUpdateKeyframes,
}: TimeValueTransformPanelProps) {
  const [targetDuration, setTargetDuration] = useState<number>(60);
  const targetKeyframes = selectedKeyframes.length > 0 ? selectedKeyframes : allKeyframes;

  const handleScaleTime = (factor: number) => {
    const updated = scaleTiming(targetKeyframes, factor, targetKeyframes[0]?.time ?? 0);
    applyUpdated(updated);
  };

  const handleFitDuration = () => {
    const updated = fitToDuration(targetKeyframes, targetDuration, targetKeyframes[0]?.time ?? 0);
    applyUpdated(updated);
  };

  const handleShiftTime = (delta: number) => {
    const updated = offsetTime(targetKeyframes, delta);
    applyUpdated(updated);
  };

  const handleShiftValue = (delta: number) => {
    const updated = offsetValues(targetKeyframes, delta);
    applyUpdated(updated);
  };

  const handleScaleValue = (factor: number) => {
    const updated = scaleValues(targetKeyframes, factor, 50);
    applyUpdated(updated);
  };

  const handleClampValue = () => {
    const updated = clampValues(targetKeyframes, 0, 100);
    applyUpdated(updated);
  };

  const applyUpdated = (modified: KeyframePoint[]) => {
    if (selectedKeyframes.length > 0) {
      const merged = allKeyframes.map((k) => modified.find((m) => m.id === k.id) || k);
      onUpdateKeyframes(merged.sort((a, b) => a.time - b.time));
    } else {
      onUpdateKeyframes(modified.sort((a, b) => a.time - b.time));
    }
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
          <span style={{ color: '#ec4899', fontSize: 13 }}>⏱</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Time & Value Transform
          </span>
        </div>
      </div>

      {/* Timing Stretch / Compress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>TIMING SCALE</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => handleScaleTime(0.5)}
            style={{ flex: 1, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 11, cursor: 'pointer' }}
          >
            0.5x (Fast)
          </button>
          <button
            onClick={() => handleScaleTime(1.5)}
            style={{ flex: 1, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 11, cursor: 'pointer' }}
          >
            1.5x
          </button>
          <button
            onClick={() => handleScaleTime(2.0)}
            style={{ flex: 1, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 11, cursor: 'pointer' }}
          >
            2.0x (Slow)
          </button>
        </div>
      </div>

      {/* Set Exact Duration */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          min={10}
          max={100}
          value={targetDuration}
          onChange={(e) => setTargetDuration(Number(e.target.value))}
          style={{ width: 60, background: '#11182c', color: '#f1f5f9', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 6px', fontSize: 11, fontFamily: 'monospace' }}
        />
        <button
          onClick={handleFitDuration}
          style={{ flex: 1, background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        >
          Fit to Duration ({targetDuration}f)
        </button>
      </div>

      {/* Value Scales and Clamping */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>VALUE AMPLITUDE & CLAMP</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => handleScaleValue(0.75)}
            style={{ flex: 1, background: '#11182c', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 10, cursor: 'pointer' }}
          >
            Scale 75%
          </button>
          <button
            onClick={() => handleScaleValue(1.25)}
            style={{ flex: 1, background: '#11182c', color: '#94a3b8', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 10, cursor: 'pointer' }}
          >
            Scale 125%
          </button>
          <button
            onClick={handleClampValue}
            style={{ flex: 1, background: '#11182c', color: '#38bdf8', border: '1px solid #1e293b', borderRadius: 6, padding: '4px 0', fontSize: 10, cursor: 'pointer' }}
          >
            Clamp 0-100%
          </button>
        </div>
      </div>
    </div>
  );
}
