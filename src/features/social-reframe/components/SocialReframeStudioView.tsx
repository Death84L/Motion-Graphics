import React, { useState, useMemo } from 'react';
import { ViralReframeEngine, SocialTargetFormat, ReframeBoundingBox } from '../../../core/social/viralReframeEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface SocialReframeStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function SocialReframeStudioView({ onBakeKeyframesToEditor }: SocialReframeStudioViewProps) {
  const [format, setFormat] = useState<SocialTargetFormat>('9:16-reels');
  const [subjectX, setSubjectX] = useState<number>(240);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const reframeBox: ReframeBoundingBox = useMemo(() => {
    return ViralReframeEngine.computeReframeBox(480, 270, subjectX, format);
  }, [subjectX, format]);

  const handleBake = () => {
    const baked = ViralReframeEngine.bakeReframeToKeyframes(reframeBox);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Auto-Reframe • ${format.toUpperCase()}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>📱</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Viral Social Auto-Reframe
          </span>
        </div>

        {/* Target Formats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>TARGET FORMAT:</span>
          {(['9:16-reels', '1:1-square', '4:5-portrait', '16:9-landscape'] as SocialTargetFormat[]).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              style={{
                background: format === fmt ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                border: `1px solid ${format === fmt ? '#38bdf8' : '#1e293b'}`,
                color: format === fmt ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {fmt.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Subject X Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Subject Pan X:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{subjectX}px</span>
          </div>
          <input
            type="range"
            min="60"
            max="420"
            value={subjectX}
            onChange={(e) => setSubjectX(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>

      {/* 2. CENTER COLUMN */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
            Live 16:9 Landscape Source with 9:16 Crop Window
          </span>

          <button
            onClick={handleBake}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '360px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 16:9 Source Video Box */}
          <div
            style={{
              width: 480,
              height: 270,
              background: '#0f172a',
              border: '1px solid #334155',
              position: 'relative',
              borderRadius: 6,
              overflow: 'hidden',
            }}
          >
            {/* Subject Indicator */}
            <div
              style={{
                position: 'absolute',
                left: `${subjectX - 16}px`,
                top: '40%',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                border: '2px solid #ffffff',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.8)',
              }}
            >
              👤
            </div>

            {/* 9:16 Crop Overlay Window */}
            <div
              style={{
                position: 'absolute',
                left: `${reframeBox.x}px`,
                top: 0,
                width: `${reframeBox.width}px`,
                height: '100%',
                border: '2px dashed #38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: 6,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: '#38bdf8', background: '#040711', padding: '1px 4px', borderRadius: 2 }}>
                {format.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Viral Reframe Spec
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Auto-centering pan and scan math ensuring talking-head speakers remain centered in vertical Shorts and Reels.
        </div>
      </div>
    </div>
  );
}
