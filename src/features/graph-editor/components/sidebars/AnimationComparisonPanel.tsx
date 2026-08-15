import React, { useState, useMemo } from 'react';
import { KeyframePoint, CurveLayer } from '../../types';
import { compareAnimationCurves } from '../../../../core/analysis/animationComparisonEngine';

interface AnimationComparisonPanelProps {
  activeLayer: CurveLayer;
  curveLayers: CurveLayer[];
}

export function AnimationComparisonPanel({ activeLayer, curveLayers }: AnimationComparisonPanelProps) {
  const otherLayers = curveLayers.filter((l) => l.id !== activeLayer.id);
  const [compareLayerId, setCompareLayerId] = useState<string>(otherLayers[0]?.id || activeLayer.id);

  const compareLayer = curveLayers.find((l) => l.id === compareLayerId) || activeLayer;

  const report = useMemo(() => {
    return compareAnimationCurves(activeLayer.keyframes, compareLayer.keyframes);
  }, [activeLayer.keyframes, compareLayer.keyframes]);

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
          <span style={{ color: '#ec4899', fontSize: 13 }}>⚖️</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Animation Comparison (A vs B)
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Compare active curve against another layer or ghost reference with deep differential kinematic analysis.
      </div>

      {/* Layer Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: '#11182c', padding: 8, borderRadius: 8, border: '1px solid #38bdf8' }}>
          <div style={{ fontSize: 9, color: '#38bdf8', fontWeight: 700 }}>CURVE A (ACTIVE)</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc', marginTop: 2 }}>{activeLayer.name}</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>{activeLayer.keyframes.length} keys</div>
        </div>

        <div style={{ background: '#11182c', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>CURVE B (TARGET)</div>
          <select
            value={compareLayerId}
            onChange={(e) => setCompareLayerId(e.target.value)}
            style={{
              width: '100%',
              background: '#080d1a',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '3px 4px',
              fontSize: 10,
              color: '#f8fafc',
              marginTop: 2,
            }}
          >
            {curveLayers.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{compareLayer.keyframes.length} keys</div>
        </div>
      </div>

      {/* Similarity & Deviation Metric Card */}
      <div
        style={{
          background: '#11182c',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: 10,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>SIMILARITY</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: report.similarityPercentage > 80 ? '#10b981' : '#f59e0b' }}>
            {report.similarityPercentage}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>MAX DEVIATION</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#ec4899' }}>
            {report.maxDeviation.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>AVG RMSE ERROR</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
            ±{report.averageDeviation.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#64748b' }}>PEAK VEL DIFF</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc' }}>
            {report.peakVelocityDiff.toFixed(1)} px/s
          </div>
        </div>
      </div>
    </div>
  );
}
