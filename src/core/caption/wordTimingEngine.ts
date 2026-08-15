import { CaptionWord, CaptionSegment } from './captionModel';

/**
 * Automatically calculates word-level timestamps when provided a segment duration and text.
 */
export function generateWordTimingsForText(
  text: string,
  startSec: number,
  endSec: number
): CaptionWord[] {
  const cleanTokens = text.trim().split(/\s+/).filter((t) => t.length > 0);
  if (cleanTokens.length === 0) return [];

  const totalDuration = Math.max(0.1, endSec - startSec);
  const totalChars = cleanTokens.reduce((acc, w) => acc + w.length, 0);

  let currentStart = startSec;

  return cleanTokens.map((w, idx) => {
    // Duration proportioned by character length (with minimum 0.15s per word)
    const weight = w.length / (totalChars || 1);
    const wordDur = Math.max(0.12, totalDuration * weight);
    const wordEnd = idx === cleanTokens.length - 1 ? endSec : Math.min(endSec, currentStart + wordDur);

    // Auto-detect emphasis
    let emphasis: CaptionWord['emphasis'] = 'none';
    if (w === w.toUpperCase() && w.length > 3) {
      emphasis = 'pop';
    } else if (w.includes('!') || w.includes('?')) {
      emphasis = 'glow';
    }

    const wordItem: CaptionWord = {
      id: `w-${Date.now()}-${idx}`,
      text: w,
      startSec: Math.round(currentStart * 100) / 100,
      endSec: Math.round(wordEnd * 100) / 100,
      emphasis,
    };

    currentStart = wordEnd;
    return wordItem;
  });
}

/**
 * Smart line breaker that keeps semantic phrases intact instead of blind character truncation.
 */
export function formatSmartCaptionLines(
  words: CaptionWord[],
  maxCharsPerLine = 26,
  maxLines: 1 | 2 | 3 = 2
): string[] {
  if (words.length === 0) return [];

  const lines: string[] = [];
  let currentLineWords: string[] = [];
  let currentLineCharCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i].text;
    const wordLen = word.length + (currentLineWords.length > 0 ? 1 : 0);

    if (currentLineCharCount + wordLen > maxCharsPerLine && currentLineWords.length > 0) {
      if (lines.length < maxLines - 1) {
        lines.push(currentLineWords.join(' '));
        currentLineWords = [word];
        currentLineCharCount = word.length;
      } else {
        // Append to last line
        currentLineWords.push(word);
        currentLineCharCount += wordLen;
      }
    } else {
      currentLineWords.push(word);
      currentLineCharCount += wordLen;
    }
  }

  if (currentLineWords.length > 0) {
    lines.push(currentLineWords.join(' '));
  }

  return lines;
}
