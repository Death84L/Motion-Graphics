import React, { useRef } from 'react';
import type { KeyframePoint } from '../types';

type TimelineScrubberProps = {
  currentTime: number; // 0 to 100
  keyframes: KeyframePoint[];
  selectedKeyframeIds: number[];
  onCurrentTimeChange: (time: number) => void;
  onSelectKeyframe: (id: number) => void;
};

export function TimelineScrubber({
  currentTime,
  keyframes,
  selectedKeyframeIds,
  onCurrentTimeChange,
  onSelectKeyframe,
}: TimelineScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const calculateTime = (clientX: number) => {
      const ratio = (clientX - rect.left) / rect.width;
      return Math.max(0, Math.min(100, ratio * 100));
    };

    onCurrentTimeChange(calculateTime(e.clientX));

    const onPointerMove = (moveEvent: PointerEvent) => {
      onCurrentTimeChange(calculateTime(moveEvent.clientX));
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 12,
        padding: '8px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 64 }}>
        Timeline
      </div>

      {/* Scrub Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'relative',
          flex: 1,
          height: 28,
          background: '#080d1a',
          borderRadius: 8,
          border: '1px solid #1e293b',
          cursor: 'ew-resize',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Progress Fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${currentTime}%`,
            background: 'linear-gradient(90deg, rgba(56,189,248,0.1) 0%, rgba(236,72,153,0.2) 100%)',
            borderRight: '2px solid #ec4899',
            pointerEvents: 'none',
          }}
        />

        {/* Frame markers */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${i * 10}%`,
              top: 0,
              bottom: 0,
              width: 1,
              background: i % 2 === 0 ? '#1e293b' : '#11182c',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Keyframe markers on timeline */}
        {keyframes.map((kf) => {
          const isSelected = selectedKeyframeIds.includes(kf.id);
          return (
            <div
              key={kf.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectKeyframe(kf.id);
                onCurrentTimeChange(kf.time);
              }}
              style={{
                position: 'absolute',
                left: `${kf.time}%`,
                transform: 'translateX(-50%) rotate(45deg)',
                width: 10,
                height: 10,
                background: isSelected ? '#fbbf24' : '#38bdf8',
                border: '1px solid #080d1a',
                borderRadius: 2,
                cursor: 'pointer',
                zIndex: 2,
                boxShadow: isSelected ? '0 0 6px #fbbf24' : 'none',
              }}
              title={`Keyframe at ${kf.time}f (Value: ${kf.value}%)`}
            />
          );
        })}

        {/* Playhead thumb */}
        <div
          style={{
            position: 'absolute',
            left: `${currentTime}%`,
            transform: 'translateX(-50%)',
            width: 14,
            height: 18,
            background: '#ec4899',
            borderRadius: 4,
            boxShadow: '0 0 10px rgba(236, 72, 153, 0.8)',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        />
      </div>

      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: '#f1f5f9',
          fontWeight: 600,
          width: 70,
          textAlign: 'right',
        }}
      >
        {currentTime.toFixed(0)} / 100f
      </div>
    </div>
  );
}
