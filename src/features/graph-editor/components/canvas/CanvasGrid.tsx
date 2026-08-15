import React from 'react';
import { GraphGridConfig, GraphViewport, GraphMode } from '../../types';

interface CanvasGridProps {
  svgWidth: number;
  svgHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  innerWidth: number;
  innerHeight: number;
  viewport: GraphViewport;
  gridConfig: GraphGridConfig;
  graphMode: GraphMode;
  modeBounds: { min: number; max: number };
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
}

export function CanvasGrid({
  paddingLeft,
  paddingTop,
  innerWidth,
  innerHeight,
  viewport,
  gridConfig,
  graphMode,
  modeBounds,
  toSvgPoint,
}: CanvasGridProps) {
  // Generate time ticks dynamically based on zoom level
  const timeStep = viewport.scaleX > 2 ? 5 : viewport.scaleX < 0.7 ? 20 : 10;
  const timeTicks: number[] = [];
  for (let t = 0; t <= 100; t += timeStep) {
    timeTicks.push(t);
  }

  // Generate value ticks based on active graph mode bounds
  const valueStep = graphMode === 'value' ? 25 : Math.max(10, Math.round((modeBounds.max - modeBounds.min) / 5 / 5) * 5);
  const valueTicks: number[] = [];
  for (let v = modeBounds.min; v <= modeBounds.max; v += valueStep) {
    valueTicks.push(v);
  }

  // Unit suffix
  const unitSuffix =
    graphMode === 'value'
      ? '%'
      : graphMode === 'velocity'
      ? '%/s'
      : graphMode === 'speed'
      ? '%/s'
      : '%/s²';

  return (
    <g className="canvas-grid" style={{ pointerEvents: 'none', userSelect: 'none' }}>
      {/* Horizontal Value Grid Lines */}
      {valueTicks.map((val) => {
        const pt = toSvgPoint({ time: 0, value: val });
        const isZero = val === 0;
        const isTarget = graphMode === 'value' && val === gridConfig.targetValue;
        const isFifty = graphMode === 'value' && val === 50;

        let strokeColor = '#172033';
        let strokeWidth = 1;
        let strokeDash: string | undefined = '4 4';

        if (isZero) {
          strokeColor = '#38bdf8';
          strokeWidth = 1.5;
          strokeDash = undefined;
        } else if (isTarget && gridConfig.showTargetLine) {
          strokeColor = '#ec4899';
          strokeWidth = 1.5;
          strokeDash = '6 3';
        } else if (isFifty && gridConfig.showHalfLine) {
          strokeColor = '#334155';
          strokeDash = '2 2';
        }

        return (
          <g key={`v-grid-${val}`}>
            <line
              x1={paddingLeft}
              y1={pt.y}
              x2={paddingLeft + innerWidth * viewport.scaleX}
              y2={pt.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDash}
              strokeOpacity={isZero ? 0.7 : 0.4}
            />
            {/* Value Label */}
            <text
              x={paddingLeft - 10}
              y={pt.y + 4}
              fill={isZero ? '#38bdf8' : isTarget ? '#ec4899' : '#64748b'}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
              fontWeight={isZero || isTarget ? 600 : 400}
            >
              {val}
              {unitSuffix}
            </text>

            {isTarget && gridConfig.showTargetLine && (
              <text
                x={paddingLeft + innerWidth * viewport.scaleX - 10}
                y={pt.y - 6}
                fill="#ec4899"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                textAnchor="end"
                fontWeight={700}
              >
                TARGET (100%)
              </text>
            )}
          </g>
        );
      })}

      {/* Vertical Time Grid Lines */}
      {timeTicks.map((time) => {
        const pt = toSvgPoint({ time, value: modeBounds.min });
        const isEdge = time === 0 || time === 100;
        return (
          <g key={`t-grid-${time}`}>
            <line
              x1={pt.x}
              y1={paddingTop}
              x2={pt.x}
              y2={paddingTop + innerHeight * viewport.scaleY}
              stroke={isEdge ? '#334155' : '#172033'}
              strokeWidth={isEdge ? 1.5 : 1}
              strokeDasharray={isEdge ? undefined : '4 4'}
              strokeOpacity={0.4}
            />
            {/* Frame Label */}
            <text
              x={pt.x}
              y={paddingTop + innerHeight * viewport.scaleY + 20}
              fill={isEdge ? '#94a3b8' : '#64748b'}
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              fontWeight={isEdge ? 600 : 400}
            >
              {time}f
            </text>
          </g>
        );
      })}
    </g>
  );
}
