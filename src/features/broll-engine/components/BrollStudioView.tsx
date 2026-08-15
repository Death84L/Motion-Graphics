import React, { useState, useEffect, useMemo } from 'react';
import {
  BrollClip,
  BrollCategory,
  SAMPLE_BROLL_LIBRARY,
  KenBurnsDirection,
  BrollTransitionType,
  StoryboardScene,
} from '../../../core/broll/brollSchema';
import { BrollEngine } from '../../../core/broll/brollEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface BrollStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function BrollStudioView({ onBakeKeyframesToEditor }: BrollStudioViewProps) {
  const [libraryClips, setLibraryClips] = useState<BrollClip[]>(SAMPLE_BROLL_LIBRARY);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeClipId, setActiveClipId] = useState<string>(SAMPLE_BROLL_LIBRARY[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [storyboard, setStoryboard] = useState<StoryboardScene>(() =>
    BrollEngine.autoSequenceToBeat(SAMPLE_BROLL_LIBRARY, 128, 4, 12.0)
  );
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // Active Selected Clip
  const activeClip = useMemo(() => {
    return libraryClips.find((c) => c.id === activeClipId) || libraryClips[0];
  }, [libraryClips, activeClipId]);

  // Filtered Library Clips
  const filteredClips = useMemo(() => {
    return libraryClips.filter((c) => {
      const matchCat = selectedCategory === 'All' || c.category === selectedCategory;
      const matchSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [libraryClips, selectedCategory, searchQuery]);

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => (prev + 0.02) % (storyboard.totalDurationSec || 12.0));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, storyboard.totalDurationSec]);

  // Compute Current Ken Burns Transform for Active Clip
  const clipProgress = (currentTimeSec % (activeClip.durationSec || 3.0)) / (activeClip.durationSec || 3.0);
  const currentTransform = useMemo(() => {
    return BrollEngine.evaluateKenBurns(activeClip.kenBurns, clipProgress);
  }, [activeClip.kenBurns, clipProgress]);

  // Auto-Sequence Action
  const handleAutoSequence = () => {
    const newSeq = BrollEngine.autoSequenceToBeat(libraryClips, 128, 4, 12.0);
    setStoryboard(newSeq);
  };

  // 1-Click Bake Action
  const handleBakeMotion = () => {
    const baked = BrollEngine.bakeKenBurnsToKeyframes(activeClip, 'scale', 60);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `B-Roll Motion • ${activeClip.name}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '290px 1fr 330px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: B-ROLL MEDIA BROWSER & LIBRARY */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎬</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            B-Roll Media Library
          </span>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search B-roll by name, tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#f8fafc',
            padding: '6px 10px',
            fontSize: 10,
          }}
        />

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['All', 'Cinematic', 'Technology', 'UI', 'Nature', 'Abstract'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#38bdf8' : '#11182c',
                color: selectedCategory === cat ? '#040711' : '#94a3b8',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Clip List Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {filteredClips.map((clip) => {
            const isSelected = activeClip.id === clip.id;
            return (
              <div
                key={clip.id}
                onClick={() => setActiveClipId(clip.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 8,
                  padding: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    width: 48,
                    height: 36,
                    borderRadius: 4,
                    background: clip.thumbnailColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    color: '#ffffff',
                    flexShrink: 0,
                  }}
                >
                  {clip.orientation === 'portrait' ? '9:16' : '16:9'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {clip.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8' }}>
                    <span>{clip.durationSec.toFixed(1)}s • {clip.category}</span>
                    <span style={{ color: '#f59e0b' }}>★ {clip.rating}.0</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE VIDEO PREVIEW & STORYBOARD */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        {/* Top Control Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#090e1a', padding: '8px 12px', borderRadius: 8, border: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setIsPlaying((p) => !p)}
              style={{
                background: isPlaying ? '#ef4444' : '#10b981',
                color: '#ffffff',
                border: 'none',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8' }}>
              {currentTimeSec.toFixed(2)}s / {storyboard.totalDurationSec.toFixed(2)}s
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleAutoSequence}
              style={{
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                padding: '5px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎵 Auto-Sequence (128 BPM)
            </button>
            <button
              onClick={handleBakeMotion}
              style={{
                background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
                color: '#ffffff',
                border: 'none',
                padding: '6px 14px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
            </button>
          </div>
        </div>

        {/* Live Canvas Preview with Ken Burns Framing */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '320px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: activeClip.orientation === 'portrait' ? 180 : 360,
              height: activeClip.orientation === 'portrait' ? 320 : 202,
              borderRadius: 8,
              background: `radial-gradient(circle, ${activeClip.colorLabel}44, ${activeClip.thumbnailColor})`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${currentTransform.scale}) translate(${currentTransform.panX}px, ${currentTransform.panY}px)`,
              transition: 'transform 0.05s linear',
              boxShadow: '0 0 24px rgba(0,0,0,0.6)',
              border: `2px solid ${activeClip.colorLabel}`,
            }}
          >
            <span style={{ fontSize: 24 }}>🎬</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', marginTop: 6, textAlign: 'center', padding: '0 8px' }}>
              {activeClip.name}
            </span>
            <span style={{ fontSize: 9, color: '#e2e8f0', marginTop: 2 }}>
              Ken Burns: {activeClip.kenBurns.direction.toUpperCase()} ({currentTransform.scale.toFixed(2)}×)
            </span>
          </div>
        </div>

        {/* Storyboard Strip */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Storyboard Montage Sequence ({storyboard.clips.length} Shots)
          </span>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {storyboard.clips.map((sc, idx) => (
              <div
                key={sc.id}
                style={{
                  background: '#11182c',
                  border: `1px solid ${sc.colorLabel}`,
                  borderRadius: 6,
                  padding: '6px 8px',
                  minWidth: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <div style={{ fontSize: 8, color: '#94a3b8' }}>Shot 0{idx + 1}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sc.name.split('.')[0]}
                </div>
                <div style={{ fontSize: 8, color: sc.colorLabel }}>{sc.durationSec.toFixed(1)}s • {sc.transitionOut}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: CLIP INSPECTOR & MOTION CONTROLS */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Clip Motion & Ken Burns
        </div>

        {/* Ken Burns Direction Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>KEN BURNS DIRECTION:</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            {(['zoom-in', 'zoom-out', 'pan-left', 'pan-right', 'diagonal-up-left', 'static'] as KenBurnsDirection[]).map((dir) => {
              const isSel = activeClip.kenBurns.direction === dir;
              return (
                <button
                  key={dir}
                  onClick={() => {
                    setLibraryClips((prev) =>
                      prev.map((c) =>
                        c.id === activeClip.id ? { ...c, kenBurns: { ...c.kenBurns, direction: dir } } : c
                      )
                    );
                  }}
                  style={{
                    background: isSel ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                    border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                    color: isSel ? '#38bdf8' : '#cbd5e1',
                    borderRadius: 4,
                    padding: '4px 6px',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {dir.replace('-', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Zoom Start / End Sliders */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Zoom End Scale:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{activeClip.kenBurns.zoomEnd.toFixed(2)}×</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="1.5"
            step="0.05"
            value={activeClip.kenBurns.zoomEnd}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setLibraryClips((prev) =>
                prev.map((c) =>
                  c.id === activeClip.id ? { ...c, kenBurns: { ...c.kenBurns, zoomEnd: val } } : c
                )
              );
            }}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>

        {/* Transition Out Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>TRANSITION OUT:</span>
          <select
            value={activeClip.transitionOut}
            onChange={(e) => {
              const tr = e.target.value as BrollTransitionType;
              setLibraryClips((prev) =>
                prev.map((c) => (c.id === activeClip.id ? { ...c, transitionOut: tr } : c))
              );
            }}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#f8fafc',
              padding: '6px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            <option value="dissolve">Cross Dissolve</option>
            <option value="whip-pan">Whip Pan</option>
            <option value="zoom-push">Zoom Push</option>
            <option value="glitch">Glitch Transition</option>
            <option value="light-leak">Light Leak</option>
            <option value="wipe">Wipe</option>
            <option value="cut">Direct Cut</option>
          </select>
        </div>

        {/* Speed Multiplier */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Speed Multiplier:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{activeClip.speedMultiplier.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.1"
            value={activeClip.speedMultiplier}
            onChange={(e) => {
              const sm = parseFloat(e.target.value);
              setLibraryClips((prev) =>
                prev.map((c) => (c.id === activeClip.id ? { ...c, speedMultiplier: sm } : c))
              );
            }}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>
      </div>
    </div>
  );
}
