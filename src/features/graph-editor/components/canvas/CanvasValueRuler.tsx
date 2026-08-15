import React from 'react';
import { GraphViewport } from '../../types';
import { formatValueUnit, ValueUnitType } from '../../../../core/timecode/timecodeFormatter';

interface CanvasValueRulerProps {
  viewport: GraphViewport;
  height: number;
  unit: ValueUnitType;
}

export function CanvasValueRuler({ viewport, height, unit }: CanvasValueRulerProps) {
  const rulerWidth = 38;
  const valToY = (v: number) => height / 2 - ((v - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y;

  const values = [-50, -25, 0, 25, 50, 75, 100, 125, 150];

  return (
    <g className="canvas-value-ruler" style={{ pointerEvents: 'none' }}>
      {/* Background Strip */}
      <rect x={0} y={24} width={rulerWidth} height={height - 24} fill="#090e1a" stroke="#1e293b" strokeWidth={1} />

      {/* Value Ticks & Labels */}
      {values.map((v) => {
        const y = valToY(v);
        if (y < 28 || y > height - 10) return null;

        return (
          <g key={v}>
            <line x1={rulerWidth - 6} y1={y} x2={rulerWidth} y2={y} stroke="#475569" strokeWidth={1} />
            <text
              x={rulerWidth - 8}
              y={y + 3}
              fill="#94a3b8"
              fontSize={8}
              fontFamily="JetBrains Mono, monospace"
              textAnchor="end"
              style={{ userSelect: 'none' }}
            >
              {formatValueUnit(v, unit)}
            </text>
          </g>
        );
      })}
    </g>
  );
}
