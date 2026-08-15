import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  SpeechToMotionEngine,
  TimedWord,
  CaptionChunkMode,
} from '../../../core/speech/speechToMotionEngine';
import {
  TRENDY_CAPTION_PRESETS,
  TrendyCaptionPreset,
  CaptionCategory,
} from '../../../core/speech/trendyCaptionPresets';
import { KeyframePoint } from '../../graph-editor/types';

interface SpeechCaptionsStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function SpeechCaptionsStudioView({ onBakeKeyframesToEditor }: SpeechCaptionsStudioViewProps) {
  const [rawTranscript, setRawTranscript] = useState<string>(
    'Create viral kinetic captions with auto emojis and 45 trendy styles to hook viewers in three seconds'
  );
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hormozi-yellow-pop');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [chunkMode, setChunkMode] = useState<CaptionChunkMode>('two-three-words');
  const [autoEmoji, setAutoEmoji] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(36);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active Preset
  const activePreset = useMemo(() => {
    return TRENDY_CAPTION_PRESETS.find((p) => p.id === selectedPresetId) || TRENDY_CAPTION_PRESETS[0];
  }, [selectedPresetId]);

  // Timed Words
  const timedWords: TimedWord[] = useMemo(() => {
    return SpeechToMotionEngine.generateTimedTranscript(rawTranscript, 5.5, autoEmoji);
  }, [rawTranscript, autoEmoji]);

  const totalDuration = timedWords[timedWords.length - 1]?.endSec || 5.5;

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((t) => (t + 0.02) % totalDuration);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Active Word Index & Display Chunks
  const activeWordIdx = useMemo(() => {
    return SpeechToMotionEngine.getActiveWordIndex(timedWords, currentTimeSec);
  }, [timedWords, currentTimeSec]);

