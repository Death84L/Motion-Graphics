export type TextTargetScope = 'character' | 'word' | 'line' | 'paragraph';

export type TextDirectionOrder =
  | 'left-to-right'
  | 'right-to-left'
  | 'center-out'
  | 'outside-in'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'random'
  | 'odd-even'
  | 'wave';

export interface TextTokenItem {
  id: string;
  index: number;
  text: string;
  normalizedOrder: number; // 0 to 1
  frameDelay: number;
}

/**
 * Tokenizes raw text by character, word, or line, and computes spatial stagger offsets in any directional order.
 */
export function tokenizeTextWithSpatialOrder(
  text: string,
  scope: TextTargetScope = 'character',
  order: TextDirectionOrder = 'left-to-right',
  intervalFrames = 3,
  randomnessPercent = 0
): TextTokenItem[] {
  if (!text) return [];

  let rawTokens: string[] = [];

  switch (scope) {
    case 'word':
      rawTokens = text.split(/(\s+)/).filter((t) => t.length > 0);
      break;
    case 'line':
      rawTokens = text.split('\n');
      break;
    case 'paragraph':
      rawTokens = text.split(/\n\n+/);
      break;
    case 'character':
    default:
      rawTokens = text.split('');
      break;
  }

  const count = rawTokens.length;
  if (count === 0) return [];
  if (count === 1) {
    return [{ id: 'tok-0', index: 0, text: rawTokens[0], normalizedOrder: 0, frameDelay: 0 }];
  }

  const items: TextTokenItem[] = [];

  for (let i = 0; i < count; i++) {
    let norm = i / (count - 1);

    switch (order) {
      case 'right-to-left':
      case 'bottom-to-top':
        norm = 1 - norm;
        break;

      case 'center-out': {
        const mid = (count - 1) / 2;
        norm = Math.abs(i - mid) / (mid || 1);
        break;
      }

      case 'outside-in': {
        const mid = (count - 1) / 2;
        norm = 1 - Math.abs(i - mid) / (mid || 1);
        break;
      }

      case 'odd-even': {
        norm = i % 2 === 0 ? (i / count) * 0.5 : 0.5 + (i / count) * 0.5;
        break;
      }

      case 'wave': {
        norm = Math.sin((i / (count - 1)) * Math.PI);
        break;
      }

      case 'random': {
        norm = Math.random();
        break;
      }

      case 'left-to-right':
      case 'top-to-bottom':
      default:
        break;
    }

    let delay = norm * (count - 1) * intervalFrames;

    if (randomnessPercent > 0) {
      const jitter = (Math.random() - 0.5) * 2 * (randomnessPercent / 100) * intervalFrames * 2;
      delay = Math.max(0, delay + jitter);
    }

    items.push({
      id: `tok-${i}`,
      index: i,
      text: rawTokens[i],
      normalizedOrder: Math.round(norm * 100) / 100,
      frameDelay: Math.round(delay),
    });
  }

  return items;
}
