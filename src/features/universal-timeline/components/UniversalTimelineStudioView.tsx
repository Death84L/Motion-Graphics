import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  UniversalComposition,
  UniversalTrack,
  UniversalPropertyLane,
  UniversalKeyframe,
  INITIAL_UNIVERSAL_COMPOSITION,
} from '../../../core/timeline/universalTimelineSchema';
import { TimelineEngine, TimelineToolMode } from '../../../core/timeline/timelineEngine';
import { AudioTimelineEngine } from '../../../core/timeline/audioTimelineEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface UniversalTimelineStudioViewProps {
  onSyncWithGraphEditor?: (keyframes: KeyframePoint[], trackName: string) => void;
}

export function UniversalTimelineStudioView({ onSyncWithGraphEditor }: UniversalTimelineStudioViewProps) {
  const [comp, setComp] = useState<UniversalComposition>(INITIAL_UNIVERSAL_COMPOSITION);
  const [playheadFrame, setPlayheadFrame] = useState<number>(35);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(comp.tracks[0]?.id || '');
  const [selectedLaneId, setSelectedLaneId] = useState<string | null>(comp.tracks[0]?.propertyLanes[0]?.id || null);
  const [activeTool, setActiveTool] = useState<TimelineToolMode>('select');
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Master Comp']);

  const timelineCanvasRef = useRef<HTMLDivElement>(null);

  // Playback Timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlayheadFrame((prev) => {
        const workOut = comp.regions.find((r) => r.type === 'work-area')?.outFrame || comp.durationFrames;
        const workIn = comp.regions.find((r) => r.type === 'work-area')?.inFrame || 0;
        return prev >= workOut ? workIn : prev + 1;
      });
    }, 1000 / comp.fps);
    return () => clearInterval(interval);
  }, [isPlaying, comp]);

  // Audio Waveform Buffer
  const audioWaveform = useMemo(() => {
    return AudioTimelineEngine.generateWaveformBuffer(comp.durationFrames, 120, comp.fps);
  }, [comp.durationFrames, comp.fps]);

  // Selected Track
  const activeTrack = useMemo(() => {
    return comp.tracks.find((t) => t.id === selectedTrackId) || comp.tracks[0];
  }, [comp.tracks, selectedTrackId]);

  // Handle Playhead Scrubbing with Snapping
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineCanvasRef.current) return;
    const rect = timelineCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const rawFrame = Math.max(0, Math.min(comp.durationFrames, Math.round((clickX / (rect.width * zoomLevel)) * comp.durationFrames)));

    if (isSnappingEnabled) {
      const snap = TimelineEngine.findSnapTarget(rawFrame, comp, playheadFrame, 4);
      setPlayheadFrame(snap ? snap.frame : rawFrame);
    } else {
      setPlayheadFrame(rawFrame);
    }
  };

  // NLE Edit: Ripple Trim
  const handleRippleTrim = (trackId: string, delta: number) => {
    const updated = TimelineEngine.rippleTrimTrack(comp, trackId, delta);
    setComp(updated);
  };

  // NLE Edit: Split Track at Playhead
  const handleSplitTrack = (trackId: string) => {
    const updated = TimelineEngine.splitTrackAtFrame(comp, trackId, playheadFrame);
    setComp(updated);
  };

  // Beat Sync: Snap Keyframes to 120 BPM
  const handleSyncToBeat = () => {
    setComp((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => ({
        ...t,
        propertyLanes: t.propertyLanes.map((lane) => ({
          ...lane,
          keyframes: AudioTimelineEngine.snapKeyframesToNearestBeats(lane.keyframes, 120, prev.fps),
        })),
      })),
    }));
  };

  // Sync to Graph Editor
  const handleSelectLane = (lane: UniversalPropertyLane, track: UniversalTrack) => {
    setSelectedLaneId(lane.id);
    if (onSyncWithGraphEditor) {
      const graphKeys: KeyframePoint[] = lane.keyframes.map((k, idx) => ({
        id: idx + 1,
        time: k.frame,
        value: k.value,
        type: k.interpolation === 'bezier' ? 'bezier' : 'linear',
        handleIn: k.handleIn,
        handleOut: k.handleOut,
      }));
      onSyncWithGraphEditor(graphKeys, `${track.name} • ${lane.displayName}`);
    }
  };

  const timecodeSec = (playheadFrame / comp.fps).toFixed(2);
  const timecodeFrames = String(playheadFrame % comp.fps).padStart(2, '0');
  const timecodeSecStr = String(Math.floor(playheadFrame / comp.fps)).padStart(2, '0');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. TOP TOOLBAR & CONTROLS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          background: '#090e1a',
          borderBottom: '1px solid #1e293b',
          gap: 12,
        }}
      >
        {/* Left: Breadcrumbs & Timecode Readout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
            {breadcrumb.map((bc, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: '#64748b' }}>/</span>}
                <span style={{ color: idx === breadcrumb.length - 1 ? '#38bdf8' : '#94a3b8', cursor: 'pointer' }}>
                  {bc}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 800,
              color: '#38bdf8',
              background: '#040711',
              padding: '3px 8px',
              borderRadius: 4,
              border: '1px solid #1e293b',
            }}
          >
            00:00:{timecodeSecStr}:{timecodeFrames} ({playheadFrame}f)
          </div>
        </div>

        {/* Center: NLE Tool Palette */}
        <div style={{ display: 'flex', gap: 3, background: '#11182c', padding: 2, borderRadius: 6 }}>
          {[
            { id: 'select', label: 'Select (V)', icon: '↖' },
            { id: 'split', label: 'Split (C)', icon: '✂' },
            { id: 'ripple', label: 'Ripple (B)', icon: '⇥' },
            { id: 'slip', label: 'Slip (Y)', icon: '⇄' },
            { id: 'slide', label: 'Slide (U)', icon: '⇆' },
            { id: 'stretch', label: 'Stretch (R)', icon: '⏱' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as TimelineToolMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 10,
                fontWeight: activeTool === tool.id ? 800 : 500,
                background: activeTool === tool.id ? '#38bdf8' : 'transparent',
                color: activeTool === tool.id ? '#080d1a' : '#94a3b8',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
              title={tool.label}
            >
              <span>{tool.icon}</span>
              <span>{tool.id}</span>
            </button>
          ))}
        </div>

        {/* Right: Playback, Snap & Beat Grid */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setIsSnappingEnabled((s) => !s)}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              background: isSnappingEnabled ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
              border: `1px solid ${isSnappingEnabled ? '#38bdf8' : '#1e293b'}`,
              color: isSnappingEnabled ? '#38bdf8' : '#64748b',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            🧲 Snap: {isSnappingEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleSyncToBeat}
            style={{
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 700,
              background: '#11182c',
              border: '1px solid #ec4899',
              color: '#ec4899',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            🎵 Sync to 120 BPM
          </button>

          <button
            onClick={() => setIsPlaying((p) => !p)}
            style={{
              padding: '4px 14px',
              fontSize: 11,
              fontWeight: 900,
              background: isPlaying ? '#ef4444' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 5,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* 2. CENTER STAGE & INSPECTOR (MULTI-VIEW) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: '240px', borderBottom: '1px solid #1e293b' }}>
        {/* Left: Viewport Stage */}
        <div
          style={{
            background: '#060913',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 16:9 Canvas Bounds */}
          <div
            style={{
              width: '380px',
              height: '214px',
              background: '#090e1a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            }}
          >
            {/* Render Simulated Animated Elements */}
            <div
              style={{
                transform: `scale(${TimelineEngine.evaluateTrackPropertyAtFrame(comp.tracks[0], 'scale', playheadFrame, comp) / 100}) translateY(${TimelineEngine.evaluateTrackPropertyAtFrame(comp.tracks[0], 'position.y', playheadFrame, comp)}px)`,
                opacity: TimelineEngine.evaluateTrackPropertyAtFrame(comp.tracks[0], 'opacity', playheadFrame, comp),
                color: '#38bdf8',
                fontWeight: 900,
                fontSize: 16,
                letterSpacing: -0.5,
                transition: isPlaying ? 'none' : 'transform 0.05s ease',
              }}
            >
              Motion Studio
            </div>

            {/* Frame Badge */}
            <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 9, color: '#64748b', fontFamily: 'monospace' }}>
              F: {playheadFrame} / {comp.durationFrames}
            </div>
          </div>
        </div>

        {/* Right: Property & Controller Inspector */}
        <div
          style={{
            background: '#090e1a',
            borderLeft: '1px solid #1e293b',
            padding: 12,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc' }}>
              Track Inspector: <span style={{ color: activeTrack?.color }}>{activeTrack?.name}</span>
            </span>
          </div>

          {/* Parenting Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>PARENT TRANSFORM:</span>
            <select
              value={activeTrack?.parentId || ''}
              onChange={(e) => {
                const parentId = e.target.value || undefined;
                setComp((prev) => ({
                  ...prev,
                  tracks: prev.tracks.map((t) => (t.id === selectedTrackId ? { ...t, parentId } : t)),
                }));
              }}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                borderRadius: 4,
                padding: '4px 6px',
                fontSize: 10,
              }}
            >
              <option value="">None (Root Coordinate Space)</option>
              {comp.tracks
                .filter((t) => t.id !== selectedTrackId)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    @{t.name} ({t.type})
                  </option>
                ))}
            </select>
          </div>

          {/* Animated Property Channels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>ANIMATED PROPERTIES:</span>
            {activeTrack?.propertyLanes.map((lane) => (
              <div
                key={lane.id}
                onClick={() => handleSelectLane(lane, activeTrack)}
                style={{
                  background: selectedLaneId === lane.id ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${selectedLaneId === lane.id ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{lane.displayName}</div>
                  <div style={{ fontSize: 8, color: '#64748b' }}>{lane.keyframes.length} keyframes</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8' }}>
                  {TimelineEngine.evaluateTrackPropertyAtFrame(activeTrack, lane.propertyName, playheadFrame, comp).toFixed(1)}{lane.unit || ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MULTI-TRACK UNIVERSAL TIMELINE */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Track Headers Column */}
        <div style={{ background: '#090e1a', borderRight: '1px solid #1e293b', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Header Row */}
          <div style={{ height: 26, background: '#11182c', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: 9, fontWeight: 700, color: '#64748b' }}>
            TRACKS ({comp.tracks.length})
          </div>

          {/* Track Header Rows */}
          {comp.tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              style={{
                height: track.isExpanded ? 110 : 38,
                background: selectedTrackId === track.id ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                borderBottom: '1px solid #1e293b',
                padding: '6px 8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 4, height: 16, background: track.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc' }}>{track.name}</span>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setComp((prev) => ({
                        ...prev,
                        tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, visible: !t.visible } : t)),
                      }));
                    }}
                    style={{ background: 'transparent', border: 'none', color: track.visible ? '#38bdf8' : '#64748b', fontSize: 10, cursor: 'pointer' }}
                  >
                    👁
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setComp((prev) => ({
                        ...prev,
                        tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, locked: !t.locked } : t)),
                      }));
                    }}
                    style={{ background: 'transparent', border: 'none', color: track.locked ? '#f59e0b' : '#64748b', fontSize: 10, cursor: 'pointer' }}
                  >
                    🔒
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setComp((prev) => ({
                        ...prev,
                        tracks: prev.tracks.map((t) => (t.id === track.id ? { ...t, isExpanded: !t.isExpanded } : t)),
                      }));
                    }}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 9, cursor: 'pointer' }}
                  >
                    {track.isExpanded ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Sub-Property Lanes List when expanded */}
              {track.isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4, paddingLeft: 10 }}>
                  {track.propertyLanes.map((lane) => (
                    <div key={lane.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: lane.id === selectedLaneId ? '#38bdf8' : '#64748b' }}>
                      <span>↳ {lane.displayName}</span>
                      <span>{lane.keyframes.length}k</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Timeline Tracks Canvas & Global Time Ruler */}
        <div
          ref={timelineCanvasRef}
          onClick={handleTimelineClick}
          style={{
            position: 'relative',
            background: '#040711',
            overflowX: 'auto',
            overflowY: 'auto',
          }}
        >
          {/* 1. Global Time Ruler */}
          <div style={{ height: 26, background: '#090e1a', borderBottom: '1px solid #1e293b', position: 'relative', display: 'flex', alignItems: 'center' }}>
            {Array.from({ length: Math.ceil(comp.durationFrames / 15) }).map((_, i) => {
              const frame = i * 15;
              const leftPercent = (frame / comp.durationFrames) * 100;
              return (
                <div key={frame} style={{ position: 'absolute', left: `${leftPercent}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace' }}>{frame}f</span>
                  <div style={{ width: 1, height: 4, background: '#334155', marginTop: 1 }} />
                </div>
              );
            })}

            {/* Markers */}
            {comp.markers.map((m) => (
              <div
                key={m.id}
                style={{
                  position: 'absolute',
                  left: `${(m.frame / comp.durationFrames) * 100}%`,
                  top: 0,
                  transform: 'translateX(-50%)',
                  background: m.color,
                  color: '#080d1a',
                  fontSize: 7,
                  fontWeight: 900,
                  padding: '1px 3px',
                  borderRadius: 2,
                  zIndex: 10,
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* 2. Track Lanes Canvas */}
          {comp.tracks.map((track) => {
            const isAudio = track.type === 'audio';
            const trackWidthPercent = ((track.outFrame - track.inFrame) / comp.durationFrames) * 100;
            const trackLeftPercent = (track.inFrame / comp.durationFrames) * 100;

            return (
              <div
                key={track.id}
                style={{
                  height: track.isExpanded ? 110 : 38,
                  borderBottom: '1px solid #1e293b',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {/* Track Block */}
                <div
                  style={{
                    position: 'absolute',
                    left: `${trackLeftPercent}%`,
                    width: `${trackWidthPercent}%`,
                    height: 26,
                    background: isAudio ? 'rgba(16, 185, 129, 0.15)' : `${track.color}22`,
                    border: `1px solid ${track.color}`,
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 6px',
                    zIndex: 2,
                  }}
                >
                  {/* If Audio: Render Waveform bars */}
                  {isAudio && (
                    <div style={{ width: '100%', height: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                      {audioWaveform.slice(0, 100).map((amp, idx) => (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            height: `${amp * 100}%`,
                            background: '#10b981',
                            borderRadius: 1,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {!isAudio && <span style={{ fontSize: 9, fontWeight: 700, color: track.color }}>{track.name}</span>}
                </div>

                {/* Keyframe Diamonds Overlay */}
                {track.propertyLanes.flatMap((lane) =>
                  lane.keyframes.map((k) => (
                    <div
                      key={k.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlayheadFrame(k.frame);
                      }}
                      style={{
                        position: 'absolute',
                        left: `${(k.frame / comp.durationFrames) * 100}%`,
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        width: 9,
                        height: 9,
                        background: '#38bdf8',
                        border: '1.5px solid #ffffff',
                        zIndex: 4,
                        cursor: 'pointer',
                        boxShadow: '0 0 6px rgba(56, 189, 248, 0.8)',
                      }}
                      title={`${lane.displayName}: ${k.value} at ${k.frame}f`}
                    />
                  ))
                )}
              </div>
            );
          })}

          {/* 3. Live Scrubbing Playhead Line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `${(playheadFrame / comp.durationFrames) * 100}%`,
              width: 1.5,
              background: '#ef4444',
              zIndex: 20,
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 10,
                height: 10,
                background: '#ef4444',
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
