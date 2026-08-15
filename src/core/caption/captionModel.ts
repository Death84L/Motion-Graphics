export type CaptionAspectSafeZone = 'youtube-16-9' | 'tiktok-reels-9-16' | 'instagram-1-1' | 'broadcast-safe';

export type WordEmphasisType = 'none' | 'pop' | 'glow' | 'bounce' | 'color-punch' | 'shake';

export interface CaptionWord {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  confidence?: number;
  emphasis: WordEmphasisType;
  colorOverride?: string;
}

export type CaptionPosition = 'bottom-center' | 'bottom-left' | 'bottom-right' | 'center' | 'top-center';

export interface CaptionSpeaker {
  id: string;
  name: string;
  color: string;
  avatarColor?: string;
  position: CaptionPosition;
}

export type CaptionAnimationPreset =
  | 'karaoke-fill'
  | 'word-pop'
  | 'word-wave'
  | 'smooth-fade'
  | 'tracking-cinematic'
  | 'energetic-bounce'
  | 'minimal-highlight';

export interface CaptionStyleConfig {
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number;
  textColor: string;
  highlightColor: string;
  highlightStyle: 'pill-box' | 'text-color' | 'glow' | 'underline' | 'gradient-sweep';
  backgroundColor?: string;
  backgroundPaddingPx?: number;
  borderRadiusPx?: number;
  strokeColor?: string;
  strokeWidthPx?: number;
  shadowElevationPx?: number;
  maxLines: 1 | 2 | 3;
  maxCharactersPerLine: number;
  textTransform?: 'uppercase' | 'none' | 'capitalize';
}

export interface CaptionSegment {
  id: string;
  startSec: number;
  endSec: number;
  text: string;
  words: CaptionWord[];
  speakerId: string;
  position?: CaptionPosition;
  styleOverride?: Partial<CaptionStyleConfig>;
  animationPreset?: CaptionAnimationPreset;
}

export interface CaptionSequence {
  id: string;
  name: string;
  language: string;
  durationSec: number;
  speakers: CaptionSpeaker[];
  captions: CaptionSegment[];
  globalStyle: CaptionStyleConfig;
  globalAnimation: CaptionAnimationPreset;
  safeZone: CaptionAspectSafeZone;
}

export const DEFAULT_CAPTION_STYLE: CaptionStyleConfig = {
  fontFamily: 'Inter',
  fontSizePx: 42,
  fontWeight: 800,
  textColor: '#ffffff',
  highlightColor: '#38bdf8',
  highlightStyle: 'pill-box',
  backgroundColor: 'rgba(9, 14, 26, 0.75)',
  backgroundPaddingPx: 8,
  borderRadiusPx: 10,
  strokeColor: '#000000',
  strokeWidthPx: 2,
  shadowElevationPx: 12,
  maxLines: 2,
  maxCharactersPerLine: 28,
  textTransform: 'uppercase',
};

export const INITIAL_CAPTION_SPEAKERS: CaptionSpeaker[] = [
  { id: 'spk-1', name: 'Speaker 1', color: '#38bdf8', position: 'bottom-center' },
  { id: 'spk-2', name: 'Speaker 2', color: '#10b981', position: 'bottom-center' },
];

export const SAMPLE_CAPTION_SEQUENCE: CaptionSequence = {
  id: 'seq-demo',
  name: 'Motion Studio Introduction',
  language: 'en',
  durationSec: 8.0,
  speakers: INITIAL_CAPTION_SPEAKERS,
  globalStyle: DEFAULT_CAPTION_STYLE,
  globalAnimation: 'word-pop',
  safeZone: 'tiktok-reels-9-16',
  captions: [
    {
      id: 'cap-1',
      startSec: 0.0,
      endSec: 2.4,
      text: 'WELCOME TO MOTION STUDIO',
      speakerId: 'spk-1',
      words: [
        { id: 'w-1', text: 'WELCOME', startSec: 0.0, endSec: 0.6, emphasis: 'pop' },
        { id: 'w-2', text: 'TO', startSec: 0.6, endSec: 0.9, emphasis: 'none' },
        { id: 'w-3', text: 'MOTION', startSec: 0.9, endSec: 1.6, emphasis: 'glow' },
        { id: 'w-4', text: 'STUDIO', startSec: 1.6, endSec: 2.4, emphasis: 'pop' },
      ],
    },
    {
      id: 'cap-2',
      startSec: 2.5,
      endSec: 5.2,
      text: 'CREATE PROFESSIONAL MOTION GRAPHICS',
      speakerId: 'spk-1',
      words: [
        { id: 'w-5', text: 'CREATE', startSec: 2.5, endSec: 3.1, emphasis: 'none' },
        { id: 'w-6', text: 'PROFESSIONAL', startSec: 3.1, endSec: 4.1, emphasis: 'color-punch' },
        { id: 'w-7', text: 'MOTION', startSec: 4.1, endSec: 4.6, emphasis: 'pop' },
        { id: 'w-8', text: 'GRAPHICS', startSec: 4.6, endSec: 5.2, emphasis: 'bounce' },
      ],
    },
    {
      id: 'cap-3',
      startSec: 5.3,
      endSec: 8.0,
      text: 'FASTER THAN EVER BEFORE',
      speakerId: 'spk-2',
      words: [
        { id: 'w-9', text: 'FASTER', startSec: 5.3, endSec: 6.0, emphasis: 'pop' },
        { id: 'w-10', text: 'THAN', startSec: 6.0, endSec: 6.4, emphasis: 'none' },
        { id: 'w-11', text: 'EVER', startSec: 6.4, endSec: 7.0, emphasis: 'none' },
        { id: 'w-12', text: 'BEFORE', startSec: 7.0, endSec: 8.0, emphasis: 'glow' },
      ],
    },
  ],
};
