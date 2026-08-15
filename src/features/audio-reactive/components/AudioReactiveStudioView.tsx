import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AudioReactiveEngine,
  SpectralAnalysisFrame,
  AudioFrequencyBandId,
} from '../../../core/audio/audioReactiveEngine';
import {
  MusicIntelligenceEngine,
  BeatGridInfo,
} from '../../../core/audio/musicIntelligenceEngine';
import {
  AudioModulationBinding,
  AudioModulationGraphEngine,
  SAMPLE_AUDIO_MOTION_PRESETS,
  AudioMotionPreset,
} from '../../../core/audio/audioModulationGraph';
import { AudioKeyframeBaker } from '../../../core/audio/audioKeyframeBaker';
import { KeyframePoint } from '../../graph-editor/types';

interface AudioReactiveStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], layerName: string) => void;
}

export function AudioReactiveStudioView({ onBakeKeyframesToEditor }: AudioReactiveStudioViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<AudioMotionPreset>(SAMPLE_AUDIO_MOTION_PRESETS[0]);
  const [bindings, setBindings] = useState<AudioModulationBinding[]>(SAMPLE_AUDIO_MOTION_PRESETS[0].bindings);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  // Generate 4-second audio simulation frames (240 frames at 60fps)
  const spectralFrames: SpectralAnalysisFrame[] = useMemo(() => {
    return AudioReactiveEngine.generateSpectralFrames(4.0, 60, 128);
  }, []);

  const musicInfo: BeatGridInfo = useMemo(() => {
    return MusicIntelligenceEngine.analyzeMusicStructure(spectralFrames, 60);
  }, [spectralFrames]);

  // Real-time Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % spectralFrames.length);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, spectralFrames]);

  const activeFrame = spectralFrames[currentFrameIndex] || spectralFrames[0];

  // Evaluate Motion Output for current frame
  const motionOutputs = useMemo(() => {
    return AudioModulationGraphEngine.evaluateModulation(activeFrame, bindings);
  }, [activeFrame, bindings]);

  // Handle Bake Keyframes to Graph Editor
  const handleBakeKeyframes = () => {
    const primaryBinding = bindings[0];
    if (!primaryBinding) return;
    const baked = AudioKeyframeBaker.bakeAudioToKeyframes(spectralFrames, primaryBinding, 60, 0.5);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, `Audio Reactive • ${primaryBinding.name}`);
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  const isBeatActive = activeFrame.isBeat;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: 8-BAND EQUALIZER & MUSIC INTELLIGENCE */}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>🎵</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f8fafc' }}>
              Audio Reactive Engine
            </span>
          </div>

          {/* Beat Beacon Indicator */}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: isBeatActive ? '#ec4899' : '#1e293b',
              boxShadow: isBeatActive ? '0 0 12px #ec4899' : 'none',
              transition: 'background 0.05s ease',
            }}
            title="Downbeat Trigger Indicator"
          />
        </div>

        {/* Music Intelligence Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: '#11182c', padding: '6px 8px', borderRadius: 6 }}>
            <div style={{ fontSize: 8, color: '#64748b', fontWeight: 700 }}>TEMPO / BPM</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>{musicInfo.bpm} BPM</div>
          </div>
          <div style={{ background: '#11182c', padding: '6px 8px', borderRadius: 6 }}>
            <div style={{ fontSize: 8, color: '#64748b', fontWeight: 700 }}>CONFIDENCE</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#10b981' }}>{(musicInfo.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* 8-Band Frequency Spectrum Equalizer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            8-Band Real-Time Spectrum
          </span>
          {(
            [
              { id: 'sub-bass', label: 'Sub-Bass (20-60Hz)', color: '#ec4899' },
              { id: 'bass', label: 'Bass (60-250Hz)', color: '#f43f5e' },
              { id: 'low-mid', label: 'Low-Mid (250-500Hz)', color: '#f59e0b' },
              { id: 'mid', label: 'Mid (500-2kHz)', color: '#eab308' },
              { id: 'high-mid', label: 'High-Mid (2k-4kHz)', color: '#10b981' },
              { id: 'treble', label: 'Treble (4k-8kHz)', color: '#06b6d4' },
              { id: 'high-treble', label: 'High-Treble (8k-16kHz)', color: '#38bdf8' },
              { id: 'rms-volume', label: 'RMS Loudness', color: '#818cf8' },
            ] as { id: AudioFrequencyBandId; label: string; color: string }[]
          ).map((b) => {
            const val = activeFrame.bands[b.id] || 0;
            return (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#94a3b8' }}>
                  <span>{b.label}</span>
                  <span style={{ color: b.color, fontWeight: 700 }}>{(val * 100).toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: '#11182c', borderRadius: 3, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${val * 100}%`,
                      height: '100%',
                      background: b.color,
                      borderRadius: 3,
                      transition: 'width 0.05s ease',
                      boxShadow: `0 0 6px ${b.color}88`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Preset Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Audio Motion Presets
          </span>
          {SAMPLE_AUDIO_MOTION_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  setSelectedPreset(preset);
                  setBindings(preset.bindings);
                }}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                  {preset.name}
                </div>
                <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 2 }}>{preset.description}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE AUDIO-REACTIVE VIEWPORT STAGE */}
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
        {/* Playback Transport Controls */}
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
              {isPlaying ? '⏸ Pause' : '▶ Play Audio'}
            </button>
            <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>
              F: {currentFrameIndex} / {spectralFrames.length} ({(currentFrameIndex / 60).toFixed(2)}s)
            </span>
          </div>

          {/* 1-Click Bake Action */}
          <button
            onClick={handleBakeKeyframes}
            style={{
              background: isBaked ? '#10b981' : 'linear-gradient(135deg, #ec4899, #8b5cf6)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 14px rgba(236, 72, 153, 0.4)',
            }}
          >
            {isBaked ? '✓ Baked to Graph Editor!' : '🔥 Bake to Graph Editor & Timeline'}
          </button>
        </div>

        {/* Live Audio-Reactive Simulation Viewport */}
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
            overflow: 'hidden',
            boxShadow: `inset 0 0 50px rgba(0,0,0,0.9)`,
            transform: `translate(${Math.sin(currentFrameIndex * 0.8) * motionOutputs['camera-shake']}px, ${Math.cos(currentFrameIndex * 0.9) * motionOutputs['camera-shake']}px)`,
            transition: 'transform 0.05s ease',
          }}
        >
          {/* Audio Waveform Background Ribbon */}
          <div style={{ position: 'absolute', width: '100%', height: '80px', display: 'flex', alignItems: 'center', gap: 2, opacity: 0.15, padding: '0 20px' }}>
            {spectralFrames.slice(0, 80).map((sf, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: `${sf.rms * 100}%`,
                  background: idx === currentFrameIndex % 80 ? '#ec4899' : '#38bdf8',
                  borderRadius: 2,
                }}
              />
            ))}
          </div>

          {/* Reactive Center Card */}
          <div
            style={{
              transform: `scale(${motionOutputs['scale'] / 100}) translateY(${motionOutputs['position-y']}px) rotate(${motionOutputs['rotation']}deg)`,
              transformOrigin: 'center center',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(56, 189, 248, 0.25))',
              border: `2px solid ${isBeatActive ? '#ec4899' : '#38bdf8'}`,
              borderRadius: 16,
              padding: '24px 36px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: `0 0 ${motionOutputs['glow-intensity']}px rgba(236, 72, 153, 0.8), 0 10px 40px rgba(0,0,0,0.8)`,
              transition: 'transform 0.04s ease, box-shadow 0.05s ease, border-color 0.05s ease',
            }}
          >
            <span style={{ fontSize: 32 }}>🎧</span>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#f8fafc', letterSpacing: `${motionOutputs['letter-spacing']}px` }}>
              Bass Pulse & Drop
            </div>
            <div style={{ fontSize: 10, color: '#38bdf8', fontWeight: 700 }}>
              Scale: {motionOutputs['scale']}% • Shake: {motionOutputs['camera-shake']}px • Glow: {motionOutputs['glow-intensity']}px
            </div>
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: MODULATION GRAPH BINDINGS & DRIVERS */}
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
          Audio ➔ Motion Modulation Graph
        </div>

        {/* Live Output Signal Inspector */}
        <div style={{ background: '#11182c', padding: 10, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Scale Output:</span>
            <span style={{ color: '#ec4899', fontWeight: 800 }}>{motionOutputs['scale']}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Camera Shake:</span>
            <span style={{ color: '#38bdf8', fontWeight: 800 }}>{motionOutputs['camera-shake']}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Glow Aura:</span>
            <span style={{ color: '#10b981', fontWeight: 800 }}>{motionOutputs['glow-intensity']}px</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
            <span style={{ color: '#94a3b8' }}>Rotation:</span>
            <span style={{ color: '#f59e0b', fontWeight: 800 }}>{motionOutputs['rotation']}°</span>
          </div>
        </div>

        {/* Active Bindings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Active Modulation Drivers ({bindings.length})
          </span>
          {bindings.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: 8,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#38bdf8' }}>{b.name}</span>
                <span style={{ fontSize: 9, color: '#ec4899', fontWeight: 800 }}>{b.multiplier}×</span>
              </div>
              <div style={{ fontSize: 8, color: '#94a3b8' }}>
                Threshold: {(b.threshold * 100).toFixed(0)}% • Range: [{b.minOutput}, {b.maxOutput}]
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
