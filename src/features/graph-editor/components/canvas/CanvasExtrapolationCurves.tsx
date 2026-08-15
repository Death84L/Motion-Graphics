import React from 'react';
import { CurveLayer, GraphMode } from '../../types';
import { generateExtrapolatedSvgPath } from '../../../../core/math/extrapolationEngine';

interface CanvasExtrapolationCurvesProps {
  curveLayers: CurveLayer[];
  activeLayerId: string;
  graphMode: GraphMode;
  toSvgPoint: (pt: { time: number; value: number }) => { x: number; y: number };
}

export function CanvasExtrapolationCurves({
  curveLayers,
  activeLayerId,
  graphMode,
  toSvgPoint,
}: CanvasExtrapolationCurvesProps) {
  if (graphMode !== 'value') return null;

  const activeLayer = curveLayers.find((l) => l.id === activeLayerId) || curveLayers[0];
  if (!activeLayer || !activeLayer.keyframes || activeLayer.keyframes.length < 2) return null;

  const preExtrap = activeLayer.preExtrapolation || 'constant';
  const postExtrap = activeLayer.postExtrapolation || 'constant';

  if (preExtrap === 'constant' && postExtrap === 'constant') return null;

  const { prePath, postPath } = generateExtrapolatedSvgPath(
    activeLayer.keyframes,
    toSvgPoint,
    -80,
    180,
    preExtrap,
    postExtrap
  );

  return (
    <g className="canvas-extrapolation-curves" style={{ pointerEvents: 'none' }}>
      {/* Pre-extrapolation wing (before first keyframe) */}
      {prePath && (
        <path
          d={prePath}
          fill="none"
          stroke={activeLayer.color || '#38bdf8'}
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeOpacity={0.45}
        />
      )}

      {/* Post-extrapolation wing (after last keyframe) */}
      {postPath && (
        <path
          d={postPath}
          fill="none"
          stroke={activeLayer.color || '#38bdf8'}
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeOpacity={0.45}
        />
      )}
    </g>
  );
}
