import React, { useState, useMemo } from 'react';
import { SmartRotoEngine, RotoPoint } from '../../../core/roto/smartRotoEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface SmartRotoStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function SmartRotoStudioView({ onBakeKeyframesToEditor }: SmartRotoStudioViewProps) {
  const [points, setPoints] = useState<RotoPoint[]>([
    { x: 120, y: 80 },
    { x: 280, y: 80 },
    { x: 300, y: 240 },
    { x: 100, y: 240 },
  ]);
  const [feather, setFeather] = useState<number>(8);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const maskSvgPath = useMemo(() => {
    return SmartRotoEngine.generateMaskSvgPath(points);
  }, [points]);

  const handleBake = () => {
    const baked = SmartRotoEngine.bakeRotoToKeyframes(points);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, 'Smart Roto Mask');
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🪄</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Smart Auto-Roto & Matte
          </span>
        </div>

        {/* Feather Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Edge Feather:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{feather}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="32"
            value={feather}
            onChange={(e) => setFeather(parseInt(e.target.value))}
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
            Interactive Vector Roto Canvas
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
          <svg width="400" height="300" style={{ overflow: 'visible', background: '#090e1a', borderRadius: 8 }}>
            <path
              d={maskSvgPath}
              fill="rgba(56, 189, 248, 0.25)"
              stroke="#38bdf8"
              strokeWidth="2"
              style={{ filter: `blur(${feather * 0.3}px)` }}
            />
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="5"
                fill="#ec4899"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ cursor: 'pointer' }}
              />
            ))}
          </svg>
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
          Matte Properties
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Local-first rotoscoping without paid AI subscriptions. Integrates with Premiere and After Effects mask paths.
        </div>
      </div>
    </div>
  );
}
