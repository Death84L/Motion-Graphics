import React from 'react';
import { KeyframePoint } from '../../types';
import {
  evaluateMotionQuality,
  applyMotionQuickFix,
  MotionQualityReport,
} from '../../../../core/analysis/motionQualityAnalyzer';

interface MotionQualityPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function MotionQualityPanel({ keyframes, onUpdateKeyframes }: MotionQualityPanelProps) {
  const report: MotionQualityReport = evaluateMotionQuality(keyframes);

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#f43f5e';
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
          <span style={{ color: '#10b981', fontSize: 13 }}>🏆</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Motion Quality & Debugger</span>
        </div>

        {/* Overall Score Badge */}
        <div
          style={{
            background: `${getScoreColor(report.overallScore)}22`,
            border: `1px solid ${getScoreColor(report.overallScore)}`,
            color: getScoreColor(report.overallScore),
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {report.overallScore} / 100
        </div>
      </div>

      {/* Metric Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        {[
          { label: 'Smoothness', val: report.smoothness },
          { label: 'Continuity', val: report.continuity },
          { label: 'Overshoot Control', val: report.overshootControl },
          { label: 'Acceleration', val: report.accelerationBalance },
          { label: 'Jerk Suppression', val: report.jerkScore },
        ].map((m) => (
          <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
              <span>{m.label}</span>
              <strong style={{ color: getScoreColor(m.val) }}>{m.val}%</strong>
            </div>
            <div style={{ height: 4, background: '#1e293b', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${m.val}%`, height: '100%', background: getScoreColor(m.val) }} />
            </div>
          </div>
        ))}
      </div>

      {/* "Why Does This Feel Bad?" Diagnostic Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>MOTION DIAGNOSTICS & FIXES</span>

        {report.issues.length === 0 ? (
          <div style={{ fontSize: 11, color: '#10b981', padding: '6px 8px', background: '#064e3b22', borderRadius: 6, border: '1px solid #10b98133' }}>
            ✓ Clean, natural motion with zero unnatural spikes or discontinuities!
          </div>
        ) : (
          report.issues.slice(0, 3).map((issue) => (
            <div
              key={issue.id}
              style={{
                fontSize: 10,
                color: issue.color,
                background: '#11182c',
                padding: '5px 8px',
                borderRadius: 6,
                border: `1px solid ${issue.color}44`,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span>⚠</span>
              <span>{issue.label}: {issue.description}</span>
            </div>
          ))
        )}
      </div>

      {/* 1-Click Quick Fix Actions */}
      {report.suggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {report.suggestions.map((sug) => (
            <button
              key={sug.id}
              onClick={() => {
                const fixed = applyMotionQuickFix(keyframes, sug.actionType);
                onUpdateKeyframes(fixed);
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ⚡ Fix: {sug.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
