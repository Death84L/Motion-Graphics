import React, { useState, useMemo } from 'react';
import {
  tokenizeTextWithSpatialOrder,
  TextTargetScope,
  TextDirectionOrder,
} from '../../../core/text/textTargetingEngine';
import {
  evaluateKineticTextTransform,
  KineticTextStyle,
  CharacterTransformState,
} from '../../../core/text/kineticTypographyEngine';
import {
  evaluateTypewriterAtFrame,
  TypewriterConfig,
  DEFAULT_TYPEWRITER_CONFIG,
} from '../../../core/text/typewriterEngine';
import {
  TEXT_EMOTION_PRESETS,
  TextEmotionPreset,
} from '../../../core/text/textEmotionPresets';
import { KineticTextStage } from './KineticTextStage';
import { UIComponentMotionStudio } from '../../ui-studio/components/UIComponentMotionStudio';

interface TextAnimatorViewProps {
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onCurrentTimeChange: (time: number) => void;
}

export function TextAnimatorView({
  currentTime,
  isPlaying,
  onTogglePlay,
  onCurrentTimeChange,
}: TextAnimatorViewProps) {
  const [activeStudioTab, setActiveStudioTab] = useState<'typography' | 'ui-motion'>('typography');

  // Text Animation State
  const [textContent, setTextContent] = useState<string>('MOTION STUDIO');
  const [scope, setScope] = useState<TextTargetScope>('character');
  const [order, setOrder] = useState<TextDirectionOrder>('left-to-right');
  const [style, setStyle] = useState<KineticTextStyle>('elastic-snap');
  const [intervalFrames, setIntervalFrames] = useState<number>(3);
  const [intensity, setIntensity] = useState<number>(1.2);
  const [fontSize, setFontSize] = useState<number>(54);
  const [glowColor, setGlowColor] = useState<string>('#38bdf8');
  const [textColor, setTextColor] = useState<string>('#f8fafc');
  const [isTypewriter, setIsTypewriter] = useState<boolean>(false);

  // Apply Emotion Preset
  const handleApplyEmotionPreset = (preset: TextEmotionPreset) => {
    setStyle(preset.style);
    setScope(preset.scope);
    setOrder(preset.order);
    setIntervalFrames(preset.intervalFrames);
    setIntensity(preset.intensity);
    setGlowColor(preset.glowColor);
    setTextColor(preset.textColor);
    setIsTypewriter(false);
  };

  // 1. Tokenize text with spatial order
  const tokens = useMemo(() => {
    return tokenizeTextWithSpatialOrder(textContent, scope, order, intervalFrames);
  }, [textContent, scope, order, intervalFrames]);

  // 2. Evaluate individual character kinetic transforms
  const characters: CharacterTransformState[] = useMemo(() => {
    return tokens.map((tok) =>
      evaluateKineticTextTransform(tok, currentTime, style, 24, intensity)
    );
  }, [tokens, currentTime, style, intensity]);

  // 3. Evaluate typewriter state
  const typewriterState = useMemo(() => {
    if (!isTypewriter) return undefined;
    return evaluateTypewriterAtFrame(textContent, currentTime, 30, DEFAULT_TYPEWRITER_CONFIG);
  }, [textContent, currentTime, isTypewriter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#060913', overflow: 'hidden' }}>
      {/* Top Studio Switcher */}
      <div style={{ display: 'flex', background: '#090e1a', borderBottom: '1px solid #1e293b', padding: '6px 14px', gap: 6 }}>
        <button
          onClick={() => setActiveStudioTab('typography')}
          style={{
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: activeStudioTab === 'typography' ? 800 : 500,
            background: activeStudioTab === 'typography' ? 'linear-gradient(135deg, #1e3a8a, #1e40af)' : 'transparent',
            color: activeStudioTab === 'typography' ? '#38bdf8' : '#94a3b8',
            border: activeStudioTab === 'typography' ? '1px solid #38bdf8' : '1px solid transparent',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          📝 Kinetic Typography Studio
        </button>

        <button
          onClick={() => setActiveStudioTab('ui-motion')}
          style={{
            padding: '5px 12px',
            fontSize: 11,
            fontWeight: activeStudioTab === 'ui-motion' ? 800 : 500,
            background: activeStudioTab === 'ui-motion' ? 'linear-gradient(135deg, #065f46, #047857)' : 'transparent',
            color: activeStudioTab === 'ui-motion' ? '#10b981' : '#94a3b8',
            border: activeStudioTab === 'ui-motion' ? '1px solid #10b981' : '1px solid transparent',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          🖱️ UI Motion & Tokens Studio
        </button>
      </div>

      {activeStudioTab === 'ui-motion' ? (
        <UIComponentMotionStudio />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Left Controls Column */}
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
            {/* Text Input */}
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 2 }}>
                TEXT CONTENT
              </label>
              <input
                type="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                style={{
                  width: '100%',
                  background: '#11182c',
                  border: '1px solid #1e293b',
                  borderRadius: 6,
                  color: '#f8fafc',
                  padding: '6px 8px',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            </div>

            {/* Emotion Presets */}
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>
                1-CLICK EMOTION PRESETS
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {TEXT_EMOTION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleApplyEmotionPreset(p)}
                    style={{
                      background: '#11182c',
                      border: '1px solid #1e293b',
                      borderRadius: 4,
                      color: '#38bdf8',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Kinetic Style Selector */}
            <div>
              <label style={{ fontSize: 9, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 2 }}>
                KINETIC MOTION STYLE
              </label>
              <select
                value={style}
                onChange={(e) => {
                  setStyle(e.target.value as KineticTextStyle);
                  setIsTypewriter(false);
                }}
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
                <option value="elastic-snap">Elastic Snap (Physics)</option>
                <option value="tracking-expansion">Tracking Expansion (Cinematic)</option>
                <option value="gravity-drop">Gravity Drop (Bounce)</option>
                <option value="wave">Wave Harmonic Oscillation</option>
                <option value="explosion-reassemble">Explosion & Reassemble</option>
                <option value="glitch-scramble">Glitch Scramble (Cyberpunk)</option>
              </select>
            </div>

            {/* Targeting Scope & Spatial Order */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div>
                <span style={{ fontSize: 9, color: '#64748b' }}>SCOPE</span>
                <select
                  value={scope}
                  onChange={(e) => setScope(e.target.value as TextTargetScope)}
                  style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#38bdf8' }}
                >
                  <option value="character">Character</option>
                  <option value="word">Word</option>
                  <option value="line">Line</option>
                </select>
              </div>

              <div>
                <span style={{ fontSize: 9, color: '#64748b' }}>DIRECTION</span>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as TextDirectionOrder)}
                  style={{ width: '100%', background: '#11182c', border: '1px solid #1e293b', borderRadius: 4, padding: '4px', fontSize: 10, color: '#38bdf8' }}
                >
                  <option value="left-to-right">Left ➔ Right</option>
                  <option value="right-to-left">Right ➔ Left</option>
                  <option value="center-out">Center ➔ Out</option>
                  <option value="outside-in">Outside ➔ In</option>
                  <option value="wave">Wave Crest</option>
                  <option value="random">Random Jitter</option>
                </select>
              </div>
            </div>

            {/* Intensity & Stagger Interval Sliders */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#cbd5e1' }}>
                <span>Motion Intensity:</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{intensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8' }}
              />
            </div>

            {/* Typewriter Toggle */}
            <div style={{ background: '#11182c', padding: 8, borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>⌨️ Typewriter Mode</span>
              <button
                onClick={() => setIsTypewriter(!isTypewriter)}
                style={{
                  background: isTypewriter ? '#10b981' : '#1e293b',
                  color: isTypewriter ? '#080d1a' : '#64748b',
                  border: 'none',
                  borderRadius: 4,
                  padding: '2px 8px',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {isTypewriter ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Right Stage & Transport */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: '#040711',
              overflow: 'hidden',
              padding: 16,
              gap: 12,
            }}
          >
            {/* Viewport Stage */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #0e1526 0%, #03060f 100%)',
                borderRadius: 12,
                border: '1px solid #1e293b',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <KineticTextStage
                characters={characters}
                typewriterState={typewriterState}
                isTypewriterMode={isTypewriter}
                fontSize={fontSize}
                textColor={textColor}
                glowColor={glowColor}
              />

              {/* Transport Bar */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 20,
                  right: 20,
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
                  onClick={onTogglePlay}
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
                  max="100"
                  value={currentTime}
                  onChange={(e) => onCurrentTimeChange(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: '#38bdf8' }}
                />

                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>
                  {currentTime.toFixed(0)}f
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
