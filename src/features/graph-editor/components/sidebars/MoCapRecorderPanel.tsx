import React, { useState, useRef } from 'react';
import { KeyframePoint } from '../../types';
import { LiveMotionRecorder } from '../../../../core/states/liveRecorder';
import { importAndCleanMoCapData } from '../../../../core/states/mocapImporter';

interface MoCapRecorderPanelProps {
  currentTime: number;
  onApplyRecordedKeyframes: (keyframes: KeyframePoint[]) => void;
}

export function MoCapRecorderPanel({
  currentTime,
  onApplyRecordedKeyframes,
}: MoCapRecorderPanelProps) {
  const recorderRef = useRef(new LiveMotionRecorder());
  const [isRecording, setIsRecording] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const val = (1 - (e.clientY - rect.top) / rect.height) * 100;

    recorderRef.current.startRecording(0, val);
    setIsRecording(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isRecording) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frame = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const val = Math.max(0, Math.min(100, (1 - (e.clientY - rect.top) / rect.height) * 100));

    recorderRef.current.recordSample(frame, val);
  };

  const handlePointerUp = () => {
    if (!isRecording) return;
    const keyframes = recorderRef.current.stopRecording(1.5);
    setIsRecording(false);
    if (keyframes.length >= 2) {
      onApplyRecordedKeyframes(keyframes);
    }
  };

  const handleImportSampleMoCap = () => {
    // Generate synthetic raw noisy mocap track
    const raw = [];
    for (let f = 0; f <= 100; f += 2) {
      const v = Math.sin(f * 0.1) * 35 + 50 + (Math.random() - 0.5) * 8;
      raw.push({ frame: f, value: v });
    }
    const cleaned = importAndCleanMoCapData(raw, 1.2);
    onApplyRecordedKeyframes(cleaned);
  };

  return (
    <div
      style={{
        background: '#0c1222',
        border: '1px solid #1e293b',
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: '#f43f5e', fontSize: 13 }}>🎙️</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>MoCap & Live Recording</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Click and drag inside the recording pad to capture live motion gestures into keyframes.
      </div>

      {/* Live Recording Interactive Pad */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          height: 110,
          background: isRecording ? 'rgba(244, 63, 94, 0.15)' : '#070b14',
          border: `2px dashed ${isRecording ? '#f43f5e' : '#334155'}`,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'crosshair',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: isRecording ? '#f43f5e' : '#64748b' }}>
          {isRecording ? '🔴 RECORDING GESTURE...' : 'CLICK & DRAG TO RECORD GESTURE'}
        </span>
      </div>

      <button
        onClick={handleImportSampleMoCap}
        style={{
          background: '#11182c',
          border: '1px solid #1e293b',
          color: '#38bdf8',
          borderRadius: 6,
          padding: '6px 10px',
          fontSize: 10,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        📥 Import & Denoise MoCap Track
      </button>
    </div>
  );
}
