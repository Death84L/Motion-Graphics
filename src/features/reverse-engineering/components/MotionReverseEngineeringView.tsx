import React, { useMemo } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import { reverseEngineerMotion } from '../../../core/intelligence/motionReverseEngineering';
import { compileRecipeToKeyframes } from '../../../core/recipes/motionRecipeSchema';

interface MotionReverseEngineeringViewProps {
  currentKeyframes: KeyframePoint[];
  onApplyReconstructedKeyframes: (reconstructedKeyframes: KeyframePoint[]) => void;
}

export function MotionReverseEngineeringView({
  currentKeyframes,
  onApplyReconstructedKeyframes,
}: MotionReverseEngineeringViewProps) {
  const report = useMemo(() => reverseEngineerMotion(currentKeyframes), [currentKeyframes]);

  const handleRebuild = () => {
    const rebuiltKeyframes = compileRecipeToKeyframes(report.reconstructedRecipe);
    onApplyReconstructedKeyframes(rebuiltKeyframes);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 24,
        background: '#060913',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#a855f7', fontSize: 20 }}>🧠</span>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: '#f8fafc', margin: 0 }}>
            Motion Reverse Engineering & Explanation
          </h2>
          <span style={{ fontSize: 11, color: '#94a3b8' }}>
            Deconstructs raw keyframes or video tracking data into physical parameters and rebuilds structured recipes.
          </span>
        </div>
      </div>

      {/* Explanation Summary Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.1))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 12,
          padding: 16,
          fontSize: 12,
          color: '#e2e8f0',
          lineHeight: 1.6,
        }}
      >
        <strong>🔬 Motion Structure Analysis:</strong>
        <p style={{ margin: '6px 0 0 0', color: '#cbd5e1' }}>{report.explanationSummary}</p>
      </div>

      {/* Parameter Cards Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>DETECTED DURATION</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#38bdf8', marginTop: 4 }}>
            {report.detectedDurationMs} <span style={{ fontSize: 10, color: '#64748b' }}>ms</span>
          </div>
        </div>

        <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>PRIMARY EASING</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', marginTop: 4 }}>
            {report.primaryEasingType}
          </div>
        </div>

        <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>KINETIC OVERSHOOT</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#ec4899', marginTop: 4 }}>
            +{report.overshootPercent} <span style={{ fontSize: 10, color: '#64748b' }}>%</span>
          </div>
        </div>

        <div style={{ background: '#090e1a', border: '1px solid #1e293b', padding: 12, borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>SPRING DAMPING</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b', marginTop: 4 }}>
            {report.estimatedSpringDamping}
          </div>
        </div>
      </div>

      {/* Reconstructed Recipe Card */}
      <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Reconstructed Recipe: {report.reconstructedRecipe.name}
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
              {report.reconstructedRecipe.description}
            </div>
          </div>

          <button
            onClick={handleRebuild}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(168, 85, 247, 0.4)',
            }}
          >
            ✨ Rebuild as Editable Graph
          </button>
        </div>
      </div>
    </div>
  );
}
