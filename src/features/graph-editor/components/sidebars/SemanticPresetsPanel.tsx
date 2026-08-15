import React from 'react';
import { KeyframePoint } from '../../types';

interface SemanticPreset {
  id: string;
  name: string;
  category: string;
  desc: string;
  keyframes: KeyframePoint[];
}

const SEMANTIC_PRESETS: SemanticPreset[] = [
  {
    id: 'snappy-ui',
    name: 'Snappy UI Pop',
    category: 'UI & App',
    desc: 'Instant acceleration with brief overshoot pop',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeIn', handleOut: { x: 12, y: 15 } },
      { id: 2, time: 35, value: 108, ease: 'easeOut', handleIn: { x: -8, y: 0 }, handleOut: { x: 8, y: 0 } },
      { id: 3, time: 100, value: 100, ease: 'easeOut' },
    ],
  },
  {
    id: 'cinematic-glide',
    name: 'Cinematic Decel',
    category: 'Film & Video',
    desc: 'Expansive graceful motion with long deceleration trail',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeInOut', handleOut: { x: 45, y: 0 } },
      { id: 2, time: 100, value: 100, ease: 'easeOut', handleIn: { x: -45, y: 0 } },
    ],
  },
  {
    id: 'heavy-object',
    name: 'Heavy Object (High Inertia)',
    category: 'Physics',
    desc: 'Slow sluggish startup with immense momentum',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'easeIn', handleOut: { x: 50, y: 0 } },
      { id: 2, time: 70, value: 85, ease: 'easeInOut' },
      { id: 3, time: 100, value: 100, ease: 'easeOut', handleIn: { x: -10, y: 0 } },
    ],
  },
  {
    id: 'lightweight-bounce',
    name: 'Lightweight Ping',
    category: 'Physics',
    desc: 'Super responsive high-frequency bounce settle',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'bounce' },
      { id: 2, time: 100, value: 100, ease: 'bounce' },
    ],
  },
  {
    id: 'button-tap',
    name: 'Button Tap & Release',
    category: 'UI & App',
    desc: 'Quick press down to 88% then snappy recovery to 100%',
    keyframes: [
      { id: 1, time: 0, value: 100, ease: 'easeIn' },
      { id: 2, time: 30, value: 88, ease: 'easeInOut' },
      { id: 3, time: 100, value: 100, ease: 'easeOut' },
    ],
  },
  {
    id: 'dramatic-reveal',
    name: 'Dramatic Hero Reveal',
    category: 'Motion Graphics',
    desc: 'Anticipation dip followed by powerful soaring crescendo',
    keyframes: [
      { id: 1, time: 0, value: 0, ease: 'anticipate' },
      { id: 2, time: 20, value: -12, ease: 'easeIn' },
      { id: 3, time: 75, value: 104, ease: 'easeOut' },
      { id: 4, time: 100, value: 100, ease: 'easeOut' },
    ],
  },
];

interface SemanticPresetsPanelProps {
  onApplySemanticPreset: (keyframes: KeyframePoint[]) => void;
}

export function SemanticPresetsPanel({ onApplySemanticPreset }: SemanticPresetsPanelProps) {
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
        <span style={{ color: '#a855f7', fontSize: 13 }}>🎨</span>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.3 }}>Semantic Intent Presets</span>
      </div>

      <div style={{ fontSize: 11, color: '#94a3b8' }}>
        Intent-driven motion styles named by real-world design behavior.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
        {SEMANTIC_PRESETS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onApplySemanticPreset(preset.keyframes)}
            style={{
              background: '#11182c',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '8px 10px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#f8fafc' }}>{preset.name}</span>
              <span style={{ fontSize: 9, color: '#a855f7', fontWeight: 600 }}>{preset.category}</span>
            </div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>{preset.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
