import React from 'react';
import { KeyframePoint } from '../../types';
import { BlenderCurveEngine, HandleType } from '../../../../core/curves/blenderCurveEngine';

interface BlenderCurveToolbarProps {
  keyframes: KeyframePoint[];
  selectedKeyframeIds: number[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
  onSelectAll: () => void;
  onInvertSelection: () => void;
  onSwitchMode?: (mode: string) => void;
}

export function BlenderCurveToolbar({
  keyframes,
  selectedKeyframeIds,
  onUpdateKeyframes,
  onSelectAll,
  onInvertSelection,
  onSwitchMode,
}: BlenderCurveToolbarProps) {
  // Handle Type Application
  const handleApplyHandleType = (ht: HandleType) => {
    const updated = BlenderCurveEngine.applyHandleType(keyframes, selectedKeyframeIds, ht);
    onUpdateKeyframes(updated);
  };

  // Curve Transformation Application
  const handleTransform = (op: 'flip-x' | 'flip-y' | 'scale-time-2x' | 'scale-time-half' | 'quantize' | 'distribute') => {
    const updated = BlenderCurveEngine.transformCurve(keyframes, selectedKeyframeIds, op, 'median');
    onUpdateKeyframes(updated);
  };

  // Simplify Curve
  const handleSimplify = () => {
    const updated = BlenderCurveEngine.simplifyCurve(keyframes, 0.6);
    onUpdateKeyframes(updated);
  };

  const hasSelection = selectedKeyframeIds.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#090e1a',
        borderBottom: '1px solid #1e293b',
        padding: '6px 12px',
        gap: 12,
        overflowX: 'auto',
        fontSize: 10,
      }}
    >
      {/* 1. SELECTION TOOLS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Select:</span>
        <button
          onClick={onSelectAll}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: '#f8fafc', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}
          title="Select All Keyframes (A)"
        >
          All
        </button>
        <button
          onClick={onInvertSelection}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: '#94a3b8', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}
          title="Invert Selection"
        >
          Invert
        </button>
      </div>

      <div style={{ width: 1, height: 16, background: '#1e293b' }} />

      {/* 2. BLENDER HANDLE TYPES */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Handles:</span>
        {(['auto-clamped', 'vector', 'aligned', 'free'] as HandleType[]).map((ht) => (
          <button
            key={ht}
            disabled={!hasSelection}
            onClick={() => handleApplyHandleType(ht)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: hasSelection ? '#38bdf8' : '#475569',
              padding: '3px 8px',
              borderRadius: 4,
              cursor: hasSelection ? 'pointer' : 'default',
              textTransform: 'capitalize',
            }}
          >
            {ht.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div style={{ width: 1, height: 16, background: '#1e293b' }} />

      {/* 3. CURVE TRANSFORMS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Transform:</span>
        <button
          disabled={!hasSelection}
          onClick={() => handleTransform('flip-x')}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: hasSelection ? '#f8fafc' : '#475569', padding: '3px 8px', borderRadius: 4, cursor: hasSelection ? 'pointer' : 'default' }}
          title="Flip Time Horizontally"
        >
          ⇄ Reverse
        </button>
        <button
          disabled={!hasSelection}
          onClick={() => handleTransform('flip-y')}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: hasSelection ? '#f8fafc' : '#475569', padding: '3px 8px', borderRadius: 4, cursor: hasSelection ? 'pointer' : 'default' }}
          title="Invert Values Vertically"
        >
          ⇅ Invert
        </button>
        <button
          disabled={!hasSelection}
          onClick={() => handleTransform('scale-time-2x')}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: hasSelection ? '#f8fafc' : '#475569', padding: '3px 8px', borderRadius: 4, cursor: hasSelection ? 'pointer' : 'default' }}
          title="Stretch Duration 2x"
        >
          2× Stretch
        </button>
        <button
          disabled={!hasSelection}
          onClick={() => handleTransform('quantize')}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: hasSelection ? '#f8fafc' : '#475569', padding: '3px 8px', borderRadius: 4, cursor: hasSelection ? 'pointer' : 'default' }}
          title="Snap to nearest integer frame"
        >
          Quantize
        </button>
        <button
          onClick={handleSimplify}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: '#10b981', padding: '3px 8px', borderRadius: 4, cursor: 'pointer' }}
          title="Simplify Curve Keyframes (RDP reduction)"
        >
          🧹 Simplify
        </button>
      </div>
    </div>
  );
}
