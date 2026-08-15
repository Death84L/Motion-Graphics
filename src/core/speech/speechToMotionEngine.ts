import { KeyframePoint } from '../../features/graph-editor/types';
import { CaptionParser, ParsedCaptionCue } from './captionParser';
import { TrendyCaptionPreset, TRENDY_CAPTION_PRESETS } from './trendyCaptionPresets';

export interface TimedWord {
  word: string;
  startSec: number;
  endSec: number;
  isEmphasized: boolean;
  emoji?: string;
}

export type CaptionChunkMode = 'one-word' | 'two-three-words' | 'full-line';

export class SpeechToMotionEngine {
  /**
   * Generates timed words from raw transcript string and audio duration.
   */
  static generateTimedTranscript(rawText: string, totalDurationSec = 6.0, autoEmoji = true): TimedWord[] {
    const words = rawText.split(/\s+/).filter(Boolean);
    const durationPerWord = totalDurationSec / (words.length || 1);

    return words.map((w, idx) => {
      const start = idx * durationPerWord;
      const end = start + durationPerWord * 0.95;
      const isEmphasized = w.length > 5 || idx % 4 === 0;

      return {
        word: w,
        startSec: Math.round(start * 100) / 100,
        endSec: Math.round(end * 100) / 100,
        isEmphasized,
        emoji: autoEmoji ? CaptionParser.getEmojiForWord(w) : undefined,
      };
    });
  }

  /**
   * Parses uploaded subtitle file content (.srt, .vtt, or .json) into TimedWords.
   */
  static parseUploadedFile(fileContent: string, fileExtension: string, autoEmoji = true): TimedWord[] {
    let cues: ParsedCaptionCue[] = [];
    const ext = fileExtension.toLowerCase().replace('.', '');

    if (ext === 'srt') {
      cues = CaptionParser.parseSrt(fileContent);
    } else if (ext === 'vtt') {
      cues = CaptionParser.parseVtt(fileContent);
    } else if (ext === 'json') {
      cues = CaptionParser.parseWordJson(fileContent);
    } else {
      // Default plain text fallback
      return this.generateTimedTranscript(fileContent, 6.0, autoEmoji);
    }

    const allWords: TimedWord[] = [];
    cues.forEach((c) => {
      c.words.forEach((w) => {
        allWords.push({
          word: w.word,
          startSec: w.startSec,
          endSec: w.endSec,
          isEmphasized: w.isEmphasized || false,
          emoji: autoEmoji ? (w.emoji || CaptionParser.getEmojiForWord(w.word)) : undefined,
        });
      });
    });

    return allWords.length > 0 ? allWords : this.generateTimedTranscript(fileContent, 6.0, autoEmoji);
  }

  /**
   * Evaluates active word index at playhead time t.
   */
  static getActiveWordIndex(words: TimedWord[], currentTimeSec: number): number {
    return words.findIndex((w) => currentTimeSec >= w.startSec && currentTimeSec <= w.endSec);
  }

  /**
   * Chunks words for display (1-word, 2-3 words, or full line).
   */
  static chunkWordsForDisplay(words: TimedWord[], activeIndex: number, mode: CaptionChunkMode): TimedWord[] {
    if (words.length === 0) return [];
    if (mode === 'one-word') {
      const idx = Math.max(0, Math.min(words.length - 1, activeIndex >= 0 ? activeIndex : 0));
      return [words[idx]];
    } else if (mode === 'two-three-words') {
      const targetIdx = Math.max(0, activeIndex >= 0 ? activeIndex : 0);
      const chunkStart = Math.floor(targetIdx / 3) * 3;
      return words.slice(chunkStart, chunkStart + 3);
    } else {
      // Full Line (6-8 words)
      const targetIdx = Math.max(0, activeIndex >= 0 ? activeIndex : 0);
      const chunkStart = Math.floor(targetIdx / 7) * 7;
      return words.slice(chunkStart, chunkStart + 7);
    }
  }

  /**
   * Bakes Speech Emphasis Pops and Trajectories into Standard Bézier Keyframes.
   */
  static bakeSpeechToKeyframes(words: TimedWord[], preset: TrendyCaptionPreset): KeyframePoint[] {
    const keyframes: KeyframePoint[] = [];
    const totalDur = words[words.length - 1]?.endSec || 1.0;

    words.forEach((w, idx) => {
      const timePercent = Math.round((w.startSec / totalDur) * 100 * 10) / 10;
      const peakVal = w.isEmphasized ? preset.scaleActive * 100 : 100;

      keyframes.push({
        id: 9950 + idx * 2,
        time: timePercent,
        value: peakVal,
        type: 'bezier',
        handleIn: { x: 0.2, y: peakVal },
        handleOut: { x: 0.2, y: peakVal },
      });
    });

    return keyframes;
  }
}
