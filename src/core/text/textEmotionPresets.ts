import { KineticTextStyle } from './kineticTypographyEngine';
import { TextDirectionOrder, TextTargetScope } from './textTargetingEngine';

export interface TextEmotionPreset {
  id: string;
  name: string;
  category: 'emotion' | 'editorial' | 'commercial';
  description: string;
  style: KineticTextStyle;
  scope: TextTargetScope;
  order: TextDirectionOrder;
  intervalFrames: number;
  durationFrames: number;
  intensity: number;
  glowColor: string;
  textColor: string;
}

export const TEXT_EMOTION_PRESETS: TextEmotionPreset[] = [
  {
    id: 'emo-energetic',
    name: '⚡ Energetic Pop',
    category: 'emotion',
    description: 'Rapid elastic character pop with punchy momentum.',
    style: 'elastic-snap',
    scope: 'character',
    order: 'left-to-right',
    intervalFrames: 2,
    durationFrames: 18,
    intensity: 1.4,
    glowColor: '#38bdf8',
    textColor: '#f8fafc',
  },
  {
    id: 'emo-cinematic',
    name: '🎬 Cinematic Elegance',
    category: 'editorial',
    description: 'Expansive tracking reveal with atmospheric blur dissipation.',
    style: 'tracking-expansion',
    scope: 'character',
    order: 'center-out',
    intervalFrames: 3,
    durationFrames: 32,
    intensity: 1.0,
    glowColor: '#ec4899',
    textColor: '#f1f5f9',
  },
  {
    id: 'emo-playful',
    name: '🎈 Playful Bounce',
    category: 'emotion',
    description: 'Bouncy gravity drop with joyful character impact oscillations.',
    style: 'gravity-drop',
    scope: 'character',
    order: 'outside-in',
    intervalFrames: 3,
    durationFrames: 24,
    intensity: 1.2,
    glowColor: '#10b981',
    textColor: '#ffffff',
  },
  {
    id: 'emo-futuristic',
    name: '🤖 Futuristic Glitch',
    category: 'commercial',
    description: 'Cyberpunk character scramble with chromatic displacement.',
    style: 'glitch-scramble',
    scope: 'character',
    order: 'random',
    intervalFrames: 1,
    durationFrames: 20,
    intensity: 1.3,
    glowColor: '#a855f7',
    textColor: '#38bdf8',
  },
  {
    id: 'emo-calm',
    name: '🌿 Calm & Minimal',
    category: 'editorial',
    description: 'Gentle progressive wave with subtle kinetic breathing.',
    style: 'wave',
    scope: 'word',
    order: 'left-to-right',
    intervalFrames: 4,
    durationFrames: 26,
    intensity: 0.8,
    glowColor: '#64748b',
    textColor: '#e2e8f0',
  },
];