  const displayWords = useMemo(() => {
    return SpeechToMotionEngine.chunkWordsForDisplay(timedWords, activeWordIdx, chunkMode);
  }, [timedWords, activeWordIdx, chunkMode]);

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    return TRENDY_CAPTION_PRESETS.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.description.toLowerCase().includes(searchFilter.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchFilter]);

  // Handle Subtitle File Upload (.srt, .vtt, .json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ext = file.name.split('.').pop() || 'srt';
      const parsedWords = SpeechToMotionEngine.parseUploadedFile(content, ext, autoEmoji);

      if (parsedWords.length > 0) {
        setRawTranscript(parsedWords.map((w) => w.word).join(' '));
        setUploadedFileName(file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleBake = () => {
    const baked = SpeechToMotionEngine.bakeSpeechToKeyframes(timedWords, activePreset);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Caption Style • ${activePreset.name}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 310px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: UPLOAD & 45+ PRESETS BROWSER */}
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
          <span style={{ color: '#38bdf8', fontSize: 16 }}>🎙️</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
            Speech Captions & 45+ Styles
          </span>
        </div>

        {/* Upload Subtitle File Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".srt,.vtt,.json,.ass,.txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#1e293b',
              border: '1px dashed #38bdf8',
              borderRadius: 6,
              color: '#38bdf8',
              padding: '8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            📁 {uploadedFileName ? `Loaded: ${uploadedFileName}` : 'Upload Subtitles (.SRT, .VTT, .JSON)'}
          </button>
        </div>

        {/* Search Presets */}
        <input
          type="text"
          placeholder="Search 45+ caption styles..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#f8fafc',
            padding: '5px 8px',
            fontSize: 10,
          }}
        />

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {['All', 'Creator Viral', 'Cinematic & Luxury', 'Cyberpunk & Tech', '3D & Shaders', 'Retro & Arcade'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? '#38bdf8' : '#11182c',
                color: selectedCategory === cat ? '#040711' : '#94a3b8',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                fontSize: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 8, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Trending Styles ({filteredPresets.length} Presets)
          </span>
          {filteredPresets.map((preset) => {
            const isSel = activePreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setSelectedPresetId(preset.id)}
                style={{
                  background: isSel ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSel ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: isSel ? '#38bdf8' : '#f8fafc' }}>
                    {preset.name}
                  </div>
                  <span style={{ fontSize: 7, color: '#94a3b8', background: '#090e1a', padding: '1px 4px', borderRadius: 2 }}>
                    {preset.category}
                  </span>
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE 60FPS VIDEO STAGE */}
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
        {/* Top Playback Bar */}
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
              {currentTimeSec.toFixed(2)}s / {totalDuration.toFixed(2)}s
            </span>
          </div>

          <button
            onClick={handleBake}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #38bdf8, #ec4899)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(56, 189, 248, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor'}
          </button>
        </div>

        {/* Live 9:16 Video Preview Stage */}
        <div
          style={{
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 12,
            minHeight: '380px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            overflow: 'hidden',
          }}
        >
          {/* Simulated 9:16 Vertical Video Frame */}
          <div
            style={{
              width: 270,
              height: 380,
              background: 'radial-gradient(circle at center, #1e293b 0%, #090e1a 100%)',
              border: '2px solid #334155',
              borderRadius: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
              boxShadow: '0 12px 36px rgba(0,0,0,0.8)',
              position: 'relative',
            }}
          >
            {/* Active Caption Words */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
              {displayWords.map((tw) => {
                const isActive = timedWords[activeWordIdx]?.word === tw.word;
                const isEmph = tw.isEmphasized;

                return (
                  <div
                    key={tw.word + tw.startSec}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: fontSize,
                      fontFamily: activePreset.fontFamily,
                      fontWeight: activePreset.fontWeight,
                      color: isActive ? activePreset.activeColor : activePreset.textColor,
                      backgroundColor: isActive ? activePreset.backgroundColor : undefined,
                      padding: activePreset.backgroundColor ? '3px 8px' : undefined,
                      borderRadius: activePreset.backgroundColor ? '6px' : undefined,
                      transform: isActive
                        ? `scale(${activePreset.scaleActive}) rotate(${activePreset.rotationActiveDeg}deg) translateY(${activePreset.yOffsetActivePx}px)`
                        : 'scale(1.0)',
                      transition: 'all 0.08s ease',
                      boxShadow: isActive ? activePreset.shadow : undefined,
                      textShadow: isActive ? activePreset.shadow : undefined,
                      WebkitTextStroke: activePreset.strokeWidth ? `${activePreset.strokeWidth}px ${activePreset.strokeColor}` : undefined,
                    }}
                  >
                    <span>{tw.word}</span>
                    {autoEmoji && tw.emoji && (
                      <span style={{ fontSize: fontSize * 0.9, marginLeft: 2 }}>{tw.emoji}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: CUSTOMIZATION & AUTO-EMOJIS */}
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
          Caption Controls & Chunking
        </div>

        {/* Auto-Emoji Toggle */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800 }}>Semantic Auto-Emojis</div>
            <div style={{ fontSize: 8, color: '#94a3b8' }}>Auto-attaches 💰, 🔥, 🚀, 🧠, ⚡</div>
          </div>
          <button
            onClick={() => setAutoEmoji((a) => !a)}
            style={{
              background: autoEmoji ? '#10b981' : '#334155',
              color: '#ffffff',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              fontSize: 9,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {autoEmoji ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Chunking Mode */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>WORD CHUNKING MODE:</span>
          {(['one-word', 'two-three-words', 'full-line'] as CaptionChunkMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setChunkMode(mode)}
              style={{
                background: chunkMode === mode ? 'rgba(56, 189, 248, 0.2)' : '#11182c',
                border: `1px solid ${chunkMode === mode ? '#38bdf8' : '#1e293b'}`,
                color: chunkMode === mode ? '#38bdf8' : '#94a3b8',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 9,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {mode.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Font Size Slider */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
            <span style={{ color: '#94a3b8' }}>Caption Font Size:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{fontSize}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="54"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#38bdf8' }}
          />
        </div>
      </div>
    </div>
  );
}
