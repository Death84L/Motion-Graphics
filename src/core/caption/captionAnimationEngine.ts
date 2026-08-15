import { CaptionSegment, CaptionWord, CaptionAnimationPreset } from './captionModel';

export interface EvaluatedWordAnimation {
  wordId: string;
  text: string;
  isActive: boolean;
  isPast: boolean;
  karaokeFillPercent: number; // 0 to 100%
  scale: number;
  translateY: number;
  glowIntensity: number;
  colorOverride?: string;
}

export interface EvaluatedCaptionFrame {
  activeSegment: CaptionSegment | null;
  evaluatedWords: EvaluatedWordAnimation[];
}

/**
 * Evaluates the animated transformation, karaoke sweep, and emphasis pops for all words at current timestamp.
 */
export function evaluateCaptionAnimationAtTime(
  captions: CaptionSegment[],
  currentTimeSec: number,
  globalPreset: CaptionAnimationPreset = 'word-pop'
): EvaluatedCaptionFrame {
  const activeSegment = captions.find(
    (c) => currentTimeSec >= c.startSec && currentTimeSec <= c.endSec
  ) || null;

  if (!activeSegment) {
    return { activeSegment: null, evaluatedWords: [] };
  }

  const preset = activeSegment.animationPreset || globalPreset;

  const evaluatedWords: EvaluatedWordAnimation[] = activeSegment.words.map((w, idx) => {
    const isActive = currentTimeSec >= w.startSec && currentTimeSec < w.endSec;
    const isPast = currentTimeSec >= w.endSec;

    let fillPct = 0;
    if (isPast) {
      fillPct = 100;
    } else if (isActive) {
      const dur = Math.max(0.01, w.endSec - w.startSec);
      fillPct = Math.min(100, Math.max(0, ((currentTimeSec - w.startSec) / dur) * 100));
    }

    let scale = 1.0;
    let ty = 0;
    let glow = 0;

    if (isActive) {
      const dur = Math.max(0.01, w.endSec - w.startSec);
      const progress = (currentTimeSec - w.startSec) / dur;

      switch (preset) {
        case 'word-pop': {
          // Dynamic scale punch with settle
          if (progress < 0.4) {
            scale = 1.0 + Math.sin((progress / 0.4) * Math.PI) * 0.18;
            ty = -3;
          } else {
            scale = 1.0 + (1 - progress) * 0.05;
          }
          glow = 16;
          break;
        }

        case 'energetic-bounce': {
          const bounce = Math.abs(Math.sin(progress * Math.PI * 3)) * (1 - progress);
          ty = -bounce * 8;
          scale = 1.0 + bounce * 0.15;
          glow = 20;
          break;
        }

        case 'word-wave': {
          ty = Math.sin(currentTimeSec * 8 + idx * 0.5) * 4;
          glow = 10;
          break;
        }

        case 'karaoke-fill':
        case 'smooth-fade':
        case 'minimal-highlight':
        default:
          scale = 1.04;
          glow = 12;
          break;
      }

      // Word Emphasis Multiplier
      if (w.emphasis === 'pop' || w.emphasis === 'bounce') {
        scale *= 1.1;
      } else if (w.emphasis === 'glow') {
        glow += 15;
      }
    }

    return {
      wordId: w.id,
      text: w.text,
      isActive,
      isPast,
      karaokeFillPercent: Math.round(fillPct),
      scale: Math.round(scale * 100) / 100,
      translateY: Math.round(ty * 10) / 10,
      glowIntensity: Math.round(glow),
      colorOverride: w.colorOverride,
    };
  });

  return {
    activeSegment,
    evaluatedWords,
  };
}
