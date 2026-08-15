import React from 'react';

interface CanvasPlayheadProps {
  playheadX: number;
  paddingTop: number;
  innerHeight: number;
  scaleY: number;
  currentTime: number;
}

export function CanvasPlayhead({
  playheadX,
  paddingTop,
  innerHeight,
  scaleY,
  currentTime,
}: CanvasPlayheadProps) {
  return (
    <g className="canvas-playhead" style={{ cursor: 'ew-resize', userSelect: 'none' }}>
      {/* Vertical Playhead Line */}
      <line
        x1={playheadX}
        y1={paddingTop - 12}
        x2={playheadX}
        y2={paddingTop + innerHeight * scaleY + 12}
        stroke="#ec4899"
        strokeWidth={2.5}
        filter="drop-shadow(0 0 6px rgba(236, 72, 153, 0.8))"
      />

      {/* Top Playhead Triangle Marker */}
      <polygon
        points={`${playheadX - 7},${paddingTop - 14} ${playheadX + 7},${paddingTop - 14} ${playheadX + 7},${paddingTop - 4} ${playheadX},${paddingTop + 3} ${playheadX - 7},${paddingTop - 4}`}
        fill="#ec4899"
      />

      {/* Time Label Above Playhead */}
      <text
        x={playheadX}
        y={paddingTop - 18}
        fill="#ec4899"
        fontSize={10}
        fontFamily="JetBrains Mono, monospace"
        textAnchor="middle"
        fontWeight={700}
      >
        {currentTime.toFixed(1)}f
      </text>
    </g>
  );
}
