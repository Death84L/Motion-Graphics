import React from 'react';
import { KeyframePoint, GraphViewport } from '../../types';
import { detectCurveExtrema, CurveExtremaMarker } from '../../../../core/math/extremaDetector';

interface CanvasExtremaMarkersProps {
  keyframes: KeyframePoint[];
  viewport: GraphViewport;
  width: number;
  height: number;
  onSelectTime: (time: number) => void;
}

export function CanvasExtremaMarkers({
  keyframes,
  viewport,
  width,
  height,
  onSelectTime,
}: CanvasExtremaMarkersProps) {
  if (keyframes.length < 2) return null;

  const markers: CurveExtremaMarker[] = detectCurveExtrema(keyframes);

  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const valToY = (v: number) => height / 2 - ((v - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y;

  return (
    <g className="canvas-extrema-markers">
      {markers.map((m) => {
        const x = timeToX(m.time);
        const y = valToY(m.value);

        return (
          <g
            key={m.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTime(m.time);
            }}
            style={{ cursor: 'pointer' }}
          >
            {/* Target Ring */}
            <circle cx={x} cy={y} r={4} fill="none" stroke={m.color} strokeWidth={1.5} />
            <circle cx={x} cy={y} r={1.5} fill={m.color} />

            {/* Tag Badge */}
            <rect
              x={x - 24}
              y={m.type === 'min' ? y + 8 : y - 18}
              width={48}
              height={14}
              rx={3}
              fill="rgba(10, 15, 29, 0.9)"
              stroke={m.color}
              strokeWidth={0.8}
            />
            <text
              x={x}
              y={m.type === 'min' ? y + 18 : y - 8}
              fill={m.color}
              fontSize={8}
              fontWeight={700}
              textAnchor="middle"
              style={{ userSelect: 'none' }}
            >
              {m.type.toUpperCase()}
            </text>
          </g>
        );
      })}
    </g>
  );
}
