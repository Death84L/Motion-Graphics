import React, { useState } from 'react';
import { KeyframePoint, CurveLayer } from '../../types';
import {
  copyKeyframesToClipboard,
  pasteKeyframesFromClipboard,
  CopyChannelMode,
  PasteMode,
  KeyframeClipboardPayload,
} from '../../../../core/clipboard/keyframeTransferEngine';

interface KeyframeTransferPanelProps {
  selectedKeyframes: KeyframePoint[];
  allKeyframes: KeyframePoint[];
  activeLayer: CurveLayer;
  curveLayers: CurveLayer[];
  currentTime: number;
  onUpdateKeyframes: (updated: KeyframePoint[]) => void;
  onUpdateLayerKeyframes: (layerId: string, updated: KeyframePoint[]) => void;
}

export function KeyframeTransferPanel({
  selectedKeyframes,
  allKeyframes,
  activeLayer,
  curveLayers,
  currentTime,
  onUpdateKeyframes,
  onUpdateLayerKeyframes,
}: KeyframeTransferPanelProps) {
  const [channelMode, setChannelMode] = useState<CopyChannelMode>('all');
  const [pasteMode, setPasteMode] = useState<PasteMode>('relativePlayhead');
  const [targetDuration, setTargetDuration] = useState<number>(45);
  const [targetLayerId, setTargetLayerId] = useState<string>(activeLayer.id);
  const [copiedPayload, setCopiedPayload] = useState<KeyframeClipboardPayload | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCopy = (mode: CopyChannelMode) => {
    const keysToCopy = selectedKeyframes.length > 0 ? selectedKeyframes : allKeyframes;
    const payload = copyKeyframesToClipboard(keysToCopy, mode, activeLayer);
    setCopiedPayload(payload);
    setChannelMode(mode);
    setStatusMessage(`✓ Copied ${payload.keyframes.length} keys (${mode})`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handlePaste = () => {
    if (!copiedPayload) return;

    const targetLayer = curveLayers.find((l) => l.id === targetLayerId) || activeLayer;
    const existing = targetLayer.keyframes;

    const result = pasteKeyframesFromClipboard(existing, copiedPayload, {
      mode: pasteMode,
      targetPlayhead: currentTime,
      targetDuration,
      channelMode,
    });

    if (targetLayer.id === activeLayer.id) {
      onUpdateKeyframes(result);
    } else {
      onUpdateLayerKeyframes(targetLayer.id, result);
    }

    setStatusMessage(`✓ Pasted ${result.length} keyframes to ${targetLayer.name}`);
    setTimeout(() => setStatusMessage(null), 3000);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>📋</span>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>
            Keyframe Clipboard & Transfer
          </span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Copy, selectively transfer channels (timing, values, tangents), and paste across layers with relative scaling.
      </div>

      {/* Copy Channels Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Copy Channels
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <button
            onClick={() => handleCopy('all')}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#f8fafc',
              cursor: 'pointer',
            }}
          >
            📋 Copy All
          </button>
          <button
            onClick={() => handleCopy('timingOnly')}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#38bdf8',
              cursor: 'pointer',
            }}
          >
            ⏱ Timing Only
          </button>
          <button
            onClick={() => handleCopy('valuesOnly')}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#10b981',
              cursor: 'pointer',
            }}
          >
            📊 Values Only
          </button>
          <button
            onClick={() => handleCopy('tangentsOnly')}
            style={{
              padding: '6px 8px',
              fontSize: 11,
              fontWeight: 600,
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 6,
              color: '#a855f7',
              cursor: 'pointer',
            }}
          >
            ∿ Tangents Only
          </button>
        </div>
      </div>

      {/* Paste Configuration */}
      <div style={{ borderTop: '1px solid #1e293b', paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          Paste & Transfer Options
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div>
            <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>PASTE MODE</label>
            <select
              value={pasteMode}
              onChange={(e) => setPasteMode(e.target.value as PasteMode)}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '5px 6px',
                fontSize: 10,
                color: '#38bdf8',
              }}
            >
              <option value="relativePlayhead">At Playhead ({currentTime.toFixed(0)}f)</option>
              <option value="absolute">Absolute Timings</option>
              <option value="scaleToDuration">Scale to Duration</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>TARGET LAYER</label>
            <select
              value={targetLayerId}
              onChange={(e) => setTargetLayerId(e.target.value)}
              style={{
                width: '100%',
                background: '#11182c',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '5px 6px',
                fontSize: 10,
                color: '#f8fafc',
              }}
            >
              {curveLayers.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.property})
                </option>
              ))}
            </select>
          </div>
        </div>

        {pasteMode === 'scaleToDuration' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#94a3b8' }}>Target Span:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={targetDuration}
              onChange={(e) => setTargetDuration(parseInt(e.target.value))}
              style={{ flex: 1, accentColor: '#38bdf8' }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>{targetDuration}f</span>
          </div>
        )}

        <button
          onClick={handlePaste}
          disabled={!copiedPayload}
          style={{
            background: copiedPayload ? 'linear-gradient(135deg, #38bdf8, #2563eb)' : '#11182c',
            color: copiedPayload ? '#080d1a' : '#475569',
            border: 'none',
            borderRadius: 7,
            padding: '8px 12px',
            fontSize: 11,
            fontWeight: 800,
            cursor: copiedPayload ? 'pointer' : 'default',
          }}
        >
          {copiedPayload ? `📥 Paste ${channelMode.toUpperCase()} (${copiedPayload.keyframes.length} keys)` : 'Clipboard Empty'}
        </button>

        {statusMessage && (
          <div style={{ fontSize: 10, color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}
