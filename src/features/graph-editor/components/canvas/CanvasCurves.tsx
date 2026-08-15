import React from 'react';
import { CurveLayer, GraphMode, KeyframePoint } from '../../types';
import { generateSvgPath } from '../../utils/curveEvaluation';
import { evaluateModeValue } from '../../../../core/derivatives/derivativeEvaluation';
import { CanvasExtrapolationCurves } from './CanvasExtrapolationCurves';

interface CanvasCurvesProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  graphMode: GraphMode;
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
}

export function CanvasCurves({
  curveLayers,
  activeLayerId,
  graphMode,
  toSvgPoint,
}: CanvasCurvesProps) {
  const activeLayer = curveLayers.find((l) => l.id === activeLayerId) || curveLayers[0];
  const isSoloActive = curveLayers.some((l) => l.solo);

  // Generate path for non-value derivative modes (Velocity, Speed, Acceleration)
  const generateDerivativePath = (keyframes: KeyframePoint[], mode: GraphMode) => {
    if (keyframes.length === 0) return '';
    const points: string[] = [];
    const samples = 120;

    for (let s = 0; s <= samples; s++) {
      const time = (s / samples) * 100;
      const val = evaluateModeValue(keyframes, time, mode);
      const pt = toSvgPoint({ time, value: val });
      points.push(`${s === 0 ? 'M' : 'L'} ${pt.x.toFixed(2)} ${pt.y.toFixed(2)}`);
    }
    return points.join(' ');
  };

  return (
    <g className="canvas-curves">
      {/* Background/Secondary Multi-Curve Layers */}
      {curveLayers.map((layer) => {
        if (!layer.visible) return null;
        if (isSoloActive && !layer.solo) return null;
        const isActive = layer.id === activeLayerId;

        // Render Ghost Reference Curve if enabled
        if (isActive && layer.showGhost && layer.ghostKeyframes && layer.ghostKeyframes.length > 0) {
          const ghostPath = generateSvgPath(layer.ghostKeyframes, toSvgPoint);
          return (
            <g key={`ghost-${layer.id}`}>
              <path
                d={ghostPath}
                fill="none"
                stroke="#64748b"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                strokeOpacity={0.5}
              />
            </g>
          );
        }
        return null;
      })}

      {/* Render inactive visible layers */}
      {curveLayers.map((layer) => {
        if (!layer.visible || layer.id === activeLayerId) return null;
        if (isSoloActive && !layer.solo) return null;

        const pathD =
          graphMode === 'value'
            ? generateSvgPath(layer.keyframes, toSvgPoint)
            : generateDerivativePath(layer.keyframes, graphMode);

        return (
          <g key={`sec-${layer.id}`}>
            <path
              d={pathD}
              fill="none"
              stroke={layer.color}
              strokeWidth={2}
              strokeOpacity={0.4}
            />
          </g>
        );
      })}

      {/* Render Active Primary Curve */}
      {activeLayer && (
        <g key={`active-${activeLayer.id}`}>
          {/* Main Spline */}
          <path
            d={
              graphMode === 'value'
                ? generateSvgPath(activeLayer.keyframes, toSvgPoint)
                : generateDerivativePath(activeLayer.keyframes, graphMode)
            }
            fill="none"
            stroke={
              graphMode === 'value'
                ? 'url(#curveGradient)'
                : graphMode === 'velocity'
                ? '#10b981'
                : graphMode === 'speed'
                ? '#f59e0b'
                : graphMode === 'acceleration'
                ? '#ec4899'
                : '#f43f5e'
            }
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glowEffect)"
          />
        </g>
      )}

      {/* Infinite Pre & Post Extrapolation Wings */}
      <CanvasExtrapolationCurves
        curveLayers={curveLayers}
        activeLayerId={activeLayerId}
        graphMode={graphMode}
        toSvgPoint={toSvgPoint}
      />
    </g>
  );
}
