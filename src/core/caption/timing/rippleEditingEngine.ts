import { CaptionSegment } from '../captionModel';

export type RippleMode = 'ripple-forward' | 'ripple-backward' | 'push-pull' | 'preserve-gaps';

/**
 * Adjusts a target caption segment timing and automatically ripples subsequent/preceding captions.
 */
export function applyRippleTimingEdit(
  captions: CaptionSegment[],
  targetSegmentId: string,
  newStartSec: number,
  newEndSec: number,
  mode: RippleMode = 'ripple-forward'
): CaptionSegment[] {
  const targetIdx = captions.findIndex((c) => c.id === targetSegmentId);
  if (targetIdx === -1) return captions;

  const originalTarget = captions[targetIdx];
  const deltaEnd = newEndSec - originalTarget.endSec;
  const deltaStart = newStartSec - originalTarget.startSec;

  return captions.map((c, idx) => {
    if (idx === targetIdx) {
      return {
        ...c,
        startSec: newStartSec,
        endSec: newEndSec,
      };
    }

    if (idx > targetIdx && (mode === 'ripple-forward' || mode === 'preserve-gaps')) {
      const shift = deltaEnd;
      return {
        ...c,
        startSec: Math.max(0, Math.round((c.startSec + shift) * 100) / 100),
        endSec: Math.max(0, Math.round((c.endSec + shift) * 100) / 100),
        words: c.words.map((w) => ({
          ...w,
          startSec: Math.max(0, Math.round((w.startSec + shift) * 100) / 100),
          endSec: Math.max(0, Math.round((w.endSec + shift) * 100) / 100),
        })),
      };
    }

    if (idx < targetIdx && mode === 'ripple-backward') {
      const shift = deltaStart;
      return {
        ...c,
        startSec: Math.max(0, Math.round((c.startSec + shift) * 100) / 100),
        endSec: Math.max(0, Math.round((c.endSec + shift) * 100) / 100),
      };
    }

    return c;
  });
}
