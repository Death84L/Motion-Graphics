import React, { useState } from 'react';
import type { PreviewProperty } from '../types';

type MotionPreviewProps = {
  currentValue: number; // 0 to 100
  currentTime: number; // 0 to 100
  isPlaying: boolean;
};

export function MotionPreview({
  currentValue,
  currentTime,
  isPlaying,
}: MotionPreviewProps) {
  const [property, setProperty] = useState<PreviewProperty>('translate-x');
  const [shape, setShape] = useState<'cube' | 'circle' | 'gem'>('gem');

  // Compute transform based on current value (0-100 normalized)
  const normVal = currentValue / 100;

  const getPreviewTransform = () => {
    switch (property) {
      case 'translate-x':
        // Travel across the preview track: -120px to +120px
        return `translateX(${(normVal - 0.5) * 240}px)`;
      case 'translate-y':
        // Travel vertically: +60px to -60px
        return `translateY(${-(normVal - 0.5) * 120}px)`;
      case 'scale':
        // Scale from 0.4x to 1.8x
        const s = 0.4 + normVal * 1.4;
        return `scale(${Math.max(0.1, s)})`;
      case 'rotate':
        // Rotate from -180deg to +180deg
        return `rotate(${normVal * 360}deg)`;
      case 'opacity':
        return `scale(1.1)`;
      case 'morph':
        return `scale(${0.8 + normVal * 0.5}) rotate(${normVal * 180}deg)`;
      default:
        return 'none';
    }
  };

  const getPreviewOpacity = () => {
    if (property === 'opacity') {
      return Math.max(0.1, Math.min(1, normVal));
    }
    return 1;
  };

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isPlaying ? '#10b981' : '#64748b',
              boxShadow: isPlaying ? '0 0 10px #10b981' : 'none',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>
            Live Motion Preview
          </span>
        </div>

        {/* Property Selector */}
        <select
          value={property}
          onChange={(e) => setProperty(e.target.value as PreviewProperty)}
          style={{
            background: '#11182c',
            color: '#38bdf8',
            border: '1px solid #2a3754',
            borderRadius: 6,
            padding: '4px 8px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <option value="translate-x">Property: Translate X</option>
          <option value="translate-y">Property: Translate Y</option>
          <option value="scale">Property: Scale</option>
          <option value="rotate">Property: Rotate</option>
          <option value="opacity">Property: Opacity</option>
          <option value="morph">Property: Morph & Spin</option>
        </select>
      </div>

      {/* Visual Canvas / Motion Stage */}
      <div
        style={{
          position: 'relative',
          height: 140,
          background: 'radial-gradient(circle at center, #131d36 0%, #080d19 100%)',
          border: '1px solid #1e293b',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Grid & Guideline */}
        <div
          style={{
            position: 'absolute',
            width: '80%',
            height: 1,
            background: 'dashed 1px #1e293b',
            borderTop: '1px dashed #334155',
          }}
        />
        <div
          style={{
            position: 'absolute',
            height: '80%',
            width: 1,
            borderLeft: '1px dashed #334155',
          }}
        />

        {/* Animated Object */}
        <div
          style={{
            transform: getPreviewTransform(),
            opacity: getPreviewOpacity(),
            transition: 'transform 0.04s linear, opacity 0.04s linear',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {shape === 'gem' && (
            <div
              style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 50%, #ec4899 100%)',
                borderRadius: 10,
                transform: 'rotate(45deg)',
                boxShadow: '0 0 24px rgba(56, 189, 248, 0.6), inset 0 0 12px rgba(255,255,255,0.4)',
                border: '2px solid rgba(255,255,255,0.5)',
              }}
            />
          )}

          {shape === 'cube' && (
            <div
              style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                borderRadius: 8,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                border: '2px solid #60a5fa',
              }}
            />
          )}

          {shape === 'circle' && (
            <div
              style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
                borderRadius: '50%',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                border: '2px solid #34d399',
              }}
            />
          )}
        </div>
      </div>

      {/* Readout stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          fontSize: 11,
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <div style={{ background: '#11182c', padding: '6px 8px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 10 }}>TIME</div>
          <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{currentTime.toFixed(1)}f / 100f</div>
        </div>

        <div style={{ background: '#11182c', padding: '6px 8px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 10 }}>CURVE OUTPUT</div>
          <div style={{ color: '#38bdf8', fontWeight: 600 }}>{currentValue.toFixed(1)}%</div>
        </div>

        <div style={{ background: '#11182c', padding: '6px 8px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ color: '#64748b', fontSize: 10 }}>SHAPE</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {(['gem', 'cube', 'circle'] as const).map((s) => (
              <span
                key={s}
                onClick={() => setShape(s)}
                style={{
                  cursor: 'pointer',
                  color: shape === s ? '#f59e0b' : '#64748b',
                  fontWeight: shape === s ? 700 : 400,
                  textTransform: 'capitalize',
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
