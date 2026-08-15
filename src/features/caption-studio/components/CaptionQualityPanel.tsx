import React, { useMemo } from 'react';
import { CaptionSegment } from '../../../core/caption/captionModel';
import { analyzeCaptionSequenceHealth } from '../../../core/caption/readingSpeedAnalyzer';

interface CaptionQualityPanelProps {
  captions: CaptionSegment[];
  onAutoFixTiming: () => void;
}

export function CaptionQualityPanel({ captions, onAutoFixTiming }: CaptionQualityPanelProps) {
  const health = useMemo(() => {
    return analyzeCaptionSequenceHealth(captions);
  }, [captions]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#10b981', fontSize: 13 }}>🩺</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Caption Health & Reading Speed
          </span>
        </div>
      </div>

      {/* Quality Score & WPM Readout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div style={{ background: '#11182c', padding: 8, borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>READING SPEED</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: health.averageWpm <= 180 ? '#10b981' : '#f59e0b', marginTop: 2 }}>
            {health.averageWpm} <span style={{ fontSize: 10, color: '#64748b' }}>WPM</span>
          </div>
        </div>

        <div style={{ background: '#11182c', padding: 8, borderRadius: 6 }}>
          <div style={{ fontSize: 9, color: '#64748b', fontWeight: 700 }}>HEALTH SCORE</div>
          <div style={{ fontSize: 16, fontWeight: 900, color: health.overallScore >= 80 ? '#38bdf8' : '#ec4899', marginTop: 2 }}>
            {health.overallScore} <span style={{ fontSize: 10, color: '#64748b' }}>/ 100</span>
          </div>
        </div>
      </div>

      {/* Issues list or clean check */}
      {health.issues.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {health.issues.slice(0, 3).map((iss, idx) => (
            <div key={idx} style={{ fontSize: 9, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '3px 6px', borderRadius: 4 }}>
              ⚠ {iss}
            </div>
          ))}
          <button
            onClick={onAutoFixTiming}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '6px 10px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: 4,
            }}
          >
            🩺 1-Click Fix Overlaps & Timing
          </button>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: 6, borderRadius: 4, textAlign: 'center' }}>
          ✓ Perfect reading pace & zero timing overlaps!
        </div>
      )}
    </div>
  );
}
