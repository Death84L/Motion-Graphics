import { CaptionWord, WordEmphasisType } from '../captionModel';

export interface SemanticEmphasisRule {
  minWordLength: number;
  highlightNumbers: boolean;
  highlightPunctuation: boolean;
  highlightAllCaps: boolean;
  preferredEmphasisStyle: WordEmphasisType;
}

export const DEFAULT_EMPHASIS_RULE: SemanticEmphasisRule = {
  minWordLength: 3,
  highlightNumbers: true,
  highlightPunctuation: true,
  highlightAllCaps: true,
  preferredEmphasisStyle: 'pop',
};

/**
 * Deterministically analyzes transcript words and assigns kinematic emphasis without API costs.
 */
export function applySemanticEmphasisToWords(
  words: CaptionWord[],
  rule: SemanticEmphasisRule = DEFAULT_EMPHASIS_RULE
): CaptionWord[] {
  return words.map((w) => {
    let emphasis: WordEmphasisType = 'none';

    // 1. ALL CAPS Detection
    if (rule.highlightAllCaps && w.text === w.text.toUpperCase() && w.text.length >= rule.minWordLength && !/^\d+$/.test(w.text)) {
      emphasis = 'pop';
    }

    // 2. Numbers & Percentages (e.g. 100%, 3X, 500)
    else if (rule.highlightNumbers && /\d+[%xXkKMm]?/.test(w.text)) {
      emphasis = 'color-punch';
    }

    // 3. Exclamation / Question marks
    else if (rule.highlightPunctuation && (w.text.includes('!') || w.text.includes('?'))) {
      emphasis = 'glow';
    }

    // 4. Power words detection
    else if (/^(huge|amazing|crazy|massive|important|never|always|best|secret|free)$/i.test(w.text)) {
      emphasis = rule.preferredEmphasisStyle;
    }

    return {
      ...w,
      emphasis,
    };
  });
}
