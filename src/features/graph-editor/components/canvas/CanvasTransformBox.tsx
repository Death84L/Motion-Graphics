import React, { useState } from 'react';
import { KeyframePoint, GraphViewport } from '../../types';

interface CanvasTransformBoxProps {
  selectedKeyframes: KeyframePoint[];
  viewport: GraphViewport;
  width: number;
  height: number;
  onTransformSelection: (transformed: KeyframePoint[]) => void;
}

type HandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move' | 'skew-top' | 'taper-right';

export function CanvasTransformBox({
  selectedKeyframes,
  viewport,
  width,
  height,
  onTransformSelection,
}: CanvasTransformBoxProps) {
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<KeyframePoint[]>([]);

  if (selectedKeyframes.length < 2) return null;

  const times = selectedKeyframes.map((k) => k.time);
  const values = selectedKeyframes.map((k) => k.value);

  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);

  // Coordinate transforms
  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const valToY = (v: number) => height / 2 - ((v - 50) / 100) * height * 0.7 * viewport.scaleY + viewport.y;

  const x1 = Math.min(timeToX(minT), timeToX(maxT)) - 10;
  const x2 = Math.max(timeToX(minT), timeToX(maxT)) + 10;
  const y1 = Math.min(valToY(minV), valToY(maxV)) - 10;
  const y2 = Math.max(valToY(minV), valToY(maxV)) + 10;

  const boxW = Math.max(x2 - x1, 24);
  const boxH = Math.max(y2 - y1, 24);

  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  const handlePointerDown = (e: React.PointerEvent, handle: HandleType) => {
    e.stopPropagation();
    setActiveHandle(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialSnapshot(JSON.parse(JSON.stringify(selectedKeyframes)));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeHandle || !dragStart || initialSnapshot.length === 0) return;

    const dxScreen = e.clientX - dragStart.x;
    const dyScreen = e.clientY - dragStart.y;

    const dt = (dxScreen / (width * viewport.scaleX)) * 100;
    const dv = -(dyScreen / (height * 0.7 * viewport.scaleY)) * 100;

    const isAlt = e.altKey; // scale from center
    const centerT = (minT + maxT) / 2;
    const centerV = (minV + maxV) / 2;
    const spanT = maxT - minT || 1;
    const spanV = maxV - minV || 1;

    const transformed = initialSnapshot.map((k) => {
      let newT = k.time;
      let newV = k.value;

      if (activeHandle === 'move') {
        newT = k.time + dt;
        newV = k.value + dv;
      } else if (activeHandle === 'skew-top') {
        // Skew horizontally proportional to height relative to bottom
        const normY = (k.value - minV) / spanV;
        newT = k.time + dt * normY;
      } else if (activeHandle === 'taper-right') {
        // Taper vertically proportional to time relative to left
        const normX = (k.time - minT) / spanT;
        const scale = 1 + (dv / spanV) * normX;
        newV = centerV + (k.value - centerV) * scale;
      } else if (activeHandle === 'e' || activeHandle === 'w') {
        const scaleX = activeHandle === 'e' ? 1 + dt / spanT : 1 - dt / spanT;
        const origin = isAlt ? centerT : activeHandle === 'e' ? minT : maxT;
        newT = origin + (k.time - origin) * scaleX;
      } else if (activeHandle === 'n' || activeHandle === 's') {
        const scaleY = activeHandle === 'n' ? 1 + dv / spanV : 1 - dv / spanV;
        const origin = isAlt ? centerV : activeHandle === 'n' ? minV : maxV;
        newV = origin + (k.value - origin) * scaleY;
      } else {
        // Corner handles
        const scaleX = activeHandle.includes('e') ? 1 + dt / spanT : 1 - dt / spanT;
        const scaleY = activeHandle.includes('n') ? 1 + dv / spanV : 1 - dv / spanV;
        const originX = isAlt ? centerT : activeHandle.includes('e') ? minT : maxT;
        const originY = isAlt ? centerV : activeHandle.includes('n') ? minV : maxV;

        newT = originX + (k.time - originX) * scaleX;
        newV = originY + (k.value - originY) * scaleY;
      }

      return {
        ...k,
        time: Math.max(0, Math.min(100, Math.round(newT * 10) / 10)),
        value: Math.round(newV * 10) / 10,
      };
    });

    onTransformSelection(transformed);
  };

  const handlePointerUp = () => {
    setActiveHandle(null);
    setDragStart(null);
  };

  const handles: { type: HandleType; x: number; y: number; cursor: string }[] = [
    { type: 'nw', x: x1, y: y1, cursor: 'nwse-resize' },
    { type: 'n', x: cx, y: y1, cursor: 'ns-resize' },
    { type: 'ne', x: x2, y: y1, cursor: 'nesw-resize' },
    { type: 'e', x: x2, y: cy, cursor: 'ew-resize' },
    { type: 'se', x: x2, y: y2, cursor: 'nwse-resize' },
    { type: 's', x: cx, y: y2, cursor: 'ns-resize' },
    { type: 'sw', x: x1, y: y2, cursor: 'nesw-resize' },
    { type: 'w', x: x1, y: cy, cursor: 'ew-resize' },
  ];

  return (
    <g className="canvas-transform-box">
      {/* Bounding box outline */}
      <rect
        x={x1}
        y={y1}
        width={boxW}
        height={boxH}
        fill="rgba(56, 189, 248, 0.04)"
        stroke="#38bdf8"
        strokeWidth={1.2}
        strokeDasharray="4 3"
        style={{ cursor: 'move' }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      {/* Skew & Taper Special Lattice Handles */}
      {/* Top Skew Handle */}
      <circle
        cx={cx}
        cy={y1 - 12}
        r={4.5}
        fill="#f59e0b"
        stroke="#0c1222"
        strokeWidth={1.5}
        style={{ cursor: 'ew-resize' }}
        onPointerDown={(e) => handlePointerDown(e, 'skew-top')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <line
        x1={cx}
        y1={y1}
        x2={cx}
        y2={y1 - 8}
        stroke="#f59e0b"
        strokeWidth={1}
        strokeDasharray="2 2"
      />

      {/* Right Taper Handle */}
      <circle
        cx={x2 + 12}
        cy={cy}
        r={4.5}
        fill="#ec4899"
        stroke="#0c1222"
        strokeWidth={1.5}
        style={{ cursor: 'ns-resize' }}
        onPointerDown={(e) => handlePointerDown(e, 'taper-right')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      <line
        x1={x2}
        y1={cy}
        x2={x2 + 8}
        y2={cy}
        stroke="#ec4899"
        strokeWidth={1}
        strokeDasharray="2 2"
      />

      {/* 8 Transform Handles */}
      {handles.map((h) => (
        <rect
          key={h.type}
          x={h.x - 4.5}
          y={h.y - 4.5}
          width={9}
          height={9}
          fill="#0c1222"
          stroke="#38bdf8"
          strokeWidth={1.5}
          rx={2}
          style={{ cursor: h.cursor }}
          onPointerDown={(e) => handlePointerDown(e, h.type)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      ))}

      {/* Dimension Badge */}
      <g transform={`translate(${cx - 36}, ${y2 + 14})`}>
        <rect
          x={0}
          y={0}
          width={72}
          height={16}
          rx={4}
          fill="#080d1a"
          stroke="#1e293b"
          strokeWidth={1}
        />
        <text
          x={36}
          y={11}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize={9}
          fontWeight={600}
          fontFamily="monospace"
        >
          {(maxT - minT).toFixed(0)}f × {(maxV - minV).toFixed(0)}%
        </text>
      </g>
    </g>
  );
}
