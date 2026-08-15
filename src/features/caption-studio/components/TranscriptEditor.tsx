import React, { useState } from 'react';
import { CaptionSegment, CaptionSpeaker } from '../../../core/caption/captionModel';
import { applySemanticEmphasisToWords } from '../../../core/caption/intelligence/semanticEmphasisEngine';
import { RippleMode } from '../../../core/caption/timing/rippleEditingEngine';

interface TranscriptEditorProps {
  captions: CaptionSegment[];
  speakers: CaptionSpeaker[];
  selectedSegmentId: string | null;
  rippleMode: RippleMode;
  onSelectSegment: (id: string) => void;
  onUpdateCaptions: (captions: CaptionSegment[]) => void;
  onUpdateRippleMode: (mode: RippleMode) => void;
}

export function TranscriptEditor({
  captions,
  speakers,
  selectedSegmentId,
  rippleMode,
  onSelectSegment,
  onUpdateCaptions,
  onUpdateRippleMode,
}: TranscriptEditorProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');

  const handleApplySemanticEmphasisAll = () => {
    const updated = captions.map((c) => ({
      ...c,
      words: applySemanticEmphasisToWords(c.words),
    }));
    onUpdateCaptions(updated);
  };

  const handleSearchReplace = () => {
    if (!searchQuery) return;
    const updated = captions.map((c) => {
      if (c.text.includes(searchQuery)) {
        const newText = c.text.split(searchQuery).join(replaceQuery);
        return {
          ...c,
          text: newText,
          words: c.words.map((w) => (w.text.includes(searchQuery) ? { ...w, text: w.text.split(searchQuery).join(replaceQuery) } : w)),
        };
      }
      return c;
    });
    onUpdateCaptions(updated);
  };

  const handleInsertTag = (tag: string) => {
    if (!selectedSegmentId) return;
    const updated = captions.map((c) => {
      if (c.id !== selectedSegmentId) return c;
      const newText = `[${tag}] ${c.text}`;
      return { ...c, text: newText };
    });
    onUpdateCaptions(updated);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: '#090e1a',
        padding: 12,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>✏️</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Transcript & Ripple Editor
          </span>
        </div>

        {/* Ripple Mode Selector */}
        <select
          value={rippleMode}
          onChange={(e) => onUpdateRippleMode(e.target.value as RippleMode)}
          style={{
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 4,
            color: '#10b981',
            padding: '2px 6px',
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          <option value="ripple-forward">⚡ Ripple Forward</option>
          <option value="preserve-gaps">🔒 Preserve Gaps</option>
          <option value="push-pull">⇄ Push / Pull</option>
        </select>
      </div>

      {/* Semantic Emphasis & Emotion Tag Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <button
          onClick={handleApplySemanticEmphasisAll}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 4,
            padding: '3px 8px',
            fontSize: 9,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          🧠 Auto Semantic Emphasis
        </button>

        {['SHOUT', 'WHISPER', 'LAUGH', 'PAUSE'].map((tag) => (
          <button
            key={tag}
            onClick={() => handleInsertTag(tag)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              borderRadius: 4,
              padding: '3px 6px',
              fontSize: 9,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            +{tag}
          </button>
        ))}
      </div>

      {/* Search and Replace */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 4, borderTop: '1px solid #1e293b', paddingTop: 6 }}>
        <input
          type="text"
          placeholder="Find..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: '#040711', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 6px', fontSize: 10, color: '#f8fafc' }}
        />
        <input
          type="text"
          placeholder="Replace..."
          value={replaceQuery}
          onChange={(e) => setReplaceQuery(e.target.value)}
          style={{ background: '#040711', border: '1px solid #1e293b', borderRadius: 4, padding: '3px 6px', fontSize: 10, color: '#f8fafc' }}
        />
        <button
          onClick={handleSearchReplace}
          style={{ background: '#11182c', border: '1px solid #1e293b', color: '#cbd5e1', borderRadius: 4, padding: '3px 8px', fontSize: 9, cursor: 'pointer' }}
        >
          Replace All
        </button>
      </div>
    </div>
  );
}
