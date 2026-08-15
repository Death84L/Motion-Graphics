import React from 'react';
import { CompositionLayer } from '../types/composition.types';

interface CanvasMotionTrailsProps {
  layer: CompositionLayer;
  showTrails: boolean;
  showOnionSkin: boolean;
}

export function CanvasMotionTrails({
  layer,
  showTrails,
  showOnionSkin,
}: CanvasMotionTrailsProps) {
  if (!showTrails && !showOnionSkin) return null;

  const { transform, width, height } = layer;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Onion Skin Ghost Frames */}
      {showOnionSkin && (
        <>
          {/* Ghost -2 frames */}
          <div
            style={{
              position: 'absolute',
              left: `calc(50% + ${transform.x - 24}px)`,
              top: `calc(50% + ${transform.y + 12}px)`,
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate(-50%, -50%) rotate(${transform.rotation - 4}deg) scale(${transform.scaleX * 0.95})`,
              opacity: 0.2,
              border: '1.5px dashed #38bdf8',
              borderRadius: layer.borderRadius || 12,
            }}
          />
          {/* Ghost -1 frame */}
          <div
            style={{
              position: 'absolute',
              left: `calc(50% + ${transform.x - 12}px)`,
              top: `calc(50% + ${transform.y + 6}px)`,
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate(-50%, -50%) rotate(${transform.rotation - 2}deg) scale(${transform.scaleX * 0.98})`,
              opacity: 0.35,
              border: '1.5px dashed #38bdf8',
              borderRadius: layer.borderRadius || 12,
            }}
          />
        </>
      )}

      {/* Motion Trail Trajectory Ribbon */}
      {showTrails && (
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            overflow: 'visible',
          }}
        >
          <path
            d={`M calc(50% + ${transform.x - 50}px) calc(50% + ${transform.y + 35}px) Q calc(50% + ${transform.x - 20}px) calc(50% + ${transform.y - 15}px) calc(50% + ${transform.x}px) calc(50% + ${transform.y}px)`}
            fill="none"
            stroke="#ec4899"
            strokeWidth="2"
            strokeDasharray="4 3"
            opacity="0.6"
          />
          {/* Velocity Vector Arrow */}
          <circle
            cx={`calc(50% + ${transform.x}px)`}
            cy={`calc(50% + ${transform.y}px)`}
            r="4"
            fill="#ec4899"
          />
        </svg>
      )}
    </div>
  );
}
