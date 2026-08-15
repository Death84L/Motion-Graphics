import React from 'react';
import { CurveLayer, GraphViewport } from '../../types';
import { findCurveIntersections, CurveIntersection } from '../../../../core/math/curveIntersection';

interface CanvasIntersectionsProps {
  curveLayers: CurveLayer[];
  viewport: GraphViewport;
  width: number;
  height: number;
}

export function CanvasIntersections({
  curveLayers,
  viewport,
  width,
  height,
}: CanvasIntersectionsProps) {
  const visibleLayers = curveLayers.filter((l) => l.visible);
  if (visibleLayers.length < 2) return null;

  const intersections: CurveIntersection[] = [];
  for (let i = 0; i < visibleLayers.length; i++) {
    for (let j = i + 1; j < visibleLayers.length; j++) {
      const found = findCurveIntersections(visibleLayers[i], visibleLayers[j]);
      intersections.push(...found);
    }
  }

  if (intersections.length === 0) return null;

  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const valToY = (v: number) => height / 2 - ((v - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y;

  return (
    <g className="canvas-intersections">
      {intersections.map((inter) => {
        const x = timeToX(inter.time);
        const y = valToY(inter.value);

        return (
          <g key={inter.id} style={{ pointerEvents: 'none' }}>
            {/* Pulsing Intersection Target */}
            <circle cx={x} cy={y} r={6} fill="none" stroke="#f43f5e" strokeWidth={1} strokeDasharray="2 2" />
            <line x1={x - 4} y1={y - 4} x2={x + 4} y2={y + 4} stroke="#f43f5e" strokeWidth={1.5} />
            <line x1={x + 4} y1={y - 4} x2={x - 4} y2={y + 4} stroke="#f43f5e" strokeWidth={1.5} />
          </g>
        );
      })}
    </g>
  );
}
