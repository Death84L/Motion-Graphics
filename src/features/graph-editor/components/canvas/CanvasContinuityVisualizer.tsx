import React from 'react';
import { KeyframePoint, GraphViewport } from '../../types';
import { analyzeCurveContinuity, ContinuityBreak } from '../../../../core/optimizer/continuityAnalyzer';

interface CanvasContinuityVisualizerProps {
  keyframes: KeyframePoint[];
  viewport: GraphViewport;
  width: number;
  height: number;
  enabled: boolean;
}

export function CanvasContinuityVisualizer({
  keyframes,
  viewport,
  width,
  height,
  enabled,
}: CanvasContinuityVisualizerProps) {
  if (!enabled || keyframes.length < 2) return null;

  const { breaks } = analyzeCurveContinuity(keyframes, 80);

  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;

  return (
    <g className="canvas-continuity-visualizer" style={{ pointerEvents: 'none' }}>
      {breaks.map((b, idx) => {
        const x = timeToX(b.time);

        return (
          <g key={idx}>
            {/* Vertical discontinuity marker line */}
            <line
              x1={x}
              y1={24}
              x2={x}
              y2={height}
              stroke={b.order === 'C1' ? '#f43f5e' : '#f59e0b'}
              strokeWidth={1}
              strokeDasharray="3 3"
            />

            {/* Tag Badge */}
            <rect
              x={x - 18}
              y={height - 22}
              width={36}
              height={14}
              rx={3}
              fill="#090e1a"
              stroke={b.order === 'C1' ? '#f43f5e' : '#f59e0b'}
              strokeWidth={0.8}
            />
            <text
              x={x}
              y={height - 12}
              fill={b.order === 'C1' ? '#f43f5e' : '#f59e0b'}
              fontSize={8}
              fontWeight={800}
              textAnchor="middle"
            >
              {b.order} BREAK
            </text>
          </g>
        );
      })}
    </g>
  );
}
