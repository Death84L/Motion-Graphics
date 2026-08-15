import React from 'react';
import { KeyframePoint } from '../../types';

interface CanvasKeyframeNodesProps {
  keyframes: KeyframePoint[];
  selectedKeyframeIds: number[];
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
  onKeyframePointerDown: (e: React.PointerEvent, kf: KeyframePoint) => void;
}

export function CanvasKeyframeNodes({
  keyframes,
  selectedKeyframeIds,
  toSvgPoint,
  onKeyframePointerDown,
}: CanvasKeyframeNodesProps) {
  return (
    <g className="canvas-keyframe-nodes">
      {keyframes.map((point) => {
        const svgPt = toSvgPoint(point);
        const isSelected = selectedKeyframeIds.includes(point.id);
        const kfType = point.type || (point.ease === 'linear' ? 'linear' : point.ease === 'hold' ? 'hold' : 'bezier');

        return (
          <g
            key={`kf-node-${point.id}`}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => onKeyframePointerDown(e, point)}
          >
            {/* Selection Halo */}
            {isSelected && (
              <circle
                cx={svgPt.x}
                cy={svgPt.y}
                r={16}
                fill="rgba(245, 158, 11, 0.18)"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}

            {/* Shape Glyphs */}
            {kfType === 'linear' && (
              <polygon
                points={`${svgPt.x},${svgPt.y - 7} ${svgPt.x + 7},${svgPt.y} ${svgPt.x},${svgPt.y + 7} ${svgPt.x - 7},${svgPt.y}`}
                fill={isSelected ? '#fbbf24' : '#38bdf8'}
                stroke="#0b1329"
                strokeWidth={2}
              />
            )}

            {kfType === 'hold' && (
              <rect
                x={svgPt.x - 6}
                y={svgPt.y - 6}
                width={12}
                height={12}
                rx={2}
                fill={isSelected ? '#fbbf24' : '#f43f5e'}
                stroke="#0b1329"
                strokeWidth={2}
              />
            )}

            {kfType === 'auto' && (
              <polygon
                points={`${svgPt.x},${svgPt.y - 8} ${svgPt.x + 8},${svgPt.y} ${svgPt.x},${svgPt.y + 8} ${svgPt.x - 8},${svgPt.y}`}
                fill="none"
                stroke={isSelected ? '#fbbf24' : '#10b981'}
                strokeWidth={2.5}
              />
            )}

            {(kfType === 'bezier' || (kfType !== 'linear' && kfType !== 'hold' && kfType !== 'auto')) && (
              <circle
                cx={svgPt.x}
                cy={svgPt.y}
                r={isSelected ? 7.5 : 6}
                fill={isSelected ? '#fbbf24' : '#38bdf8'}
                stroke="#0b1329"
                strokeWidth={2.5}
              />
            )}

            {/* Value Readout Tag */}
            <text
              x={svgPt.x}
              y={svgPt.y - 12}
              fill={isSelected ? '#fbbf24' : '#94a3b8'}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              fontWeight={isSelected ? 700 : 400}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {point.value.toFixed(0)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}
