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
import { webAudioPlayer } from '../../../core/audio/webAudioPlayer';
import { KeyframePoint } from '../../graph-editor/types';

interface AudioReactiveStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], layerName: string) => void;
}

export function AudioReactiveStudioView({ onBakeKeyframesToEditor }: AudioReactiveStudioViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.4);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [selectedPreset, setSelectedPreset] = useState<AudioMotionPreset>(SAMPLE_AUDIO_MOTION_PRESETS[0]);
  const [bindings, setBindings] = useState<AudioModulationBinding[]>(SAMPLE_AUDIO_MOTION_PRESETS[0].bindings);
  const [isBaked, setIsBaked] = useState<boolean>(false);
  const [audioSource, setAudioSource] = useState<'synth-edm' | 'custom-file' | 'mic'>('synth-edm');
  const [customFileName, setCustomFileName] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate 4-second audio simulation frames (240 frames at 60fps)
  const spectralFrames: SpectralAnalysisFrame[] = useMemo(() => {
    return AudioReactiveEngine.generateSpectralFrames(4.0, 60, 128);
  }, []);

  const musicInfo: BeatGridInfo = useMemo(() => {
    return MusicIntelligenceEngine.analyzeMusicStructure(spectralFrames, 60);
  }, [spectralFrames]);

  // Audio Sound Playback Synchronization
  useEffect(() => {
    webAudioPlayer.setSoundEnabled(!isSoundMuted);
    webAudioPlayer.setVolume(volume);
  }, [isSoundMuted, volume]);

  // Real-time Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => {
        const next = (prev + 1) % spectralFrames.length;
        const frame = spectralFrames[next];

        // Trigger real WebAudio Sound on beats
        if (frame?.isBeat && !isSoundMuted && audioSource === 'synth-edm') {
          const isDownbeat = (next % Math.round((60 / 128) * 60 * 4)) < 2;
          webAudioPlayer.playBeatPulse(isDownbeat);
        }

        return next;
      });
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying, isSoundMuted, audioSource, spectralFrames]);

  const activeFrame = spectralFrames[currentFrameIndex] || spectralFrames[0];

  // Evaluate Motion Output for current frame
  const motionOutputs = useMemo(() => {
    return AudioModulationGraphEngine.evaluateModulation(activeFrame, bindings);
  }, [activeFrame, bindings]);

  // Handle Custom File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomFileName(file.name);
    setAudioSource('custom-file');
    const success = await webAudioPlayer.loadCustomAudioFile(file);
    if (success && !isSoundMuted) {
      webAudioPlayer.playCustomAudio();
    }
  };

  // Handle Microphone Toggle
  const handleToggleMic = async () => {
    if (audioSource === 'mic') {
      webAudioPlayer.stopMicrophone();
      setAudioSource('synth-edm');
    } else {
      const success = await webAudioPlayer.startMicrophone();
      if (success) {
        setAudioSource('mic');
      }
    }
  };

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
      {/* 1. LEFT COLUMN: 8-BAND EQUALIZER & AUDIO SOURCE */}
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
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: isBeatActive ? '#ec4899' : '#1e293b',
              boxShadow: isBeatActive ? '0 0 14px #ec4899' : 'none',
              transition: 'background 0.05s ease',
            }}
            title="Beat Trigger Indicator"
          />
        </div>

        {/* Sound Enable & Volume Control */}
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => {
                const nextMute = !isSoundMuted;
                setIsSoundMuted(nextMute);
                webAudioPlayer.setSoundEnabled(!nextMute);
              }}
              style={{
                background: !isSoundMuted ? '#10b981' : '#334155',
                color: '#ffffff',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {!isSoundMuted ? '🔊 Sound: ON' : '🔇 Sound: MUTED'}
            </button>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Vol: {Math.round(volume * 100)}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
        </div>

        {/* Audio Source Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Audio Source
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button
              onClick={() => {
                webAudioPlayer.stopCustomAudio();
                webAudioPlayer.stopMicrophone();
                setAudioSource('synth-edm');
              }}
              style={{
                background: audioSource === 'synth-edm' ? 'rgba(56, 189, 248, 0.15)' : '#11182c',
                border: `1px solid ${audioSource === 'synth-edm' ? '#38bdf8' : '#1e293b'}`,
                color: audioSource === 'synth-edm' ? '#38bdf8' : '#cbd5e1',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              🎹 128 BPM Synth Beat (Built-in Audio)
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="audio/mp3,audio/wav,audio/aac,audio/flac,audio/ogg"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: audioSource === 'custom-file' ? 'rgba(236, 72, 153, 0.15)' : '#11182c',
                border: `1px solid ${audioSource === 'custom-file' ? '#ec4899' : '#1e293b'}`,
                color: audioSource === 'custom-file' ? '#ec4899' : '#cbd5e1',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              📁 {customFileName ? `File: ${customFileName.slice(0, 18)}...` : 'Upload MP3 / WAV File'}
            </button>

            <button
              onClick={handleToggleMic}
              style={{
                background: audioSource === 'mic' ? 'rgba(245, 158, 11, 0.15)' : '#11182c',
                border: `1px solid ${audioSource === 'mic' ? '#f59e0b' : '#1e293b'}`,
                color: audioSource === 'mic' ? '#f59e0b' : '#cbd5e1',
                borderRadius: 6,
                padding: '6px 8px',
                fontSize: 10,
                fontWeight: 700,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              🎤 {audioSource === 'mic' ? 'Microphone Active (Listening)' : 'Live Microphone Input'}
            </button>
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
              {musicInfo.bpm} BPM • F: {currentFrameIndex} / {spectralFrames.length}
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
            minHeight: '360px',
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

        {/* Quick Instructions Step-by-Step Box */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontWeight: 800, color: '#f8fafc' }}>💡 How to Use Audio-Reactive Motion:</div>
          <div>1. Click <b>"🔊 Sound: ON"</b> in the left panel (browsers require user click to play sound).</div>
          <div>2. Use the built-in <b>128 BPM Synth Beat</b>, or upload your own <b>MP3/WAV</b> song file.</div>
          <div>3. Watch the visualizer pulse to the bass, kick, and snare in real time.</div>
          <div>4. Click <b>"🔥 Bake to Graph Editor & Timeline"</b> to export real keyframes to Premiere Pro / After Effects / Resolve!</div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN: MODULATION GRAPH BINDINGS & PRESETS */}
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
    </div>
  );
}
