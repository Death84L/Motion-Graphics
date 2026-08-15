import { KeyframePoint } from '../../features/graph-editor/types';
import { PremiereAdapter } from '../../adapters/premiere/PremiereAdapter';
import { generateLottieJson, generateCssLinearEasing } from '../export/webExporters';

export type SupportedHostApp = 'premiere' | 'aftereffects' | 'resolve' | 'lottie' | 'css' | 'motion-studio';

export interface CrossAppClipboardPayload {
  format: 'MotionStudio_Universal_v2';
  timestamp: number;
  sourceApp: SupportedHostApp;
  fps: number;
  keyframes: KeyframePoint[];
  adobeClipboardText?: string;
  lottieJson?: string;
  cssLinear?: string;
}

/**
 * Universal Cross-Application Clipboard Encoder.
 */
export function encodeCrossAppClipboard(
  keyframes: KeyframePoint[],
  sourceApp: SupportedHostApp = 'motion-studio',
  fps = 30
): CrossAppClipboardPayload {
  const adobeClip = PremiereAdapter.generateAdobeClipboard(keyframes, {
    property: 'Position',
    fps,
    durationFrames: 100,
  });

  return {
    format: 'MotionStudio_Universal_v2',
    timestamp: Date.now(),
    sourceApp,
    fps,
    keyframes,
    adobeClipboardText: adobeClip,
    lottieJson: generateLottieJson(keyframes, { fps }),
    cssLinear: generateCssLinearEasing(keyframes),
  };
}

/**
 * Attempts to parse arbitrary incoming clipboard text from After Effects, Premiere, or JSON.
 */
export function parseIncomingClipboard(rawText: string): KeyframePoint[] | null {
  if (!rawText) return null;

  // 1. Check if Motion Studio Universal JSON
  try {
    const parsed = JSON.parse(rawText);
    if (parsed.keyframes && Array.isArray(parsed.keyframes)) {
      return parsed.keyframes;
    }
    if (Array.isArray(parsed) && parsed[0]?.time !== undefined) {
      return parsed;
    }
  } catch (err) {
    // Not JSON, continue to regex parser
  }

  // 2. Sniff Adobe After Effects / Premiere Pro Text Format
  if (rawText.includes('Adobe After Effects') || rawText.includes('Frame') || rawText.includes('percent')) {
    const lines = rawText.split('\n');
    const keys: KeyframePoint[] = [];

    lines.forEach((line, idx) => {
      const match = line.match(/(\d+)\s+([\d.-]+)/);
      if (match) {
        const frame = parseFloat(match[1]);
        const val = parseFloat(match[2]);
        if (!isNaN(frame) && !isNaN(val)) {
          keys.push({
            id: 8800 + idx,
            time: Math.min(100, frame),
            value: val,
            type: 'bezier',
            ease: 'easeInOut',
          });
        }
      }
    });

    if (keys.length > 0) return keys;
  }

  return null;
}
