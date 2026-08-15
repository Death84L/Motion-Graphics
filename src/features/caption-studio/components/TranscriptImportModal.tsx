import React, { useState } from 'react';
import { importUniversalTranscript } from '../../../core/caption/transcription/universalTranscriptImporter';
import { CaptionSequence } from '../../../core/caption/captionModel';

interface TranscriptImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSequence: (seq: CaptionSequence) => void;
}

export function TranscriptImportModal({
  isOpen,
  onClose,
  onImportSequence,
}: TranscriptImportModalProps) {
  const [rawText, setRawText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    setErrorMsg(null);
    const res = importUniversalTranscript(rawText);
    if (res.success && res.sequence) {
      onImportSequence(res.sequence);
      onClose();
    } else {
      setErrorMsg(res.errorMessage || 'Failed to parse transcript format.');
    }
  };

  const handleLoadSampleSrt = () => {
    const sample = `1\n00:00:00,000 --> 00:00:02,400\nWELCOME TO MOTION STUDIO\n\n2\n00:00:02,500 --> 00:00:05,200\nCREATE PROFESSIONAL MOTION GRAPHICS\n\n3\n00:00:05,300 --> 00:00:08,000\nFASTER THAN EVER BEFORE\n`;
    setRawText(sample);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          background: '#090e1a',
          border: '1px solid #1e293b',
          borderRadius: 14,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>📥</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>
              Import Local Transcript (SRT / VTT / TXT / JSON)
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: 16, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8' }}>
          100% Local processing. Paste your SRT, WebVTT, or plain text transcript below to generate word-level animated captions instantly.
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Paste SRT, WebVTT, or plain text here..."
          rows={8}
          style={{
            width: '100%',
            background: '#040711',
            border: '1px solid #1e293b',
            borderRadius: 8,
            color: '#f8fafc',
            padding: 10,
            fontSize: 11,
            fontFamily: 'monospace',
            resize: 'none',
          }}
        />

        {errorMsg && (
          <div style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 4 }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleLoadSampleSrt}
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
            Load Sample SRT
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: '#11182c',
                border: '1px solid #1e293b',
                color: '#cbd5e1',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleParse}
              style={{
                background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
                color: '#080d1a',
                border: 'none',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ✨ Import & Parse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
