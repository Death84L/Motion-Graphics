export type AssetType = 'image' | 'video' | 'audio' | 'svg' | 'font' | 'lottie' | 'logo';

export interface AssetSlot {
  id: string;
  placeholderTag: string; // e.g. '{{LOGO}}'
  name: string;
  type: AssetType;
  currentSrc: string;
  cropX: number;
  cropY: number;
  featherPx: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  opacity: number;
}

export const DEFAULT_ASSET_SLOTS: AssetSlot[] = [
  {
    id: 'slot-logo',
    placeholderTag: '{{LOGO}}',
    name: 'Brand Logo Asset',
    type: 'logo',
    currentSrc: '/assets/brand-logo.svg',
    cropX: 0,
    cropY: 0,
    featherPx: 0,
    blendMode: 'normal',
    opacity: 1.0,
  },
  {
    id: 'slot-hero-img',
    placeholderTag: '{{HERO_IMAGE}}',
    name: 'Hero Background Media',
    type: 'image',
    currentSrc: '/assets/hero-bg.jpg',
    cropX: 0,
    cropY: 0,
    featherPx: 4,
    blendMode: 'overlay',
    opacity: 0.85,
  },
];

/**
 * Replaces asset slot contents in a template without modifying keyframe timing or curves.
 */
export function replaceAssetSlotContent(
  slots: AssetSlot[],
  slotId: string,
  newSrc: string
): AssetSlot[] {
  return slots.map((s) => (s.id === slotId ? { ...s, currentSrc: newSrc } : s));
}
