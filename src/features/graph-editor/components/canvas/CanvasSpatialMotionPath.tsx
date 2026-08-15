import React, { useState } from 'react';
import { KeyframePoint } from '../../types';
import {
  buildSpatialPathNodes,
  SpatialPathNode,
  syncSpatialNodesToKeyframes,
} from '../../../../core/spatial/motionPathEngine';

interface CanvasSpatialMotionPathProps {
  xKeyframes: KeyframePoint[];
  yKeyframes: KeyframePoint[];
  currentTime: number;
  width: number;
  height: number;
  onUpdateSpatialKeyframes: (xKeyframes: KeyframePoint[], yKeyframes: KeyframePoint[]) => void;
}

export function CanvasSpatialMotionPath({
  xKeyframes,
  yKeyframes,
  currentTime,
  width,
  height,
  onUpdateSpatialKeyframes,
}: CanvasSpatialMotionPathProps) {
  const nodes = buildSpatialPathNodes(xKeyframes, yKeyframes);
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);

  // Map 0-100% position domain to canvas coordinates
  const posToScreen = (x: number, y: number) => ({
    cx: (x / 100) * (width - 40) + 20,
    cy: (1 - y / 100) * (height - 40) + 20,
  });

  const screenToPos = (sx: number, sy: number) => ({
    x: Math.max(0, Math.min(100, ((sx - 20) / (width - 40)) * 100)),
    y: Math.max(0, Math.min(100, (1 - (sy - 20) / (height - 40)) * 100)),
  });

  // Build SVG path string connecting spatial nodes
  const pathD = nodes.reduce((acc, node, idx) => {
    const pt = posToScreen(node.x, node.y);
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.cx.toFixed(1)} ${pt.cy.toFixed(1)}`;
  }, '');

  const handlePointerDown = (e: React.PointerEvent, nodeId: number) => {
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingNodeId === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = screenToPos(e.clientX - rect.left, e.clientY - rect.top);

    const updatedNodes = nodes.map((n) =>
      n.id === draggingNodeId ? { ...n, x: Math.round(pos.x * 10) / 10, y: Math.round(pos.y * 10) / 10 } : n
    );

    const { xKeyframes: newX, yKeyframes: newY } = syncSpatialNodesToKeyframes(updatedNodes);
    onUpdateSpatialKeyframes(newX, newY);
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        background: '#070b14',
        borderRadius: 10,
        border: '1px solid #1e293b',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 6, left: 8, fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>
        2D SPATIAL MOTION PATH (X vs Y)
      </div>

      <svg
        width={width}
        height={height}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ display: 'block' }}
      >
        {/* Trajectory Stroke */}
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth={2.5} strokeDasharray="4 2" />

        {/* Spatial Keyframe Nodes */}
        {nodes.map((n) => {
          const pt = posToScreen(n.x, n.y);
          const isDragging = n.id === draggingNodeId;

          return (
            <g
              key={n.id}
              onPointerDown={(e) => handlePointerDown(e, n.id)}
              style={{ cursor: 'grab' }}
            >
              <circle
                cx={pt.cx}
                cy={pt.cy}
                r={isDragging ? 7 : 5}
                fill={isDragging ? '#ec4899' : '#0c1222'}
                stroke="#38bdf8"
                strokeWidth={2}
              />
              <text x={pt.cx + 8} y={pt.cy + 3} fill="#94a3b8" fontSize={8} fontWeight={700}>
                {n.time.toFixed(0)}f
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
