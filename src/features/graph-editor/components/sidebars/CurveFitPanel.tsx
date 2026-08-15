import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  fitCurveToMathematicalModel,
  CurveFitModel,
} from '../../../../core/solvers/mathematicalCurveFit';
import { analyzeKeyframeDensity } from '../../../../core/analysis/keyframeDensity';
import { computeCurveErrorMetrics } from '../../../../core/analysis/errorMetricGraph';
import { simplifyKeyframes } from '../../../../core/math/rdpSimplifier';

interface CurveFitPanelProps {
  keyframes: KeyframePoint[];
  originalKeyframes?: KeyframePoint[];
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
}

export function CurveFitPanel({
  keyframes,
  originalKeyframes,
  onUpdateKeyframes,
}: CurveFitPanelProps) {
  const [selectedModel, setSelectedModel] = useState<CurveFitModel>('polynomial');

  const density = analyzeKeyframeDensity(keyframes);
  const errorMetrics = originalKeyframes
    ? computeCurveErrorMetrics(originalKeyframes, keyframes)
    : null;

  const handleFit = () => {
    const res = fitCurveToMathematicalModel(keyframes, selectedModel);
    onUpdateKeyframes(res.fittedKeyframes);
  };

  const handleOptimizeDensity = () => {
    const optimized = simplifyKeyframes(keyframes, 1.8);
    onUpdateKeyframes(optimized);
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#38bdf8', fontSize: 13 }}>📉</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Fit & Density Optimizer</span>
      </div>

      {/* 1. Mathematical Approximation Model */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: 10, color: '#64748b', fontWeight: 600 }}>APPROXIMATE TO MATH MODEL</span>

        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as CurveFitModel)}
            style={{
              flex: 1,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '5px 8px',
              fontSize: 11,
              color: '#38bdf8',
            }}
          >
            <option value="polynomial">Cubic Polynomial</option>
            <option value="exponential">Exponential Decel</option>
            <option value="sinusoidal">Sinusoidal Harmonic</option>
            <option value="spring">Damped Spring</option>
            <option value="logistic">Logistic Sigmoid</option>
          </select>

          <button
            onClick={handleFit}
            style={{
              background: '#38bdf8',
              color: '#041124',
              border: 'none',
              borderRadius: 6,
              padding: '5px 10px',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Fit ⚡
          </button>
        </div>
      </div>

      {/* 2. Keyframe Density Analysis */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: '#090e1a', padding: 8, borderRadius: 8, border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
          <span>Keyframe Count: <strong>{density.totalCount}</strong></span>
          <span style={{ color: density.redundantCount > 0 ? '#f59e0b' : '#10b981' }}>
            {density.redundantCount > 0 ? `${density.redundantCount} Redundant` : 'Optimal'}
          </span>
        </div>

        {/* Density heat bar */}
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden' }}>
          {density.buckets.map((b, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                background:
                  b.densityLevel === 'low'
                    ? '#38bdf8'
                    : b.densityLevel === 'optimal'
                    ? '#10b981'
                    : b.densityLevel === 'high'
                    ? '#f59e0b'
                    : '#f43f5e',
                marginRight: 1,
              }}
            />
          ))}
        </div>

        <button
          onClick={handleOptimizeDensity}
          disabled={density.redundantCount === 0}
          style={{
            background: density.redundantCount > 0 ? '#10b981' : '#1e293b',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '5px 8px',
            fontSize: 10,
            fontWeight: 700,
            cursor: density.redundantCount > 0 ? 'pointer' : 'default',
            opacity: density.redundantCount > 0 ? 1 : 0.5,
          }}
        >
          🧹 Optimize Density (Reduce {density.redundantCount} nodes)
        </button>
      </div>

      {/* 3. Error Metrics */}
      {errorMetrics && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', background: '#11182c', padding: '6px 8px', borderRadius: 6 }}>
          <span>Max Error: <strong style={{ color: '#f43f5e' }}>{errorMetrics.maxError}%</strong></span>
          <span>RMS Error: <strong style={{ color: '#f59e0b' }}>{errorMetrics.rmsError}%</strong></span>
        </div>
      )}
    </div>
  );
}
