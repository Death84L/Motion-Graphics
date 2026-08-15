import React, { useRef } from 'react';
import { TimelineTrack, TimelineMarker } from '../types/timeline.types';
import { KeyframePoint } from '../../graph-editor/types';

interface MultiTrackTimelineProps {
  tracks: TimelineTrack[];
  currentTime: number;
  totalFrames: number;
  workAreaIn?: number;
  workAreaOut?: number;
  selectedKeyframeIds: string[]; // "trackId:channelId:keyframeId"
  isPlaying: boolean;
  onCurrentTimeChange: (time: number) => void;
  onToggleTrackExpand: (trackId: string) => void;
  onToggleTrackVisibility: (trackId: string) => void;
  onToggleTrackLock: (trackId: string) => void;
  onAddKeyframeAtPlayhead: (trackId: string, channelId: string) => void;
  onSelectKeyframe: (selectionId: string) => void;
}

export function MultiTrackTimeline({
  tracks,
  currentTime,
  totalFrames = 100,
  workAreaIn = 0,
  workAreaOut = 100,
  selectedKeyframeIds,
  isPlaying,
  onCurrentTimeChange,
  onToggleTrackExpand,
  onToggleTrackVisibility,
  onToggleTrackLock,
  onAddKeyframeAtPlayhead,
  onSelectKeyframe,
}: MultiTrackTimelineProps) {
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const norm = Math.max(0, Math.min(1, clickX / rect.width));
    onCurrentTimeChange(Math.round(norm * totalFrames));
  };

  const playheadPercent = (currentTime / totalFrames) * 100;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 240,
        background: '#090e1a',
        borderTop: '1px solid #1e293b',
        userSelect: 'none',
      }}
    >
      {/* Top Ruler & Work-Area Bar */}
      <div style={{ display: 'flex', height: 28, borderBottom: '1px solid #1e293b', background: '#0c1222' }}>
        {/* Left Track Column Header */}
        <div
          style={{
            width: 220,
            borderRight: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 10px',
            fontSize: 10,
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          <span>LAYER TRACKS</span>
          <span>{tracks.length}</span>
        </div>

        {/* Timeline Time Ruler */}
        <div
          ref={rulerRef}
          onClick={handleRulerClick}
          style={{
            flex: 1,
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {/* Work Area Span */}
          <div
            style={{
              position: 'absolute',
              left: `${(workAreaIn / totalFrames) * 100}%`,
              width: `${((workAreaOut - workAreaIn) / totalFrames) * 100}%`,
              top: 0,
              bottom: 0,
              background: 'rgba(56, 189, 248, 0.08)',
              borderLeft: '2px solid #38bdf8',
              borderRight: '2px solid #38bdf8',
            }}
          />

          {/* Timecode tick marks */}
          {[0, 20, 40, 60, 80, 100].map((t) => (
            <div
              key={t}
              style={{
                position: 'absolute',
                left: `${(t / totalFrames) * 100}%`,
                top: 0,
                bottom: 0,
                borderLeft: '1px solid #1e293b',
                paddingLeft: 4,
                fontSize: 9,
                color: '#64748b',
                fontFamily: 'monospace',
              }}
            >
              {t}f
            </div>
          ))}

          {/* Playhead Marker */}
          <div
            style={{
              position: 'absolute',
              left: `${playheadPercent}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: '#ec4899',
              zIndex: 20,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                background: '#ec4899',
                transform: 'translate(-4px, 0) rotate(45deg)',
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tracks Body List */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {tracks.map((track) => (
          <div key={track.id} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #1e293b18' }}>
            {/* Primary Track Row */}
            <div
              style={{
                display: 'flex',
                height: 32,
                background: '#090e1a',
                borderBottom: '1px solid #1e293b44',
              }}
            >
              {/* Track Left Info */}
              <div
                style={{
                  width: 220,
                  borderRight: '1px solid #1e293b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  gap: 6,
                  background: '#0c1222',
                }}
              >
                <button
                  onClick={() => onToggleTrackExpand(track.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: 10,
                    padding: 0,
                  }}
                >
                  {track.expanded ? '▼' : '▶'}
                </button>

                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: track.color,
                  }}
                />

                <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.name}
                </span>

                <button
                  onClick={() => onToggleTrackVisibility(track.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: track.visible ? '#38bdf8' : '#475569',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  title="Toggle Visibility"
                >
                  {track.visible ? '👁' : '✕'}
                </button>

                <button
                  onClick={() => onToggleTrackLock(track.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: track.locked ? '#f59e0b' : '#475569',
                    fontSize: 10,
                    cursor: 'pointer',
                  }}
                  title="Toggle Lock"
                >
                  {track.locked ? '🔒' : '🔓'}
                </button>
              </div>

              {/* Track Keyframes Lane */}
              <div style={{ flex: 1, position: 'relative', background: '#060913', overflow: 'hidden' }}>
                {/* Playhead guideline */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${playheadPercent}%`,
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'rgba(236, 72, 153, 0.4)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Sub-channel Keyframe Nodes Summary */}
                {track.channels.flatMap((ch) =>
                  ch.keyframes.map((k) => {
                    const selId = `${track.id}:${ch.id}:${k.id}`;
                    const isSelected = selectedKeyframeIds.includes(selId);
                    const kfPos = (k.time / totalFrames) * 100;

                    return (
                      <div
                        key={selId}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectKeyframe(selId);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${kfPos}%`,
                          top: '50%',
                          width: 8,
                          height: 8,
                          transform: 'translate(-50%, -50%) rotate(45deg)',
                          background: isSelected ? '#ec4899' : ch.color,
                          borderRadius: 1,
                          cursor: 'pointer',
                          boxShadow: isSelected ? '0 0 8px #ec4899' : 'none',
                          zIndex: 5,
                        }}
                        title={`${ch.name} @ ${k.time}f (${k.value})`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Expandable Sub-Property Channels */}
            {track.expanded &&
              track.channels.map((ch) => (
                <div key={ch.id} style={{ display: 'flex', height: 24, background: '#080d1a', borderBottom: '1px solid #1e293b22' }}>
                  {/* Channel Name */}
                  <div
                    style={{
                      width: 220,
                      borderRight: '1px solid #1e293b',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 24,
                      paddingRight: 8,
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{ch.name}</span>
                    <button
                      onClick={() => onAddKeyframeAtPlayhead(track.id, ch.id)}
                      style={{
                        background: '#11182c',
                        border: '1px solid #1e293b',
                        borderRadius: 3,
                        color: ch.color,
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '1px 4px',
                        cursor: 'pointer',
                      }}
                      title="Add Keyframe at Playhead"
                    >
                      +◇
                    </button>
                  </div>

                  {/* Channel Keyframe Nodes */}
                  <div style={{ flex: 1, position: 'relative', background: '#050811' }}>
                    {ch.keyframes.map((k) => {
                      const selId = `${track.id}:${ch.id}:${k.id}`;
                      const isSelected = selectedKeyframeIds.includes(selId);
                      const kfPos = (k.time / totalFrames) * 100;

                      return (
                        <div
                          key={selId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectKeyframe(selId);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${kfPos}%`,
                            top: '50%',
                            width: 7,
                            height: 7,
                            transform: 'translate(-50%, -50%) rotate(45deg)',
                            background: isSelected ? '#38bdf8' : ch.color,
                            borderRadius: 1,
                            cursor: 'pointer',
                            boxShadow: isSelected ? '0 0 6px #38bdf8' : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
