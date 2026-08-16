export type CaptionStylePreset = 'hormozi-punch' | 'mrbeast-stroke' | 'ali-clean' | 'cyber-neon';

export interface CaptionWord {
  id: string;
  word: string;
  startSec: number;
  endSec: number;
  highlightColor: string;
  isEmphasized?: boolean;
  emojiTrigger?: string;
}

export interface KineticCaptionPhrase {
  id: string;
  startSec: number;
  endSec: number;
  words: CaptionWord[];
}

export interface CaptionStyleRenderConfig {
  fontFamily: string;
  fontSizePx: number;
  textTransform: 'uppercase' | 'none' | 'capitalize';
  activeWordScale: number;
  activeWordGlow: string;
  pillBackground?: string;
  textStroke?: string;
  boxShadow: string;
}

export class KineticCaptionEngine {
  /**
   * Generates synchronized word-by-word kinetic karaoke caption phrases.
   */
  static getSampleKineticPhrases(): KineticCaptionPhrase[] {
    return [
      {
        id: 'p1',
        startSec: 0.0,
        endSec: 3.5,
        words: [
          { id: 'w1', word: 'HOW', startSec: 0.0, endSec: 0.5, highlightColor: '#fde047', isEmphasized: true },
          { id: 'w2', word: 'WE', startSec: 0.5, endSec: 0.9, highlightColor: '#ffffff' },
          { id: 'w3', word: 'GREW', startSec: 0.9, endSec: 1.5, highlightColor: '#38bdf8', isEmphasized: true, emojiTrigger: '📈' },
          { id: 'w4', word: 'TO', startSec: 1.5, endSec: 1.9, highlightColor: '#ffffff' },
          { id: 'w5', word: '$50,000', startSec: 1.9, endSec: 2.7, highlightColor: '#10b981', isEmphasized: true, emojiTrigger: '💰' },
          { id: 'w6', word: 'FAST!', startSec: 2.7, endSec: 3.5, highlightColor: '#fde047', isEmphasized: true, emojiTrigger: '🚀' },
        ],
      },
      {
        id: 'p2',
        startSec: 3.5,
        endSec: 7.5,
        words: [
          { id: 'w7', word: 'THE', startSec: 3.5, endSec: 4.0, highlightColor: '#ffffff' },
          { id: 'w8', word: 'SECRET', startSec: 4.0, endSec: 4.8, highlightColor: '#ec4899', isEmphasized: true, emojiTrigger: '🔑' },
          { id: 'w9', word: 'IS', startSec: 4.8, endSec: 5.2, highlightColor: '#ffffff' },
          { id: 'w10', word: 'AUTOMATION', startSec: 5.2, endSec: 6.2, highlightColor: '#38bdf8', isEmphasized: true, emojiTrigger: '⚡' },
          { id: 'w11', word: 'AND', startSec: 6.2, endSec: 6.6, highlightColor: '#ffffff' },
          { id: 'w12', word: 'SPEED!', startSec: 6.6, endSec: 7.5, highlightColor: '#fde047', isEmphasized: true, emojiTrigger: '🔥' },
        ],
      },
    ];
  }

  /**
   * Returns exact CSS and rendering configuration for chosen caption template.
   */
  static getCaptionStyleConfig(preset: CaptionStylePreset): CaptionStyleRenderConfig {
    switch (preset) {
      case 'hormozi-punch':
        return {
          fontFamily: 'Montserrat, Inter, sans-serif',
          fontSizePx: 12,
          textTransform: 'uppercase',
          activeWordScale: 1.35,
          activeWordGlow: '0 0 16px rgba(253, 224, 71, 0.9), 0 4px 12px rgba(0, 0, 0, 0.9)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.9)',
          textStroke: '3px #000000',
        };
      case 'mrbeast-stroke':
        return {
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontSizePx: 13,
          textTransform: 'uppercase',
          activeWordScale: 1.25,
          activeWordGlow: '0 0 14px rgba(236, 72, 153, 0.9)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.95)',
          textStroke: '4px #040711',
        };
      case 'ali-clean':
        return {
          fontFamily: 'Georgia, serif',
          fontSizePx: 10,
          textTransform: 'none',
          activeWordScale: 1.12,
          activeWordGlow: 'none',
          pillBackground: 'rgba(16, 185, 129, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
        };
      case 'cyber-neon':
      default:
        return {
          fontFamily: 'Courier New, monospace',
          fontSizePx: 11,
          textTransform: 'uppercase',
          activeWordScale: 1.3,
          activeWordGlow: '0 0 18px #38bdf8, 0 0 8px #ec4899',
          boxShadow: '0 0 24px rgba(56, 189, 248, 0.5)',
        };
    }
  }

  /**
   * Returns the currently active word at a given playback timecode.
   */
  static getActiveWord(phrases: KineticCaptionPhrase[], currentTimeSec: number): { activePhrase: KineticCaptionPhrase | null; activeWord: CaptionWord | null } {
    for (const p of phrases) {
      if (currentTimeSec >= p.startSec && currentTimeSec <= p.endSec) {
        for (const w of p.words) {
          if (currentTimeSec >= w.startSec && currentTimeSec <= w.endSec) {
            return { activePhrase: p, activeWord: w };
          }
        }
        return { activePhrase: p, activeWord: p.words[0] };
      }
    }
    return { activePhrase: phrases[0] || null, activeWord: phrases[0]?.words[0] || null };
  }

  /**
   * Generates standard SubRip (.srt) subtitle string for direct host import.
   */
  static exportToSrt(phrases: KineticCaptionPhrase[]): string {
    let srt = '';
    phrases.forEach((p, idx) => {
      const startMs = formatSrtTime(p.startSec);
      const endMs = formatSrtTime(p.endSec);
      const text = p.words.map((w) => w.word).join(' ');

      srt += `${idx + 1}\n`;
      srt += `${startMs} --> ${endMs}\n`;
      srt += `${text}\n\n`;
    });
    return srt;
  }
}

function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${hrs}:${mins}:${secs},${ms}`;
}
