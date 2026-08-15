export type CaptionDeliveryTag = 'shout' | 'whisper' | 'laugh' | 'sarcasm' | 'pause' | 'emphasis';

export interface EmotionTagStyleModifier {
  scaleMultiplier: number;
  opacityMultiplier: number;
  textColor?: string;
  isItalic?: boolean;
  shake?: boolean;
  extraPauseSec?: number;
}

export const DELIVERY_TAG_STYLES: Record<CaptionDeliveryTag, EmotionTagStyleModifier> = {
  shout: { scaleMultiplier: 1.18, opacityMultiplier: 1.0, textColor: '#ef4444', shake: true },
  whisper: { scaleMultiplier: 0.88, opacityMultiplier: 0.75, textColor: '#94a3b8', isItalic: true },
  laugh: { scaleMultiplier: 1.05, opacityMultiplier: 1.0, textColor: '#f59e0b', shake: true },
  sarcasm: { scaleMultiplier: 1.0, opacityMultiplier: 0.9, textColor: '#a855f7', isItalic: true },
  pause: { scaleMultiplier: 1.0, opacityMultiplier: 1.0, extraPauseSec: 0.4 },
  emphasis: { scaleMultiplier: 1.12, opacityMultiplier: 1.0, textColor: '#38bdf8' },
};

/**
 * Strips delivery tags like [SHOUT] from text while extracting the active delivery style modifiers.
 */
export function extractDeliveryTags(rawText: string): { cleanText: string; tags: CaptionDeliveryTag[] } {
  const tags: CaptionDeliveryTag[] = [];
  const cleanText = rawText.replace(/\[(SHOUT|WHISPER|LAUGH|SARCASM|PAUSE|EMPHASIS)\]/gi, (match, tag) => {
    tags.push(tag.toLowerCase() as CaptionDeliveryTag);
    return '';
  }).trim();

  return { cleanText, tags };
}
