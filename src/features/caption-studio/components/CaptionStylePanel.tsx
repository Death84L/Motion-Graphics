import React from 'react';
import {
  CaptionStyleConfig,
  CaptionAnimationPreset,
  CaptionAspectSafeZone,
  CaptionWord,
  WordEmphasisType,
} from '../../../core/caption/captionModel';

interface CaptionStylePanelProps {
  style: CaptionStyleConfig;
  animationPreset: CaptionAnimationPreset;
  safeZone: CaptionAspectSafeZone;
  selectedWord: CaptionWord | null;
  onUpdateStyle: (updates: Partial<CaptionStyleConfig>) => void;
  onUpdateAnimationPreset: (preset: CaptionAnimationPreset) => void;
  onUpdateSafeZone: (safeZone: CaptionAspectSafeZone) => void;
  onUpdateWordEmphasis: (wordId: string, emphasis: WordEmphasisType) => void;
}

export function CaptionStylePanel({
  style,
  animationPreset,
  safeZone,
  selectedWord,
  onUpdateStyle,
  onUpdateAnimationPreset,
  onUpdateSafeZone,
  onUpdateWordEmphasis,
}: CaptionStylePanelProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#090e1a',
        padding: 14,
        borderRadius: 10,
        border: '1px solid #1e293b',
        fontSize: 11,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#38bdf8', fontSize: 13 }}>🎨</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc', letterSpacing: 0.3 }}>
            Caption Styling & Presets
          </span>
        </div>
      </div>

      {/* Animation Preset Selector */}
      <div>
        <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 2 }}>
          MOTION & KARAOKE PRESET
        </label>
        <select
          value={animationPreset}
          onChange={(e) => onUpdateAnimationPreset(e.target.value as CaptionAnimationPreset)}
          style={{
            width: '100%',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#38bdf8',
            padding: '6px',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <option value="word-pop">⚡ Word Pop & Settle (Social Reels)</option>
          <option value="karaoke-fill">🎤 Karaoke Sweep (Music & TikTok)</option>
          <option value="energetic-bounce">🎈 Energetic Bounce (High Energy)</option>
          <option value="word-wave">🌊 Word Wave Ribbon</option>
          <option value="tracking-cinematic">🎬 Tracking Cinematic (Editorial)</option>
          <option value="smooth-fade">🌿 Smooth Fade (Minimal)</option>
        </select>
      </div>

      {/* Safe Area Selector */}
      <div>
        <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 2 }}>
          ASPECT & SAFE ZONE
        </label>
        <select
          value={safeZone}
          onChange={(e) => onUpdateSafeZone(e.target.value as CaptionAspectSafeZone)}
          style={{
            width: '100%',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#ec4899',
            padding: '6px',
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          <option value="tiktok-reels-9-16">📱 9:16 TikTok / Reels / Shorts</option>
          <option value="youtube-16-9">🖥️ 16:9 YouTube / Broadcast</option>
          <option value="instagram-1-1">📷 1:1 Square Feed</option>
        </select>
      </div>

      {/* Typography Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>FONT SIZE (PX)</span>
          <input
            type="number"
            value={style.fontSizePx}
            onChange={(e) => onUpdateStyle({ fontSizePx: parseInt(e.target.value) || 24 })}
            style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#f8fafc' }}
          />
        </div>

        <div>
          <span style={{ fontSize: 9, color: '#64748b' }}>HIGHLIGHT COLOR</span>
          <input
            type="color"
            value={style.highlightColor}
            onChange={(e) => onUpdateStyle({ highlightColor: e.target.value })}
            style={{ width: '100%', height: 26, background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '1px', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Highlight Box Style */}
      <div>
        <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 2 }}>
          WORD HIGHLIGHT STYLE
        </label>
        <select
          value={style.highlightStyle}
          onChange={(e) => onUpdateStyle({ highlightStyle: e.target.value as any })}
          style={{
            width: '100%',
            background: '#11182c',
            border: '1px solid #1e293b',
            borderRadius: 6,
            color: '#10b981',
            padding: '5px',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          <option value="pill-box">Pill Box Background</option>
          <option value="text-color">Active Text Color</option>
          <option value="glow">Glow Bloom Aura</option>
          <option value="underline">Active Underline</option>
          <option value="gradient-sweep">Gradient Fill Sweep</option>
        </select>
      </div>

      {/* Selected Word Emphasis Controls */}
      {selectedWord && (
        <div style={{ background: '#11182c', padding: 8, borderRadius: 6, border: '1px solid #1e293b' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
            SELECTED WORD: <strong style={{ color: '#38bdf8' }}>{selectedWord.text}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {(['none', 'pop', 'glow', 'bounce', 'color-punch', 'shake'] as WordEmphasisType[]).map((em) => (
              <button
                key={em}
                onClick={() => onUpdateWordEmphasis(selectedWord.id, em)}
                style={{
                  padding: '3px 4px',
                  fontSize: 9,
                  fontWeight: selectedWord.emphasis === em ? 800 : 500,
                  background: selectedWord.emphasis === em ? '#38bdf8' : '#090e1a',
                  color: selectedWord.emphasis === em ? '#080d1a' : '#94a3b8',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
