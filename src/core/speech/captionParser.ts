export interface ParsedCaptionCue {
  id: number;
  startSec: number;
  endSec: number;
  text: string;
  words: {
    word: string;
    startSec: number;
    endSec: number;
    isEmphasized?: boolean;
    emoji?: string;
  }[];
}

const EMOJI_KEYWORD_MAP: Record<string, string> = {
  money: '💰',
  cash: '💵',
  rich: '💎',
  wealth: '📈',
  profit: '💰',
  fire: '🔥',
  hot: '🔥',
  rocket: '🚀',
  launch: '🚀',
  growth: '📈',
  grow: '🌱',
  brain: '🧠',
  mind: '🧠',
  idea: '💡',
  think: '💡',
  time: '⏱️',
  clock: '⏰',
  fast: '⚡',
  speed: '⚡',
  target: '🎯',
  goal: '🎯',
  focus: '🎯',
  love: '❤️',
  heart: '❤️',
  like: '👍',
  warning: '⚠️',
  danger: '🚨',
  stop: '🛑',
  win: '🏆',
  winner: '👑',
  king: '👑',
  star: '⭐',
  power: '⚡',
  secret: '🤫',
  code: '💻',
  tech: '🤖',
  video: '🎬',
  music: '🎵',
};

export class CaptionParser {
  /**
   * Attaches contextual auto-emojis based on semantic keywords.
   */
  static getEmojiForWord(word: string): string | undefined {
    const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    return EMOJI_KEYWORD_MAP[clean];
  }

  /**
   * Parses standard SubRip (.srt) subtitle text.
   */
  static parseSrt(srtContent: string): ParsedCaptionCue[] {
    const cues: ParsedCaptionCue[] = [];
    const blocks = srtContent.trim().split(/\n\s*\n/);

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length >= 2) {
        const timeLine = lines.find((l) => l.includes('-->')) || lines[1];
        const timeMatch = timeLine?.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/);

        if (timeMatch) {
          const startSec =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]) +
            parseInt(timeMatch[4]) / 1000;

          const endSec =
            parseInt(timeMatch[5]) * 3600 +
            parseInt(timeMatch[6]) * 60 +
            parseInt(timeMatch[7]) +
            parseInt(timeMatch[8]) / 1000;

          const textLines = lines.slice(lines.indexOf(timeLine) + 1).join(' ');
          const wordsList = textLines.split(/\s+/).filter(Boolean);
          const durPerWord = (endSec - startSec) / (wordsList.length || 1);

          const words = wordsList.map((w, wIdx) => {
            const wStart = startSec + wIdx * durPerWord;
            const wEnd = wStart + durPerWord * 0.95;
            return {
              word: w,
              startSec: Math.round(wStart * 100) / 100,
              endSec: Math.round(wEnd * 100) / 100,
              isEmphasized: w.length > 5 || wIdx % 3 === 0,
              emoji: this.getEmojiForWord(w),
            };
          });

          cues.push({
            id: idx + 1,
            startSec: Math.round(startSec * 100) / 100,
            endSec: Math.round(endSec * 100) / 100,
            text: textLines,
            words,
          });
        }
      }
    });

    return cues;
  }

  /**
   * Parses WebVTT (.vtt) format.
   */
  static parseVtt(vttContent: string): ParsedCaptionCue[] {
    const cleanVtt = vttContent.replace(/^WEBVTT[^\n]*\n/, '');
    return this.parseSrt(cleanVtt);
  }

  /**
   * Parses Whisper / Descript word-level JSON format.
   */
  static parseWordJson(jsonStr: string): ParsedCaptionCue[] {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: idx + 1,
          startSec: item.start || item.startSec || 0,
          endSec: item.end || item.endSec || 1,
          text: item.text || item.word || '',
          words: (item.words || [{ word: item.text || '', start: item.start, end: item.end }]).map((w: any) => ({
            word: w.word || w.text || '',
            startSec: w.start || 0,
            endSec: w.end || 1,
            isEmphasized: true,
            emoji: this.getEmojiForWord(w.word || w.text || ''),
          })),
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  }
}
