import React, { useState } from 'react';
import { KeyframePoint } from '../../graph-editor/types';
import {
  SmartMotionClipboard,
  SelectiveCopyMask,
  DEFAULT_COPY_MASK,
} from '../../../core/clipboard/smartMotionClipboard';

interface MotionClipboardDrawerProps {
  currentKeyframes: KeyframePoint[];
  activeProperty: string;
  onApplyKeyframes: (pastedKeyframes: KeyframePoint[]) => void;
}

export function MotionClipboardDrawer({
  currentKeyframes,
  activeProperty,
  onApplyKeyframes,
}: MotionClipboardDrawerProps) {
  const [copyMask, setCopyMask] = useState<SelectiveCopyMask>(DEFAULT_COPY_MASK);
  const [targetProperty, setTargetProperty] = useState<'position' | 'scale' | 'rotation' | 'opacity'>('scale');
  const [normalizeRange, setNormalizeRange] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  const historySlots = SmartMotionClipboard.getHistorySlots();

  const handleCopy = () => {
    SmartMotionClipboard.copyMotion(
      currentKeyframes,
      `${activeProperty} Motion Snapshot`,
      activeProperty,
      copyMask
    );
    setToast('✓ Copied motion with selective mask to clipboard slot!');
    setTimeout(() => setToast(null), 2500);
  };

  const handlePaste = () => {
    const pasted = SmartMotionClipboard.pasteMotion(currentKeyframes, {
      targetPropertyType: targetProperty,
      sourcePropertyType: 'position',
      normalizeRange,
    });
    onApplyKeyframes(pasted);
    setToast('✓ Smart Pasted with cross-property normalization!');
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        height: '100%',
        background: '#040711',
        overflow: 'hidden',
      }}
    >
      {/* Column 1: History Slots & Active Clipboard Preview */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 20,
          gap: 14,
          background: '#060913',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#38bdf8', fontSize: 18 }}>📋</span>
          <span style={{ fontSize: 14, fontWeight: 900, color: '#f8fafc' }}>
            Smart Motion Clipboard & Cross-Property Normalizer
          </span>
        </div>

        {toast && (
          <div style={{ background: '#064e3b', border: '1px solid #10b981', color: '#6ee7b7', padding: '8px 12px', borderRadius: 6, fontSize: 11 }}>
            {toast}
          </div>
        )}

        {/* Copy Action Card */}
        <div style={{ background: '#090e1a', border: '1px solid #1e293b', borderRadius: 10, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
            Selective Copy Mask
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {(Object.keys(copyMask) as (keyof SelectiveCopyMask)[]).map((k) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#cbd5e1', cursor: 'pointer', textTransform: 'capitalize' }}>
                <input
                  type="checkbox"
                  checked={copyMask[k]}
                  onChange={(e) => setCopyMask({ ...copyMask, [k]: e.target.checked })}
                  style={{ accentColor: '#38bdf8' }}
                />
                <span>{k}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleCopy}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
              color: '#080d1a',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
              alignSelf: 'flex-start',
              marginTop: 4,
            }}
          >
            📋 Copy Active Curve to Slot
          </button>
        </div>

        {/* Clipboard History Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Clipboard History Slots ({historySlots.length})
          </span>
          {historySlots.map((slot) => (
            <div
              key={slot.id}
              style={{
                background: '#090e1a',
                border: '1px solid #1e293b',
                borderRadius: 8,
                padding: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{slot.label}</div>
                <div style={{ fontSize: 9, color: '#64748b' }}>
                  {slot.keyframes.length} keyframes • {slot.sourceDurationFrames} frames
                </div>
              </div>
              <button
                onClick={handlePaste}
                style={{ background: '#11182c', border: '1px solid #38bdf8', color: '#38bdf8', borderRadius: 4, padding: '4px 8px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
              >
                Paste
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Column 2: Cross-Property Paste Controls */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 16,
          gap: 12,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>
          Smart Cross-Property Paste
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>Target Property:</div>
          <select
            value={targetProperty}
            onChange={(e) => setTargetProperty(e.target.value as any)}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 6, color: '#38bdf8', padding: 6, fontSize: 11 }}
          >
            <option value="position">Position (0 to 1200px)</option>
            <option value="scale">Scale (0 to 100%)</option>
            <option value="rotation">Rotation (0 to 360°)</option>
            <option value="opacity">Opacity (0 to 1.0)</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#cbd5e1', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={normalizeRange}
            onChange={(e) => setNormalizeRange(e.target.checked)}
            style={{ accentColor: '#38bdf8' }}
          />
          <span>Auto-Normalize Range across properties</span>
        </label>

        <button
          onClick={handlePaste}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 11,
            fontWeight: 900,
            cursor: 'pointer',
            marginTop: 'auto',
          }}
        >
          ✨ Smart Paste Motion
        </button>
      </div>
    </div>
  );
}
