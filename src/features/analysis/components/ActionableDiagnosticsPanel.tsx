import React, { useState, useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  analyzeActionableMotionHealth,
  applyActionableAutoFix,
  AutoFixMode,
} from '../../../core/analysis/actionableDiagnosticsEngine';

interface ActionableDiagnosticsPanelProps {
  keyframes: KeyframePoint[];
  onApplyFixedKeyframes: (fixedKeyframes: KeyframePoint[]) => void;
}

export function ActionableDiagnosticsPanel({
  keyframes,
  onApplyFixedKeyframes,
}: ActionableDiagnosticsPanelProps) {
  const [fixMode, setFixMode] = useState<AutoFixMode>('balanced');
  const report = useMemo(() => analyzeActionableMotionHealth(keyframes), [keyframes]);

  const handleFix = () => {
    const fixed = applyActionableAutoFix(keyframes, fixMode);
    onApplyFixedKeyframes(fixed);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>🩺</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Actionable Motion Health & Auto-Fix
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: report.jerkStatus === 'optimal' ? '#10b981' : report.jerkStatus === 'moderate' ? '#f59e0b' : '#ef4444',
            background: '#11182c',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          JERK: {report.jerkStatus.toUpperCase()}
        </span>
      </div>

      {/* Metrics Readout Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>SMOOTHNESS</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#38bdf8' }}>{report.smoothnessScore}</div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>ENERGY</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#f59e0b' }}>{report.energyScore}</div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>ELASTICITY</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#ec4899' }}>{report.elasticityScore}</div>
        </div>
        <div style={{ background: '#11182c', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          <div style={{ fontSize: 8, color: '#64748b' }}>RHYTHM</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#10b981' }}>{report.rhythmScore}</div>
        </div>
      </div>

      {/* Detected Actionable Issues */}
      {report.issues.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
            Kinematic Discontinuities Detected
          </div>
          {report.issues.map((iss) => (
            <div
              key={iss.id}
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b' }}>
                ⚠ {iss.description}
              </div>
              <div style={{ fontSize: 9, color: '#94a3b8' }}>
                Suggestion: {iss.fixSuggestion} (Potential Jerk Reduction: <strong>-{iss.potentialJerkReductionPercent}%</strong>)
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: 8, borderRadius: 6, textAlign: 'center', fontSize: 10 }}>
          ✓ Smooth continuous velocity profile with no abrupt jerk kinks!
        </div>
      )}

      {/* Auto Fix Controls */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: 8 }}>
        <select
          value={fixMode}
          onChange={(e) => setFixMode(e.target.value as AutoFixMode)}
          style={{
            flex: 1,
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#38bdf8',
            padding: '6px',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          <option value="conservative">Conservative (Preserve Timing)</option>
          <option value="balanced">Balanced (Smooth Continuous Tangents)</option>
          <option value="aggressive">Aggressive (Harmonic Relaxation)</option>
        </select>

        <button
          onClick={handleFix}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '6px 14px',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          ✨ 1-Click Fix
        </button>
      </div>
    </div>
  );
}
