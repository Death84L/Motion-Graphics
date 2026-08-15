import React from 'react';
import { GraphViewport, WorkArea } from '../../types';
import { formatTimecode, TimeDisplayFormat } from '../../../../core/timecode/timecodeFormatter';

interface CanvasTimeRulerProps {
  viewport: GraphViewport;
  width: number;
  height: number;
  currentTime: number;
  fps: number;
  timeFormat: TimeDisplayFormat;
  workArea: WorkArea;
  onCurrentTimeChange: (time: number) => void;
  onWorkAreaChange: (workArea: WorkArea) => void;
}

export function CanvasTimeRuler({
  viewport,
  width,
  currentTime,
  fps,
  timeFormat,
  workArea,
  onCurrentTimeChange,
  onWorkAreaChange,
}: CanvasTimeRulerProps) {
  const rulerHeight = 24;
  const timeToX = (t: number) => ((t / 100) * width + viewport.x) * viewport.scaleX;
  const xToTime = (x: number) => Math.max(0, Math.min(100, ((x / viewport.scaleX - viewport.x) / width) * 100));

  const handleRulerClick = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = xToTime(clickX);
    onCurrentTimeChange(Math.round(newTime * 10) / 10);
  };

  // Generate major and minor ticks
  const ticks: { time: number; x: number; isMajor: boolean; label?: string }[] = [];
  const step = viewport.scaleX > 2 ? 5 : 10;

  for (let t = 0; t <= 100; t += step) {
    const x = timeToX(t);
    if (x >= -20 && x <= width + 20) {
      ticks.push({
        time: t,
        x,
        isMajor: t % 20 === 0,
        label: formatTimecode(t, fps, timeFormat),
      });
    }
  }

  const inX = timeToX(workArea.inFrame);
  const outX = timeToX(workArea.outFrame);

  return (
    <g className="canvas-time-ruler" onPointerDown={handleRulerClick} style={{ cursor: 'pointer' }}>
      {/* Background Ruler Bar */}
      <rect x={0} y={0} width={width} height={rulerHeight} fill="#090e1a" stroke="#1e293b" strokeWidth={1} />

      {/* Work Area Region Overlay */}
      {workArea.enabled && (
        <rect
          x={Math.min(inX, outX)}
          y={0}
          width={Math.abs(outX - inX)}
          height={rulerHeight}
          fill="rgba(56, 189, 248, 0.12)"
          stroke="#38bdf8"
          strokeWidth={0.5}
        />
      )}

      {/* Ticks and Timecode Labels */}
      {ticks.map((tick) => (
        <g key={tick.time}>
          <line
            x1={tick.x}
            y1={tick.isMajor ? 12 : 17}
            x2={tick.x}
            y2={rulerHeight}
            stroke={tick.isMajor ? '#475569' : '#1e293b'}
            strokeWidth={1}
          />
          {tick.isMajor && (
            <text
              x={tick.x + 3}
              y={10}
              fill="#94a3b8"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              style={{ userSelect: 'none' }}
            >
              {tick.label}
            </text>
          )}
        </g>
      ))}

      {/* Work Area In/Out Markers */}
      {workArea.enabled && (
        <>
          <g transform={`translate(${inX}, 0)`}>
            <polygon points="0,0 8,0 8,8 0,16" fill="#38bdf8" />
            <text x={3} y={10} fill="#0c1222" fontSize={7} fontWeight={800}>I</text>
          </g>
          <g transform={`translate(${outX - 8}, 0)`}>
            <polygon points="0,0 8,0 8,16 0,8" fill="#38bdf8" />
            <text x={2} y={10} fill="#0c1222" fontSize={7} fontWeight={800}>O</text>
          </g>
        </>
      )}

      {/* Playhead indicator on ruler */}
      <polygon
        points={`${timeToX(currentTime) - 5},0 ${timeToX(currentTime) + 5},0 ${timeToX(currentTime) + 5},14 ${timeToX(currentTime)},22 ${timeToX(currentTime) - 5},14`}
        fill="#ec4899"
      />
    </g>
  );
}
