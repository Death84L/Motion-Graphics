import { KeyframePoint, ClipboardPayload, ClipboardMode } from '../types';

let memoryClipboard: ClipboardPayload | null = null;

export const clipboardManager = {
  copy(keyframes: KeyframePoint[], mode: ClipboardMode = 'keyframes'): ClipboardPayload {
    const sorted = [...keyframes].sort((a, b) => a.time - b.time);
    const duration = sorted.length > 1 ? sorted[sorted.length - 1].time - sorted[0].time : 0;
    const values = sorted.map((k) => k.value);
    const valueSpan = values.length > 1 ? Math.max(...values) - Math.min(...values) : 0;

    const payload: ClipboardPayload = {
      mode,
      keyframes: JSON.parse(JSON.stringify(sorted)),
      duration,
      valueSpan,
      copiedAt: Date.now(),
    };

    memoryClipboard = payload;
    return payload;
  },

  get(): ClipboardPayload | null {
    return memoryClipboard ? JSON.parse(JSON.stringify(memoryClipboard)) : null;
  },

  hasData(): boolean {
    return memoryClipboard !== null && memoryClipboard.keyframes.length > 0;
  },

  paste(
    currentKeyframes: KeyframePoint[],
    options: {
      pasteAtTime?: number;
      relativeOffset?: boolean;
      stretchToDuration?: number;
    } = {}
  ): KeyframePoint[] {
    if (!memoryClipboard || memoryClipboard.keyframes.length === 0) return currentKeyframes;

    const clip = memoryClipboard.keyframes;
    const baseTime = clip[0].time;
    const pasteTargetTime = options.pasteAtTime ?? baseTime;
    const timeDelta = pasteTargetTime - baseTime;

    const newKeyframes: KeyframePoint[] = clip.map((kf, i) => {
      let t = kf.time + timeDelta;
      if (options.stretchToDuration && memoryClipboard!.duration > 0) {
        const norm = (kf.time - baseTime) / memoryClipboard!.duration;
        t = pasteTargetTime + norm * options.stretchToDuration;
      }

      return {
        ...kf,
        id: Date.now() + i + Math.floor(Math.random() * 1000),
        time: Math.max(0, Math.min(100, Math.round(t * 10) / 10)),
      };
    });

    // Merge and sort
    const existingFiltered = currentKeyframes.filter(
      (k) => !newKeyframes.some((nk) => Math.abs(nk.time - k.time) < 0.5)
    );

    return [...existingFiltered, ...newKeyframes].sort((a, b) => a.time - b.time);
  },
};
