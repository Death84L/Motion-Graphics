import React, { useState, useEffect, useMemo } from 'react';
import { SpeechToMotionEngine, TimedWord } from '../../../core/speech/speechToMotionEngine';
import { KeyframePoint } from '../../graph-editor/types';

interface SpeechCaptionsStudioViewProps {
  onBakeKeyframesToEditor?: (keyframes: KeyframePoint[], label: string) => void;
}

export function SpeechCaptionsStudioView({ onBakeKeyframesToEditor }: SpeechCaptionsStudioViewProps) {
  const [transcript, setTranscript] = useState<string>(
    'Create stunning kinetic typography that hooks viewers in the first three seconds'
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [isBaked, setIsBaked] = useState<boolean>(false);

  const timedWords: TimedWord[] = useMemo(() => {
    return SpeechToMotionEngine.generateTimedTranscript(transcript, 5.0);
  }, [transcript]);

  // 60FPS Playback Loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((t) => (t + 0.02) % 5.0);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeWordIdx = useMemo(() => {
    return SpeechToMotionEngine.getActiveWordIndex(timedWords, currentTimeSec);
  }, [timedWords, currentTimeSec]);

  const handleBake = () => {
    const baked = SpeechToMotionEngine.bakeSpeechToKeyframes(timedWords);
    if (onBakeKeyframesToEditor) {
      onBakeKeyframesToEditor(baked, 'Speech Caption Pops');
    }
    setIsBaked(true);
    setTimeout(() => setIsBaked(false), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '280px 1fr 300px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
        color: '#f8fafc',
      }}
    >
      {/* 1. LEFT COLUMN: TRANSCRIPT INPUT */}
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
            Speech-to-Motion Captions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>VOICEOVER SCRIPT:</span>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={4}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#f8fafc',
              padding: '6px 10px',
              fontSize: 10,
              resize: 'none',
            }}
          />
        </div>
      </div>

      {/* 2. CENTER COLUMN: LIVE KARAOKE STAGE */}
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
              {currentTimeSec.toFixed(2)}s / 5.00s
            </span>
          </div>

          <button
            onClick={handleBake}
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

        {/* Live Word Stage */}
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
            padding: 24,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 440 }}>
            {timedWords.map((tw, idx) => {
              const isActive = activeWordIdx === idx;
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color: isActive ? '#facc15' : tw.isEmphasized ? '#38bdf8' : '#94a3b8',
                    background: isActive ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
                    padding: isActive ? '2px 8px' : '2px 4px',
                    borderRadius: 6,
                    transform: isActive ? 'scale(1.2) translateY(-4px)' : 'scale(1.0)',
                    transition: 'all 0.08s ease',
                    boxShadow: isActive ? '0 0 16px rgba(250, 204, 21, 0.6)' : undefined,
                    border: isActive ? '1px solid #facc15' : '1px solid transparent',
                  }}
                >
                  {tw.word}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. RIGHT COLUMN */}
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
          Word-Level Timing Spec
        </div>
        <div style={{ background: '#11182c', border: '1px solid #1e293b', borderRadius: 8, padding: 10, fontSize: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          Sub-frame accurate word synchronizer. Directly maps to Premiere Pro essential graphics and DaVinci Resolve text nodes.
        </div>
      </div>
    </div>
  );
}
