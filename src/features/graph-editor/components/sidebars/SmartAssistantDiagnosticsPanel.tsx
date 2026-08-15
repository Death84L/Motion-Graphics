import React, { useMemo } from 'react';
import { KeyframePoint } from '../../types';
import {
  analyzeCurveHealthDiagnostics,
  autoFixCurveHealth,
} from '../../../../core/analysis/smartCurveAssistant';

interface SmartAssistantDiagnosticsPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function SmartAssistantDiagnosticsPanel({
  keyframes,
  onUpdateKeyframes,
}: SmartAssistantDiagnosticsPanelProps) {
  const report = useMemo(() => {
    return analyzeCurveHealthDiagnostics(keyframes);
  }, [keyframes]);

  const handleAutoFix = () => {
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
          <span style={{ color: '#10b981', fontSize: 13 }}>🔬</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Curve Diagnostics & Smart Assistant
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
            <span style={{ fontSize: 24, fontWeight: 900, color: report.overallScore >= 80 ? '#10b981' : '#f59e0b' }}>
              {report.overallScore}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>/ 100</span>
          </div>
        </div>

        <button
          onClick={handleAutoFix}
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
          ⚡ 1-Click Auto Fix
        </button>
      </div>

      {/* Kinematics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          background: '#11182c',
          padding: 8,
          borderRadius: 8,
          border: '1px solid #1e293b',
        }}
      >
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Smoothness: <strong style={{ color: '#10b981' }}>{report.smoothnessScore}%</strong>
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Velocity: <strong style={{ color: '#38bdf8' }}>{report.velocityScore}%</strong>
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Peak Jerk: <strong style={{ color: '#ec4899' }}>{report.peakJerk.toFixed(0)} px/s³</strong>
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8' }}>
          Redundant Keys: <strong style={{ color: '#f59e0b' }}>{report.redundantKeysCount}</strong>
        </div>
      </div>

      {/* Detected Issues */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Diagnostic Warnings ({report.issues.length})
        </span>
        {report.issues.length === 0 ? (
          <div style={{ fontSize: 11, color: '#10b981', padding: 6, background: '#064e3b22', borderRadius: 6 }}>
            ✓ Perfect curve geometry. No discontinuities or jerk spikes detected.
          </div>
        ) : (
          report.issues.map((iss) => (
            <div
              key={iss.id}
              style={{
                fontSize: 10,
                color: '#cbd5e1',
                background: '#11182c',
                padding: '6px 8px',
                borderRadius: 6,
                borderLeft: `3px solid ${iss.severity === 'warning' ? '#f59e0b' : '#38bdf8'}`,
              }}
            >
              <div>{iss.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
