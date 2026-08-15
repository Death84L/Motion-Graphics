import React from 'react';
import { CaptionSegment, CaptionWord } from '../../../core/caption/captionModel';

interface CaptionTimelineProps {
  captions: CaptionSegment[];
  selectedSegmentId: string | null;
  selectedWordId: string | null;
  currentTimeSec: number;
  totalDurationSec: number;
  onSelectSegment: (segmentId: string) => void;
  onSelectWord: (word: CaptionWord) => void;
  onSeek: (timeSec: number) => void;
  onUpdateSegmentTiming: (segmentId: string, startSec: number, endSec: number) => void;
}

export function CaptionTimeline({
  captions,
  selectedSegmentId,
  selectedWordId,
  currentTimeSec,
  totalDurationSec = 8.0,
  onSelectSegment,
  onSelectWord,
  onSeek,
}: CaptionTimelineProps) {
  const selectedSegment = captions.find((c) => c.id === selectedSegmentId) || captions[0];

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * totalDurationSec);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎙️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Caption & Word-Level Timeline
          </span>
        </div>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
          {currentTimeSec.toFixed(2)}s / {totalDurationSec.toFixed(2)}s
        </span>
      </div>

      {/* Main Segment Track */}
      <div
        onClick={handleTrackClick}
        style={{
          height: 48,
          background: '#040711',
          border: '1px solid #1e293b',
          borderRadius: 6,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
      >
        {/* Caption Segment Blocks */}
        {captions.map((c) => {
          const leftPct = (c.startSec / totalDurationSec) * 100;
          const widthPct = ((c.endSec - c.startSec) / totalDurationSec) * 100;
          const isSelected = c.id === selectedSegmentId;

          return (
            <div
              key={c.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSegment(c.id);
              }}
              style={{
                position: 'absolute',
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                top: 4,
                bottom: 4,
                background: isSelected ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)' : 'rgba(30, 41, 59, 0.8)',
                border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
                borderRadius: 4,
                padding: '2px 6px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                fontSize: 9,
                fontWeight: 700,
                color: isSelected ? '#38bdf8' : '#cbd5e1',
                boxShadow: isSelected ? '0 0 10px rgba(56, 189, 248, 0.3)' : undefined,
              }}
            >
              {c.text}
            </div>
          );
        })}

        {/* Playhead Red Needle */}
        <div
          style={{
            position: 'absolute',
            left: `${(currentTimeSec / totalDurationSec) * 100}%`,
            top: 0,
            bottom: 0,
            width: 2,
            background: '#ec4899',
            boxShadow: '0 0 8px #ec4899',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      </div>

      {/* Word-Level Micro Track for Selected Segment */}
      {selectedSegment && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Word-Level Micro Timings ({selectedSegment.words.length} words)
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              background: '#040711',
              padding: 6,
              borderRadius: 6,
              border: '1px solid #1e293b',
            }}
          >
            {selectedSegment.words.map((w) => {
              const isWordSelected = w.id === selectedWordId;
              const isCurrent = currentTimeSec >= w.startSec && currentTimeSec <= w.endSec;

              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWord(w)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: isCurrent
                      ? 'rgba(56, 189, 248, 0.25)'
                      : isWordSelected
                      ? '#1e293b'
                      : '#090e1a',
                    border: `1px solid ${isCurrent ? '#38bdf8' : isWordSelected ? '#64748b' : '#1e293b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: 50,
                  }}
                >
                  <span style={{ fontSize: 10, fontWeight: 800, color: isCurrent ? '#38bdf8' : '#f8fafc' }}>
                    {w.text}
                  </span>
                  <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace' }}>
                    {(w.endSec - w.startSec).toFixed(2)}s
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
