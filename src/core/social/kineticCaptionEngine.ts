export interface CaptionWord {
  id: string;
  word: string;
  startSec: number;
  endSec: number;
  highlightColor: string;
  isEmphasized?: boolean;
}

export interface KineticCaptionPhrase {
  id: string;
  startSec: number;
  endSec: number;
  words: CaptionWord[];
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
          { id: 'w3', word: 'GREW', startSec: 0.9, endSec: 1.5, highlightColor: '#38bdf8', isEmphasized: true },
          { id: 'w4', word: 'TO', startSec: 1.5, endSec: 1.9, highlightColor: '#ffffff' },
          { id: 'w5', word: '$50,000', startSec: 1.9, endSec: 2.7, highlightColor: '#10b981', isEmphasized: true },
          { id: 'w6', word: 'FAST!', startSec: 2.7, endSec: 3.5, highlightColor: '#fde047', isEmphasized: true },
        ],
      },
      {
        id: 'p2',
        startSec: 3.5,
        endSec: 7.5,
        words: [
          { id: 'w7', word: 'THE', startSec: 3.5, endSec: 4.0, highlightColor: '#ffffff' },
          { id: 'w8', word: 'SECRET', startSec: 4.0, endSec: 4.8, highlightColor: '#ec4899', isEmphasized: true },
          { id: 'w9', word: 'IS', startSec: 4.8, endSec: 5.2, highlightColor: '#ffffff' },
          { id: 'w10', word: 'AUTOMATION', startSec: 5.2, endSec: 6.2, highlightColor: '#38bdf8', isEmphasized: true },
          { id: 'w11', word: 'AND', startSec: 6.2, endSec: 6.6, highlightColor: '#ffffff' },
          { id: 'w12', word: 'SPEED!', startSec: 6.6, endSec: 7.5, highlightColor: '#fde047', isEmphasized: true },
        ],
      },
    ];
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
