import React, { useState, useMemo } from 'react';
import { PlanarCornerPinEngine, CornerPinPoints } from '../../../core/matchmove/planarCornerPinEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface MatchmoveStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function MatchmoveStudioView({ onBakeKeyframesToEditor }: MatchmoveStudioViewProps) {
  const [corners, setCorners] = useState<CornerPinPoints>({
    topLeft: { x: 80, y: 60 },
    topRight: { x: 320, y: 40 },
    bottomRight: { x: 350, y: 240 },
    bottomLeft: { x: 60, y: 220 },
  });
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const polygonPointsStr = useMemo(() => {
    return PlanarCornerPinEngine.getPolygonPoints(corners);
  }, [corners]);

  const handleBake = () => {
    const baked = PlanarCornerPinEngine.bakeCornerPinToKeyframes(corners);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, '4-Point Corner Pin');
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🗺️</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            3D Matchmove & Corner-Pin
          </span>
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Drag the 4 corner handles to align motion graphics, screen recordings, or UI mockups onto phone screens and billboards.
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
            Planar 4-Point Homography Canvas
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
          <svg width="420" height="300" style={{ overflow: 'visible', background: '#090e1a', borderRadius: 8 }}>
            <polygon
              points={polygonPointsStr}
              fill="rgba(56, 189, 248, 0.2)"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {Object.entries(corners).map(([key, pt]) => (
              <circle
                key={key}
                cx={pt.x}
                cy={pt.y}
                r="6"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="2"
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
          Homography Matrix
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Exports directly into Adobe After Effects Corner Pin effect and DaVinci Resolve Planar Transform nodes.
        </div>
      </div>
    </div>
  );
}
