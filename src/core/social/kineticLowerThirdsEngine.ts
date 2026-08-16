export interface SpeakerBadgeConfig {
  speakerId: string;
  name: string;
  handle: string;
  role: string;
  badgeTheme: 'cyan-neon' | 'minimal-dark' | 'creator-yellow' | 'luxury-gold';
}

export interface CtaOverlayConfig {
  headline: string;
  subtext: string;
  buttonText: string;
  triggerTimeSec: number;
  durationSec: number;
  style: 'subscribe-pulse' | 'follow-glass' | 'link-pill';
}

export class KineticLowerThirdsEngine {
  /**
   * Generates speaker badge rendering styles.
   */
  static getSpeakerBadgeStyle(theme: 'cyan-neon' | 'minimal-dark' | 'creator-yellow' | 'luxury-gold') {
    switch (theme) {
      case 'cyan-neon':
        return {
          background: 'rgba(9, 14, 26, 0.88)',
          border: '1px solid #38bdf8',
          textColor: '#f8fafc',
          handleColor: '#38bdf8',
          boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
        };
      case 'creator-yellow':
        return {
          background: '#fde047',
          border: '1px solid #000000',
          textColor: '#040711',
          handleColor: '#040711',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
        };
      case 'luxury-gold':
        return {
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          border: '1px solid #fbbf24',
          textColor: '#fbbf24',
          handleColor: '#fde68a',
          boxShadow: '0 0 16px rgba(251, 191, 36, 0.4)',
        };
      case 'minimal-dark':
      default:
        return {
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid #334155',
          textColor: '#ffffff',
          handleColor: '#94a3b8',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
        };
    }
  }

  /**
   * Determines if a speaker lower-third badge should be visible at given timestamp.
   */
  static isBadgeVisible(
    currentTimeSec: number,
    speakerStartSec: number,
    speakerEndSec: number,
    displayDurationSec = 3.5
  ): { isVisible: boolean; opacity: number; translateYPx: number } {
    if (currentTimeSec < speakerStartSec || currentTimeSec > speakerEndSec) {
      return { isVisible: false, opacity: 0, translateYPx: 12 };
    }

    const elapsed = currentTimeSec - speakerStartSec;
    if (elapsed > displayDurationSec) {
      // Fade out after displayDurationSec
      return { isVisible: false, opacity: 0, translateYPx: 12 };
    }

    // Smooth spring entrance in first 0.35s
    if (elapsed < 0.35) {
      const progress = elapsed / 0.35;
      return { isVisible: true, opacity: progress, translateYPx: (1 - progress) * 12 };
    }

    return { isVisible: true, opacity: 1, translateYPx: 0 };
  }
}
