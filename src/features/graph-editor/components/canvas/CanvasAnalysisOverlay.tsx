import React from 'react';
import { KeyframePoint, GraphViewport } from '../../types';
import { runCurveDiagnostics, CurveDiagnosticIssue } from '../../../../core/analysis/curveAnalysisOverlay';

interface CanvasAnalysisOverlayProps {
  keyframes: KeyframePoint[];
  viewport: GraphViewport;
  width: number;
  height: number;
  enabled: boolean;
}

export function CanvasAnalysisOverlay({
  keyframes,
  viewport,
  width,
  height,
  enabled,
}: CanvasAnalysisOverlayProps) {
  if (!enabled || keyframes.length < 2) return null;

  const diagnostics: CurveDiagnosticIssue[] = runCurveDiagnostics(keyframes, 100);

  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const valToY = (v: number) => height / 2 - ((v - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y;

  return (
    <g className="canvas-analysis-overlay" style={{ pointerEvents: 'none' }}>
      {diagnostics.map((diag) => {
        const x = timeToX(diag.time);
        const y = valToY(diag.value);

        return (
          <g key={diag.id}>
            {/* Pulsing Alert Ring */}
            <circle cx={x} cy={y} r={7} fill="none" stroke={diag.color} strokeWidth={1.5} strokeDasharray="3 2" />
            <circle cx={x} cy={y} r={2} fill={diag.color} />

            {/* Diagnostic Tag */}
            <rect
              x={x - 28}
              y={y - 20}
              width={56}
              height={14}
              rx={3}
              fill="rgba(10, 15, 29, 0.95)"
              stroke={diag.color}
              strokeWidth={0.8}
            />
            <text
              x={x}
              y={y - 10}
              fill={diag.color}
              fontSize={7.5}
              fontWeight={800}
              textAnchor="middle"
            >
              {diag.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
