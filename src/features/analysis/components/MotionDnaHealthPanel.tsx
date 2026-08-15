import React, { useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import { extractMotionDna } from '../../../core/analysis/motionDnaEngine';
import { autoFixCurveHealth } from '../../../core/analysis/smartCurveAssistant';

interface MotionDnaHealthPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function MotionDnaHealthPanel({
  keyframes,
  onUpdateKeyframes,
}: MotionDnaHealthPanelProps) {
  const dna = useMemo(() => {
    return extractMotionDna(keyframes);
  }, [keyframes]);

  const handleFix = () => {
    const fixed = autoFixCurveHealth(keyframes);
    onUpdateKeyframes(fixed);
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
          <span style={{ color: '#10b981', fontSize: 13 }}>🧬</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Motion DNA & Health Diagnostics
          </span>
        </div>
      </div>

      {/* Main Score Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d1f35, #11182c)',
          border: '1px solid #1e3a8a',
          borderRadius: 10,
          padding: 12,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
            Overall Motion Quality
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
            <span style={{ fontSize: 24, fontWeight: 900, color: dna.overallQuality >= 80 ? '#10b981' : '#f59e0b' }}>
              {dna.overallQuality}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>/ 100</span>
          </div>
        </div>

        <button
          onClick={handleFix}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 7,
            padding: '7px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          🩺 1-Click Fix
        </button>
      </div>

      {/* Motion DNA Trait Breakdown Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Motion DNA Fingerprint
        </label>

        {[
          { label: 'Energy', val: dna.energy, color: '#38bdf8' },
          { label: 'Smoothness', val: dna.smoothness, color: '#10b981' },
          { label: 'Elasticity', val: dna.elasticity, color: '#a855f7' },
          { label: 'Overshoot Index', val: dna.overshoot, color: '#ec4899' },
          { label: 'Aggression', val: dna.aggression, color: '#f59e0b' },
          { label: 'Rhythm', val: dna.rhythm, color: '#6366f1' },
        ].map((trait) => (
          <div key={trait.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
              <span>{trait.label}</span>
              <span style={{ fontWeight: 700, color: trait.color }}>{trait.val}%</span>
            </div>
            <div style={{ height: 4, background: '#11182c', borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${trait.val}%`,
                  height: '100%',
                  background: trait.color,
                  borderRadius: 2,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
