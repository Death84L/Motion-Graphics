import { KeyframePoint } from '../../features/graph-editor/types';

export interface TimedWord {
  word: string;
  startSec: number;
  endSec: number;
  isEmphasized: boolean;
}

export class SpeechToMotionEngine {
  /**
   * Generates timed words from raw transcript string and audio duration.
   */
  static generateTimedTranscript(rawText: string, totalDurationSec = 6.0): TimedWord[] {
    const words = rawText.split(' ').filter(Boolean);
    const durationPerWord = totalDurationSec / (words.length || 1);

    return words.map((w, idx) => {
      const start = idx * durationPerWord;
      const end = start + durationPerWord * 0.9;
      const isEmphasized = w.length > 5 || idx % 4 === 0;

      return {
        word: w,
        startSec: Math.round(start * 100) / 100,
        endSec: Math.round(end * 100) / 100,
        isEmphasized,
      };
    });
  }

  /**
   * Evaluates active word highlight at playhead time t.
   */
  static getActiveWordIndex(words: TimedWord[], currentTimeSec: number): number {
    return words.findIndex((w) => currentTimeSec >= w.startSec && currentTimeSec <= w.endSec);
  }

  /**
   * Bakes Speech Emphasis Pops into Standard Keyframes.
   */
  static bakeSpeechToKeyframes(words: TimedWord[]): KeyframePoint[] {
    const keyframes: KeyframePoint[] = [];

    words.forEach((w, idx) => {
      if (w.isEmphasized) {
        keyframes.push({
          id: 9950 + idx,
          time: Math.round((w.startSec / (words[words.length - 1]?.endSec || 1)) * 100 * 10) / 10,
          value: 120, // 120% scale pop
          type: 'bezier',
          handleIn: { x: 0.2, y: 120 },
          handleOut: { x: 0.2, y: 120 },
        });
      }
    });

    return keyframes;
  }
}
