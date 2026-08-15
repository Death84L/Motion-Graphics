import React, { useState, useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  calculateMatchMetrics,
  optimizeCurveMatching,
  MatchingWeights,
  DEFAULT_MATCHING_WEIGHTS,
} from '../../../core/matching/advancedMotionMatcher';
import { SAMPLE_REFERENCE_CURVES } from '../../../core/math/referenceMotionOverlay';

interface MotionMatchingStudioViewProps {
  currentKeyframes: KeyframePoint[];
  onApplyMatchedKeyframes: (updated: KeyframePoint[]) => void;
}

export function MotionMatchingStudioView({
  currentKeyframes,
  onApplyMatchedKeyframes,
}: MotionMatchingStudioViewProps) {
  const [activeMode, setActiveMode] = useState<'find-similar' | 'match-motion' | 'match-reference'>('match-reference');
  const [selectedRefIndex, setSelectedRefIndex] = useState<number>(0);
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_MATCHING_WEIGHTS);

  const referenceKeyframes = SAMPLE_REFERENCE_CURVES[selectedRefIndex]?.keyframes || currentKeyframes;

  const matchReport = useMemo(() => {
    return calculateMatchMetrics(referenceKeyframes, currentKeyframes, weights);
  }, [referenceKeyframes, currentKeyframes, weights]);

  const handleOptimize = () => {
    const optimized = optimizeCurveMatching(referenceKeyframes, currentKeyframes, 5);
    onApplyMatchedKeyframes(optimized);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Center Column: Visual Reference & Comparison Stage */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 14,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#ec4899', fontSize: 18 }}>🧬</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#f8fafc' }}>
              Motion Matching & Kinematic Transfer Engine
            </span>
          </div>

          {/* Mode Pills */}
          <div style={{ display: 'flex', gap: 4, background: '#11182c', padding: 2, borderRadius: 6 }}>
            {(['find-similar', 'match-motion', 'match-reference'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                style={{
                  padding: '4px 8px',
                  fontSize: 9,
                  fontWeight: activeMode === m ? 800 : 500,
                  background: activeMode === m ? '#ec4899' : 'transparent',
                  color: activeMode === m ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {m.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Match Percentage & Error Gauge Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(56, 189, 248, 0.1))',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            borderRadius: 12,
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 12,
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>MATCH SIMILARITY</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: matchReport.matchPercentage >= 90 ? '#10b981' : '#ec4899', marginTop: 2 }}>
              {matchReport.matchPercentage}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>MATCH ERROR</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: matchReport.matchErrorPercent <= 5 ? '#10b981' : '#f59e0b', marginTop: 2 }}>
              {matchReport.matchErrorPercent}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>VELOCITY ERROR</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#38bdf8', marginTop: 6 }}>
              {matchReport.velocityError}%
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>OVERSHOOT DELTA</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#ec4899', marginTop: 6 }}>
              ±{matchReport.overshootError}%
            </div>
          </div>
        </div>

        {/* Visual Reference Selector */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>
            Reference Motion Curve: <span style={{ color: '#38bdf8' }}>{SAMPLE_REFERENCE_CURVES[selectedRefIndex]?.name}</span>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {SAMPLE_REFERENCE_CURVES.map((rc, idx) => (
              <button
                key={rc.id}
                onClick={() => setSelectedRefIndex(idx)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: selectedRefIndex === idx ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${selectedRefIndex === idx ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  color: selectedRefIndex === idx ? '#38bdf8' : '#94a3b8',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {rc.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Multi-Metric Optimization Weights & Action */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Optimization Weight Matrix
        </div>

        {/* Velocity Weight */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Velocity Profile:</span>
            <span style={{ color: '#38bdf8', fontWeight: 700 }}>{(weights.velocity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={weights.velocity}
            onChange={(e) => setWeights({ ...weights, velocity: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Easing Damping Weight */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Easing & Damping:</span>
            <span style={{ color: '#10b981', fontWeight: 700 }}>{(weights.easing * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={weights.easing}
            onChange={(e) => setWeights({ ...weights, easing: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Overshoot Weight */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
            <span>Overshoot Magnitude:</span>
            <span style={{ color: '#ec4899', fontWeight: 700 }}>{(weights.overshoot * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={weights.overshoot}
            onChange={(e) => setWeights({ ...weights, overshoot: parseFloat(e.target.value) })}
            style={{ width: '100%', accentColor: '#ec4899' }}
          />
        </div>

        <button
          onClick={handleOptimize}
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 11,
            fontWeight: 900,
            cursor: 'pointer',
            marginTop: 'auto',
            boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
          }}
        >
          ✨ Optimize & Match Reference ({matchReport.matchPercentage}% ➔ 98%)
        </button>
      </div>
    </div>
  );
}
