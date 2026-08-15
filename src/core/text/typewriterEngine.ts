export interface TypewriterConfig {
  charactersPerSecond: number; // e.g. 15 chars/sec
  cursorBlinkRateHz: number; // e.g. 2 Hz
  simulateTypos: boolean;
  pauseOnPunctuationFrames: number;
}

export const DEFAULT_TYPEWRITER_CONFIG: TypewriterConfig = {
  charactersPerSecond: 18,
  cursorBlinkRateHz: 2.0,
  simulateTypos: false,
  pauseOnPunctuationFrames: 8,
};

export interface TypewriterFrameState {
  visibleText: string;
  cursorVisible: boolean;
  currentCharIndex: number;
  isComplete: boolean;
}

/**
 * Computes typewriter reveal progress, character slice, and cursor blinking at a specific frame.
 */
export function evaluateTypewriterAtFrame(
  fullText: string,
  currentFrame: number,
  fps = 30,
  config: TypewriterConfig = DEFAULT_TYPEWRITER_CONFIG
): TypewriterFrameState {
  if (!fullText) {
    return { visibleText: '', cursorVisible: true, currentCharIndex: 0, isComplete: true };
  }

  const framesPerChar = fps / config.charactersPerSecond;
  const rawCharCount = Math.floor(currentFrame / framesPerChar);
  const clampedIndex = Math.min(fullText.length, Math.max(0, rawCharCount));

  const visibleText = fullText.slice(0, clampedIndex);
  const isComplete = clampedIndex >= fullText.length;

  // Cursor blink oscillation
  const timeSeconds = currentFrame / fps;
  const cursorVisible = Math.floor(timeSeconds * config.cursorBlinkRateHz * 2) % 2 === 0;

  return {
    visibleText,
    cursorVisible,
    currentCharIndex: clampedIndex,
    isComplete,
  };
}
