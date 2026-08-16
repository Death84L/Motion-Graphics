export type RetentionHookStyle =
  | 'viral-yellow'
  | 'cyberpunk-neon'
  | 'luxury-gold'
  | 'clean-minimal-white';

export interface RetentionHookThemeConfig {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  boxShadow: string;
  fontSizePx: number;
}

export interface EmojiReactionTrigger {
  emoji: string;
  timestampSec: number;
  animationType: 'bounce-up' | 'pop-scale' | 'spin-burst';
}

export class ViralRetentionEngine {
  /**
   * Returns exact CSS and render styling for chosen retention hook theme.
   */
  static getRetentionHookTheme(style: RetentionHookStyle): RetentionHookThemeConfig {
    switch (style) {
      case 'viral-yellow':
        return {
          backgroundColor: '#fde047',
          textColor: '#040711',
          borderColor: '#eab308',
          boxShadow: '0 8px 24px rgba(234, 179, 8, 0.45)',
          fontSizePx: 12,
        };
      case 'cyberpunk-neon':
        return {
          backgroundColor: 'rgba(5, 8, 20, 0.85)',
          textColor: '#38bdf8',
          borderColor: '#ec4899',
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 0 8px rgba(56, 189, 248, 0.6)',
          fontSizePx: 12,
        };
      case 'luxury-gold':
        return {
          backgroundColor: 'linear-gradient(135deg, #d97706, #b45309)',
          textColor: '#ffffff',
          borderColor: '#f59e0b',
          boxShadow: '0 8px 24px rgba(217, 119, 6, 0.4)',
          fontSizePx: 12,
        };
      case 'clean-minimal-white':
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          textColor: '#0f172a',
          borderColor: '#cbd5e1',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          fontSizePx: 12,
        };
    }
  }

  /**
   * Generates timestamped viral emoji reaction triggers for retention spikes.
   */
  static generateReactionTriggers(durationSec: number): EmojiReactionTrigger[] {
    const emojis = ['🔥', '🚀', '🤯', '💡', '📈'];
    const triggers: EmojiReactionTrigger[] = [];

    const timestamps = [1.2, 4.5, 8.0, 11.5];
    timestamps.forEach((t, idx) => {
      if (t < durationSec) {
        triggers.push({
          emoji: emojis[idx % emojis.length],
          timestampSec: t,
          animationType: idx % 2 === 0 ? 'bounce-up' : 'pop-scale',
        });
      }
    });

    return triggers;
  }
}
