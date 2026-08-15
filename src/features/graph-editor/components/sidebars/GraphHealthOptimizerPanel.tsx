import React from 'react';
import { KeyframePoint } from '../../types';
import { evaluateGraphHealth, GraphHealthStatus } from '../../../../core/optimizer/graphHealthMonitor';
import { transformCurveFeel, FeelTransformation } from '../../../../core/optimizer/feelBetterTransformer';
import { runOneClickMotionOptimization } from '../../../../core/optimizer/oneClickOptimizer';

interface GraphHealthOptimizerPanelProps {
  keyframes: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function GraphHealthOptimizerPanel({
  keyframes,
  onUpdateKeyframes,
}: GraphHealthOptimizerPanelProps) {
  const health: GraphHealthStatus = evaluateGraphHealth(keyframes);

  const handleFeel = (feel: FeelTransformation) => {
    const transformed = transformCurveFeel(keyframes, feel);
    onUpdateKeyframes(transformed);
  };

  const handleOneClickOptimize = () => {
    const summary = runOneClickMotionOptimization(keyframes);
    onUpdateKeyframes(summary.optimizedKeyframes);
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
          <span style={{ color: '#10b981', fontSize: 13 }}>🩺</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Graph Health & Feel AI</span>
        </div>

        <span
          style={{
            background: health.overallHealthScore >= 80 ? '#064e3b' : '#881337',
            color: health.overallHealthScore >= 80 ? '#10b981' : '#f43f5e',
            border: `1px solid ${health.overallHealthScore >= 80 ? '#10b981' : '#f43f5e'}`,
            padding: '2px 8px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {health.overallHealthScore}% HEALTH
        </span>
      </div>

      {/* Continuity Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b', fontSize: 10 }}>
        <div style={{ color: health.c0Status ? '#10b981' : '#f43f5e' }}>
          {health.c0Status ? '✓' : '✕'} C0 Position Continuous
        </div>
        <div style={{ color: health.c1Status ? '#10b981' : '#f43f5e' }}>
          {health.c1Status ? '✓' : '✕'} C1 Velocity Continuous
        </div>
        <div style={{ color: health.c2Status ? '#10b981' : '#f59e0b' }}>
          {health.c2Status ? '✓' : '⚠'} C2 Acceleration Soft
        </div>
        <div style={{ color: health.overshootCount === 0 ? '#10b981' : '#f59e0b' }}>
          {health.overshootCount === 0 ? '✓ Zero Overshoot' : `⚠ ${health.overshootCount} Overshoots`}
        </div>
      </div>

      {/* ✨ ONE-CLICK OPTIMIZE HERO BUTTON */}
      <button
        onClick={handleOneClickOptimize}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 12,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
        }}
      >
        ✨ 1-Click Optimize Motion Spline
      </button>

      {/* "Make It Feel Better" Semantic Transformer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>"MAKE IT FEEL BETTER" AI TRANSFORM</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[
            { id: 'more-snappy' as const, label: '⚡ More Snappy' },
            { id: 'more-smooth' as const, label: '🌊 More Smooth' },
            { id: 'more-cinematic' as const, label: '🎬 More Cinematic' },
            { id: 'more-elastic' as const, label: '🎾 More Elastic' },
            { id: 'more-heavy' as const, label: '⚓ More Heavy' },
            { id: 'more-natural' as const, label: '🍃 More Natural' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleFeel(btn.id)}
              style={{
                padding: '6px 8px',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                color: '#38bdf8',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
