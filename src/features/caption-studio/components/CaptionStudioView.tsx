import React, { useState, useMemo, useEffect } from 'react';
import {
  CaptionSequence,
  CaptionSegment,
  CaptionWord,
  SAMPLE_CAPTION_SEQUENCE,
  WordEmphasisType,
} from '../../../core/caption/captionModel';
import { evaluateCaptionAnimationAtTime } from '../../../core/caption/captionAnimationEngine';
import { generateWordTimingsForText } from '../../../core/caption/wordTimingEngine';
import { generateSrtContent, generateVttContent } from '../../../core/caption/captionExportEngine';
import { RippleMode, applyRippleTimingEdit } from '../../../core/caption/timing/rippleEditingEngine';
import { CaptionPreviewStage } from './CaptionPreviewStage';
import { CaptionTimeline } from './CaptionTimeline';
import { CaptionStylePanel } from './CaptionStylePanel';
import { CaptionQualityPanel } from './CaptionQualityPanel';
import { TranscriptImportModal } from './TranscriptImportModal';
import { TranscriptEditor } from './TranscriptEditor';

export function CaptionStudioView() {
  const [sequence, setSequence] = useState<CaptionSequence>(SAMPLE_CAPTION_SEQUENCE);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    SAMPLE_CAPTION_SEQUENCE.captions[0]?.id || null
  );
  const [selectedWord, setSelectedWord] = useState<CaptionWord | null>(
    SAMPLE_CAPTION_SEQUENCE.captions[0]?.words[0] || null
  );
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(1.2);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rippleMode, setRippleMode] = useState<RippleMode>('ripple-forward');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  // Playback timer effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTimeSec((prev) => (prev >= sequence.durationSec ? 0 : prev + 0.033));
    }, 33);
    return () => clearInterval(interval);
  }, [isPlaying, sequence.durationSec]);

  // Evaluated Frame Animation
  const evaluatedFrame = useMemo(() => {
    return evaluateCaptionAnimationAtTime(
      sequence.captions,
      currentTimeSec,
      sequence.globalAnimation
    );
  }, [sequence, currentTimeSec]);

  const handleUpdateSegmentText = (segmentId: string, text: string) => {
    const updated = sequence.captions.map((c) => {
      if (c.id !== segmentId) return c;
      const newWords = generateWordTimingsForText(text, c.startSec, c.endSec);
      return { ...c, text, words: newWords };
    });
    setSequence({ ...sequence, captions: updated });
  };

  const handleUpdateSegmentTiming = (segmentId: string, startSec: number, endSec: number) => {
    const rippled = applyRippleTimingEdit(sequence.captions, segmentId, startSec, endSec, rippleMode);
    setSequence({ ...sequence, captions: rippled });
  };

  const handleUpdateWordEmphasis = (wordId: string, emphasis: WordEmphasisType) => {
    const updated = sequence.captions.map((c) => ({
      ...c,
      words: c.words.map((w) => (w.id === wordId ? { ...w, emphasis } : w)),
    }));
    setSequence({ ...sequence, captions: updated });
    if (selectedWord && selectedWord.id === wordId) {
      setSelectedWord({ ...selectedWord, emphasis });
    }
  };

  const handleAutoFixTiming = () => {
    // Automatically eliminate overlaps
    const fixed = sequence.captions.map((c, idx, arr) => {
      if (idx > 0 && c.startSec < arr[idx - 1].endSec) {
        const adjustedStart = arr[idx - 1].endSec + 0.05;
        const dur = Math.max(0.5, c.endSec - c.startSec);
        return {
          ...c,
          startSec: adjustedStart,
          endSec: adjustedStart + dur,
        };
      }
      return c;
    });
    setSequence({ ...sequence, captions: fixed });
  };

  const handleExportSrt = () => {
    const srt = generateSrtContent(sequence.captions);
    navigator.clipboard.writeText(srt);
    setExportedFormat('SRT Copied!');
    setTimeout(() => setExportedFormat(null), 2500);
  };

  const handleExportVtt = () => {
    const vtt = generateVttContent(sequence);
    navigator.clipboard.writeText(vtt);
    setExportedFormat('VTT Copied!');
    setTimeout(() => setExportedFormat(null), 2500);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr 340px',
        height: '100%',
        background: '#060913',
        overflow: 'hidden',
      }}
    >
      {/* Left Column: Transcript Segment Editor */}
      <div
        style={{
          background: '#090e1a',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 14,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#38bdf8', fontSize: 16 }}>💬</span>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.3 }}>
              Caption Studio
            </span>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            📥 Import
          </button>
        </div>

        {/* Integrated Transcript & Ripple Editor */}
        <TranscriptEditor
          captions={sequence.captions}
          speakers={sequence.speakers}
          selectedSegmentId={selectedSegmentId}
          rippleMode={rippleMode}
          onSelectSegment={(id) => setSelectedSegmentId(id)}
          onUpdateCaptions={(caps) => setSequence({ ...sequence, captions: caps })}
          onUpdateRippleMode={(m) => setRippleMode(m)}
        />

        {/* Caption Segments List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
          {sequence.captions.map((c, idx) => {
            const isSelected = c.id === selectedSegmentId;
            const speaker = sequence.speakers.find((s) => s.id === c.speakerId) || sequence.speakers[0];

            return (
              <div
                key={c.id}
                onClick={() => setSelectedSegmentId(c.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : '#11182c',
                  border: `1px solid ${isSelected ? '#38bdf8' : '#1e293b'}`,
                  borderRadius: 8,
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: speaker.color }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: speaker.color }}>
                      #{idx + 1} {speaker.name}
                    </span>
                  </div>
                  <span style={{ fontSize: 8, color: '#64748b', fontFamily: 'monospace' }}>
                    {c.startSec.toFixed(2)}s – {c.endSec.toFixed(2)}s
                  </span>
                </div>

                <textarea
                  value={c.text}
                  onChange={(e) => handleUpdateSegmentText(c.id, e.target.value)}
                  rows={2}
                  style={{
                    width: '100%',
                    background: '#040711',
                    border: '1px solid #1e293b',
                    borderRadius: 4,
                    color: '#f8fafc',
                    padding: '4px 6px',
                    fontSize: 11,
                    fontWeight: 700,
                    resize: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Center Column: Live Preview & Caption Timeline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#040711',
          overflow: 'hidden',
          padding: 14,
          gap: 12,
        }}
      >
        <CaptionPreviewStage
          activeSegment={evaluatedFrame.activeSegment}
          evaluatedWords={evaluatedFrame.evaluatedWords}
          speakers={sequence.speakers}
          style={sequence.globalStyle}
          safeZone={sequence.safeZone}
        />

        {/* Transport Playback Bar */}
        <div
          style={{
            background: '#090e1a',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: isPlaying ? '#ec4899' : '#38bdf8',
              color: '#080d1a',
              border: 'none',
              borderRadius: 4,
              padding: '3px 8px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <input
            type="range"
            min="0"
            max={sequence.durationSec}
            step="0.05"
            value={currentTimeSec}
            onChange={(e) => setCurrentTimeSec(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: '#38bdf8' }}
          />

          <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
            {currentTimeSec.toFixed(2)}s
          </span>
        </div>

        <CaptionTimeline
          captions={sequence.captions}
          selectedSegmentId={selectedSegmentId}
          selectedWordId={selectedWord?.id || null}
          currentTimeSec={currentTimeSec}
          totalDurationSec={sequence.durationSec}
          onSelectSegment={(id) => setSelectedSegmentId(id)}
          onSelectWord={(w) => setSelectedWord(w)}
          onSeek={(t) => setCurrentTimeSec(t)}
          onUpdateSegmentTiming={handleUpdateSegmentTiming}
        />
      </div>

      {/* Right Column: Styling, Quality, & Export */}
      <div
        style={{
          background: '#090e1a',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          padding: 12,
          gap: 10,
          overflowY: 'auto',
        }}
      >
        <CaptionStylePanel
          style={sequence.globalStyle}
          animationPreset={sequence.globalAnimation}
          safeZone={sequence.safeZone}
          selectedWord={selectedWord}
          onUpdateStyle={(updates) => setSequence({ ...sequence, globalStyle: { ...sequence.globalStyle, ...updates } })}
          onUpdateAnimationPreset={(p) => setSequence({ ...sequence, globalAnimation: p })}
          onUpdateSafeZone={(sz) => setSequence({ ...sequence, safeZone: sz })}
          onUpdateWordEmphasis={handleUpdateWordEmphasis}
        />

        <CaptionQualityPanel
          captions={sequence.captions}
          onAutoFixTiming={handleAutoFixTiming}
        />

        {/* Export Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 'auto' }}>
          <button
            onClick={handleExportSrt}
            style={{
              background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
              color: '#080d1a',
              border: 'none',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {exportedFormat === 'SRT Copied!' ? '✓ Copied SRT' : '📦 Export SRT'}
          </button>

          <button
            onClick={handleExportVtt}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 10px',
              fontSize: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {exportedFormat === 'VTT Copied!' ? '✓ Copied VTT' : '📦 Export VTT'}
          </button>
        </div>
      </div>

      {/* Import Modal */}
      <TranscriptImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSequence={(importedSeq) => {
          setSequence(importedSeq);
          setSelectedSegmentId(importedSeq.captions[0]?.id || null);
          setSelectedWord(importedSeq.captions[0]?.words[0] || null);
          setCurrentTimeSec(0);
        }}
      />
    </div>
  );
}
