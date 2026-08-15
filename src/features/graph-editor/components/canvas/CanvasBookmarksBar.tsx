import React from 'react';
import { GraphViewport } from '../../types';
import { GraphBookmark, GraphRegion } from '../../../../core/bookmarks/bookmarkManager';
import { BeatMarker } from '../../../../core/bookmarks/beatDetector';

interface CanvasBookmarksBarProps {
  viewport: GraphViewport;
  width: number;
  bookmarks: GraphBookmark[];
  regions: GraphRegion[];
  beats?: BeatMarker[];
  onSelectTime: (time: number) => void;
}

export function CanvasBookmarksBar({
  viewport,
  width,
  bookmarks,
  regions,
  beats,
  onSelectTime,
}: CanvasBookmarksBarProps) {
  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;

  return (
    <g className="canvas-bookmarks-bar" style={{ userSelect: 'none' }}>
      {/* 1. Labeled Regions */}
      {regions.map((reg) => {
        const x1 = timeToX(reg.startFrame);
        const x2 = timeToX(reg.endFrame);
        const w = Math.max(x2 - x1, 10);

        return (
          <g key={reg.id} onClick={() => onSelectTime(reg.startFrame)} style={{ cursor: 'pointer' }}>
            <rect
              x={x1}
              y={24}
              width={w}
              height={14}
              fill={`${reg.color}22`}
              stroke={reg.color}
              strokeWidth={0.8}
            />
            <text
              x={x1 + w / 2}
              y={34}
              fill={reg.color}
              fontSize={7.5}
              fontWeight={800}
              textAnchor="middle"
            >
              {reg.name}
            </text>
          </g>
        );
      })}

      {/* 2. Musical Beat Ticks */}
      {beats &&
        beats.map((b) => {
          const x = timeToX(b.frame);
          return (
            <line
              key={b.id}
              x1={x}
              y1={24}
              x2={x}
              y2={38}
              stroke={b.isDownbeat ? '#ec4899' : '#334155'}
              strokeWidth={b.isDownbeat ? 1.5 : 0.8}
            />
          );
        })}

      {/* 3. Bookmarks */}
      {bookmarks.map((bm) => {
        const x = timeToX(bm.time);
        return (
          <g
            key={bm.id}
            onClick={() => onSelectTime(bm.time)}
            style={{ cursor: 'pointer' }}
          >
            <title>{`Jump to ${bm.name} (${bm.time}f)`}</title>
            <polygon points={`${x - 4},0 ${x + 4},0 ${x + 4},10 ${x},14 ${x - 4},10`} fill={bm.color} />
            <text x={x} y={8} fill="#090e1a" fontSize={6.5} fontWeight={900} textAnchor="middle">
              ★
            </text>
          </g>
        );
      })}
    </g>
  );
}
