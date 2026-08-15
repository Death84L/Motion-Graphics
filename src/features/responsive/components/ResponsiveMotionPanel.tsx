import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  adaptAnimationToAspectRatio,
  ResponsiveMotionConstraint,
  DEFAULT_MOTION_CONSTRAINT,
} from '../../../core/responsive/responsiveMotionEngine';
import { AspectRatioType, ASPECT_RATIOS } from '../../composition/types/composition.types';

interface ResponsiveMotionPanelProps {
  keyframes: KeyframePoint[];
  onApplyAdaptedKeyframes: (adapted: KeyframePoint[]) => void;
}

export function ResponsiveMotionPanel({
  keyframes,
  onApplyAdaptedKeyframes,
}: ResponsiveMotionPanelProps) {
  const [sourceRatio, setSourceRatio] = useState<AspectRatioType>('16:9');
  const [targetRatio, setTargetRatio] = useState<AspectRatioType>('9:16');
  const [property, setProperty] = useState<'position-y' | 'position-x' | 'scale'>('position-y');

  const handleAdapt = () => {
    const adapted = adaptAnimationToAspectRatio(keyframes, sourceRatio, targetRatio, property);
    onApplyAdaptedKeyframes(adapted);
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
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎯</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Responsive Motion Constraints
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Design once → Automatically adapt motion trajectories to 16:9, 9:16 Reels/Shorts, and 1:1 Social Feeds.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>SOURCE RATIO</span>
          <select
            value={sourceRatio}
            onChange={(e) => setSourceRatio(e.target.value as AspectRatioType)}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 4,
              color: '#38bdf8',
              padding: '4px',
              fontSize: 10,
            }}
          >
            {Object.values(ASPECT_RATIOS).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>TARGET RATIO</span>
          <select
            value={targetRatio}
            onChange={(e) => setTargetRatio(e.target.value as AspectRatioType)}
            style={{
              width: '100%',
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 4,
              color: '#ec4899',
              padding: '4px',
              fontSize: 10,
            }}
          >
            {Object.values(ASPECT_RATIOS).map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleAdapt}
        style={{
          background: 'linear-gradient(135deg, #38bdf8, #a855f7)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 11,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        ✨ Convert Motion: {sourceRatio} ➔ {targetRatio}
      </button>
    </div>
  );
}
