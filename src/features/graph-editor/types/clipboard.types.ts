import { KeyframePoint, BezierHandle } from './keyframe.types';

export type ClipboardMode = 'keyframes' | 'timing' | 'values' | 'handles' | 'segment';

export interface ClipboardPayload {
  mode: ClipboardMode;
  keyframes: KeyframePoint[];
  duration: number;
  valueSpan: number;
  handles?: { handleIn?: BezierHandle; handleOut?: BezierHandle };
  copiedAt: number;
}
