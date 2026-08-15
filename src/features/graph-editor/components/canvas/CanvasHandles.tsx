import React from 'react';
import { KeyframePoint, GraphViewport } from '../../types';
import { calculateAngleAndLength } from '../../../../core/math/tangentMath';

interface CanvasHandlesProps {
  keyframes: KeyframePoint[];
  selectedKeyframeIds: number[];
  viewport: GraphViewport;
  innerWidth: number;
  innerHeight: number;
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
  onHandlePointerDown: (
    e: React.PointerEvent,
    keyframeId: number,
    type: 'handleIn' | 'handleOut'
  ) => void;
}

export function CanvasHandles({
  keyframes,
  selectedKeyframeIds,
  viewport,
  innerWidth,
  innerHeight,
  toSvgPoint,
  onHandlePointerDown,
}: CanvasHandlesProps) {
  return (
    <g className="canvas-handles">
      {keyframes.map((point) => {
        const isSelected = selectedKeyframeIds.includes(point.id);
        if (!isSelected) return null;

        const svgPt = toSvgPoint(point);
        const handleIn = point.handleIn || { x: -15, y: 0 };
        const handleOut = point.handleOut || { x: 15, y: 0 };

        const inPt = {
          x: svgPt.x + (handleIn.x / 100) * innerWidth * viewport.scaleX,
          y: svgPt.y - (handleIn.y / 100) * innerHeight * viewport.scaleY,
        };

        const outPt = {
          x: svgPt.x + (handleOut.x / 100) * innerWidth * viewport.scaleX,
          y: svgPt.y - (handleOut.y / 100) * innerHeight * viewport.scaleY,
        };

        const inStats = calculateAngleAndLength(handleIn.x, handleIn.y);
        const outStats = calculateAngleAndLength(handleOut.x, handleOut.y);

        return (
          <g key={`handles-${point.id}`}>
            {/* In Handle Dashed Line */}
            <line
              x1={svgPt.x}
              y1={svgPt.y}
              x2={inPt.x}
              y2={inPt.y}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            {/* In Handle Thumb */}
            <circle
              cx={inPt.x}
              cy={inPt.y}
              r={5.5}
              fill="#f59e0b"
              stroke="#0b1329"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => onHandlePointerDown(e, point.id, 'handleIn')}
            />
            {/* In Handle Angle/Length Badge */}
            <text
              x={inPt.x}
              y={inPt.y - 8}
              fill="#fbbf24"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ∠{inStats.angle.toFixed(0)}° ({inStats.length.toFixed(0)})
            </text>

            {/* Out Handle Dashed Line */}
            <line
              x1={svgPt.x}
              y1={svgPt.y}
              x2={outPt.x}
              y2={outPt.y}
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
            {/* Out Handle Thumb */}
            <circle
              cx={outPt.x}
              cy={outPt.y}
              r={5.5}
              fill="#f59e0b"
              stroke="#0b1329"
              strokeWidth={2}
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => onHandlePointerDown(e, point.id, 'handleOut')}
            />
            {/* Out Handle Angle/Length Badge */}
            <text
              x={outPt.x}
              y={outPt.y - 8}
              fill="#fbbf24"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ∠{outStats.angle.toFixed(0)}° ({outStats.length.toFixed(0)})
            </text>
          </g>
        );
      })}
    </g>
  );
}
